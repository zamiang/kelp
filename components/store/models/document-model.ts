import { uniq } from 'lodash';
import { getModifiedTimeProxy } from '../../fetch/fetch-drive-files';
import { dbType } from '../db';

type DocumentType =
  | 'UNKNOWN'
  | 'application/vnd.google-apps.presentation'
  | 'application/vnd.google-apps.spreadsheet'
  | 'application/vnd.google-apps.document';

export interface IDocument {
  id: string;
  name?: string;
  viewedByMe?: boolean;
  link?: string;
  updatedAt?: Date;
  viewedByMeAt?: Date;
  mimeType: DocumentType;
  isShared: boolean;
  isStarred: boolean;
  iconLink?: string;
}

export const getGoogleDocsIdFromLink = (link: string) =>
  link
    .replace('https://docs.google.com/document/d/', '')
    .replace('https://docs.google.com/presentation/d/', '')
    .replace('https://docs.google.com/spreadsheets/d/', '')
    .split('/')[0];

// handle one person w/ multiple email addresses
export const formatGoogleDoc = (googleDoc: gapi.client.drive.File) => {
  const modifiedTimeProxy = getModifiedTimeProxy(googleDoc);
  return {
    id: googleDoc.id!,
    name: googleDoc.name,
    viewedByMe: googleDoc.viewedByMe,
    viewedByMeAt: googleDoc.viewedByMeTime ? new Date(googleDoc.viewedByMeTime) : undefined,
    link: (googleDoc.webViewLink || '').replace('/edit?usp=drivesdk', ''),
    iconLink: googleDoc.iconLink,
    mimeType: googleDoc.mimeType as any,
    isStarred: !!googleDoc.starred,
    isShared: !!googleDoc.shared,
    updatedAt: modifiedTimeProxy ? new Date(modifiedTimeProxy) : undefined,
  };
};

export default class DocumentModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up person store');
    this.db = db;
  }

  async addDocsToStore(documents: IDocument[]) {
    const tx = this.db.transaction('document', 'readwrite');
    console.log(documents, 'about to save documents');
    try {
      await Promise.all(documents.map((document) => tx.store.put(document)));
    } catch (e) {
      console.log(e);
    }
    return tx.done;
  }

  /**
   * For some reason, the drive api does not return the id of the target. It does return a link however
   *
   * @param link link: "https://docs.google.com/document/d/1xgblKX2-5BAbmGwaERTREP6OhXPv9BOjnPXF1Ohgvrw"
   */
  async getByLink(link: string): Promise<IDocument | undefined> {
    return this.db.get('document', getGoogleDocsIdFromLink(link));
  }

  async get(id: string): Promise<IDocument | undefined> {
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
