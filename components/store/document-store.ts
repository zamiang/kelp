import { subDays } from 'date-fns';
import { uniqBy } from 'lodash';
import { getWeek } from '../shared/date-helpers';
import { IStore } from './use-store';

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

interface IDocumentById {
  [id: string]: IDocument;
}

export const getGoogleDocsIdFromLink = (link: string) =>
  link
    .replace('https://docs.google.com/document/d/', '')
    .replace('https://docs.google.com/presentation/d/', '')
    .replace('https://docs.google.com/spreadsheets/d/', '')
    .split('/')[0];

// handle one person w/ multiple email addresses
export const formatGoogleDoc = (googleDoc: gapi.client.drive.File) => ({
  id: googleDoc.id || 'wtf',
  name: googleDoc.name,
  viewedByMe: googleDoc.viewedByMe,
  viewedByMeAt: googleDoc.viewedByMeTime ? new Date(googleDoc.viewedByMeTime) : undefined,
  link: (googleDoc.webViewLink || '').replace('/edit?usp=drivesdk', ''),
  iconLink: googleDoc.iconLink,
  mimeType: googleDoc.mimeType as any,
  isStarred: !!googleDoc.starred,
  isShared: !!googleDoc.shared,
  updatedAt: googleDoc.modifiedTime ? new Date(googleDoc.modifiedTime) : undefined,
});

export default class DocumentDataStore {
  private docsById: IDocumentById;

  constructor(docsList: IDocument[]) {
    // console.warn('setting up person store');
    this.docsById = {};
    this.addDocsToStore(docsList);
  }

  setupFromFakeData(docs: IDocument[]) {
    docs.forEach((document) => {
      this.docsById[document.id] = document;
    });
  }

  addDocsToStore(docs: IDocument[]) {
    docs.forEach((document) => {
      this.docsById[document.id || 'wtf'] = document;
    });
  }

  getDocsRecentlyEditedByCurrentUser(
    driveActivityStore: IStore['driveActivityStore'],
    personDataStore: IStore['personDataStore'],
  ) {
    const driveActivity = driveActivityStore.getAll();
    const minTime = subDays(new Date(), 7);
    return (uniqBy(
      driveActivity
        .filter((activity) => {
          const person =
            activity.actorPersonId && personDataStore.getPersonById(activity.actorPersonId);
          if (person && person.isCurrentUser) {
            return activity.time > minTime;
          }
          return false;
        })
        .map(
          (driveActivity) =>
            driveActivity && driveActivity.link && this.getByLink(driveActivity.link),
        )
        .filter((doc) => doc && doc.id),
      'id',
    ) as IDocument[]).sort((a, b) => (a.name! < b.name! ? -1 : 1));
  }

  getDocumentsForDay(
    timeDataStore: IStore['timeDataStore'],
    driveActivityStore: IStore['driveActivityStore'],
    day: Date,
  ) {
    const driveActivityIdsForDay = timeDataStore.getDriveActivityIdsForDate(day);
    const documentsFromActivity: any[] = driveActivityIdsForDay
      .map((id) => id && driveActivityStore.getById(id))
      .map(
        (driveActivity) =>
          driveActivity && driveActivity.link && this.getByLink(driveActivity.link),
      )
      .filter((doc) => doc && doc.id);

    const documentIdsForDay = timeDataStore.getListedDocumentIdsForDay(day);
    const listedDocuments = documentIdsForDay.map((id) => this.getByLink(id)).filter(Boolean);
    const concattedDocuments = uniqBy(listedDocuments.concat(documentsFromActivity), 'id');
    return concattedDocuments.sort((a: any, b: any) =>
      a?.name.toLowerCase().localeCompare(b?.name.toLowerCase()),
    );
  }

  getDocumentsForThisWeek(
    timeDataStore: IStore['timeDataStore'],
    driveActivityStore: IStore['driveActivityStore'],
  ) {
    const driveActivityIdsForThisWeek = timeDataStore.getDriveActivityIdsForWeek(
      getWeek(new Date()),
    );
    return (uniqBy(
      driveActivityIdsForThisWeek
        .map((id) => id && driveActivityStore.getById(id))
        .map(
          (driveActivity) =>
            driveActivity && driveActivity.link && this.getByLink(driveActivity.link),
        )
        .filter((doc) => doc && doc.id),
      'id',
    ) as IDocument[]).sort((a: any, b: any) =>
      a?.name.toLowerCase().localeCompare(b?.name.toLowerCase()),
    );
  }

  /**
   * For some reason, the drive api does not return the id of the target. It does return a link however
   *
   * @param link link: "https://docs.google.com/document/d/1xgblKX2-5BAbmGwaERTREP6OhXPv9BOjnPXF1Ohgvrw"
   */
  getByLink(link: string): IDocument | undefined {
    return this.docsById[getGoogleDocsIdFromLink(link)];
  }

  getDocs() {
    return Object.values(this.docsById);
  }

  getLength() {
    return Object.keys(this.docsById).length;
  }
}
