export type DocumentType =
  | 'UNKNOWN'
  | 'application/vnd.google-apps.presentation'
  | 'application/vnd.google-apps.spreadsheet'
  | 'application/vnd.google-apps.document';

export interface IDoc {
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

interface IDocById {
  [id: string]: IDoc;
}

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

export default class DocDataStore {
  private docsById: IDocById;

  constructor(docsList: IDoc[]) {
    console.warn('setting up person store');
    this.docsById = {};
    this.addDocsToStore(docsList);
  }

  setupFromFakeData(docs: IDoc[]) {
    docs.forEach((document) => {
      this.docsById[document.id] = document;
    });
  }

  addDocsToStore(docs: IDoc[]) {
    docs.forEach((document) => {
      this.docsById[document.id || 'wtf'] = document;
    });
  }

  /**
   * For some reason, the drive api does not return the id of the target. It does return a link however
   *
   * @param link link: "https://docs.google.com/document/d/1xgblKX2-5BAbmGwaERTREP6OhXPv9BOjnPXF1Ohgvrw"
   */
  getByLink(link: string): IDoc | undefined {
    return this.docsById[link.replace('https://docs.google.com/document/d/', '')];
  }

  getDocs() {
    return Object.values(this.docsById);
  }

  getLength() {
    return Object.keys(this.docsById).length;
  }
}
