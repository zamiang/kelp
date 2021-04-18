import { uniq } from 'lodash';
import RollbarErrorTracking from '../../error-tracking/rollbar';
import { IDocument } from '../data-types';
import { dbType } from '../db';

export const getIdFromLink = (link: string) =>
  link
    .replace('https://docs.google.com/document/d/', '')
    .replace('https://docs.google.com/presentation/d/', '')
    .replace('https://docs.google.com/spreadsheets/d/', '')
    .split('/')[0];

export default class DocumentModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up person store');
    this.db = db;
  }

  async addDocuments(documents: IDocument[], shouldClearStore?: boolean) {
    if (shouldClearStore) {
      const existingDocuments = await this.getAll();
      const existingDocumentIds = existingDocuments.map((d) => d.id);
      const newDocumentIds = documents.map((d) => d.id);
      const idsToDelete = existingDocumentIds.filter(
        (existingDocumentId) => !newDocumentIds.includes(existingDocumentId),
      );

      await Promise.allSettled(idsToDelete.map((id) => this.db.delete('document', id)));
    }

    const tx = this.db.transaction('document', 'readwrite');
    // console.log(documents, 'about to save documents');
    const promises = documents.map((document) => {
      if (document?.id) {
        return tx.store.put(document);
      }
    });

    const results = await Promise.allSettled(promises);
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        RollbarErrorTracking.logErrorInRollbar(result.reason);
      }
    });
    return;
  }

  /**
   * For some reason, the drive api does not return the id of the target. It does return a link however
   *
   * @param link link: "https://docs.google.com/document/d/1xgblKX2-5BAbmGwaERTREP6OhXPv9BOjnPXF1Ohgvrw"
   */
  async getByLink(link: string): Promise<IDocument | undefined> {
    return this.db.get('document', getIdFromLink(link));
  }

  async getById(id: string): Promise<IDocument | undefined> {
    return this.db.get('document', id);
  }

  async getAll() {
    return this.db.getAll('document');
  }

  async getBulk(ids: string[]): Promise<IDocument[]> {
    const uniqIds = uniq(ids);
    const docs = await Promise.all(uniqIds.map((id) => this.db.get('document', id)));
    return docs.filter(Boolean) as any;
  }
}
