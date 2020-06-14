export interface IDoc {
  id: string;
  name?: string;
  description?: string;
  viewedByMe?: boolean;
  link?: string;
  updatedAt?: string;
}

interface IDocById {
  [id: string]: IDoc;
}

// handle one person w/ multiple email addresses
const creatDocFromGoogleDoc = (googleDoc: gapi.client.drive.File) => ({
  id: googleDoc.id || 'wtf',
  name: googleDoc.name,
  description: googleDoc.description,
  viewedByMe: googleDoc.viewedByMe,
  link: googleDoc.webViewLink,
  updatedAt: googleDoc.modifiedTime,
});

export default class DocDataStore {
  private docsById: IDocById;

  constructor(docsList: gapi.client.drive.File[]) {
    console.warn('setting up person store');
    this.docsById = {};
    this.addDocsToStore(docsList);
  }

  setupFromFakeData(docs: IDoc[]) {
    docs.forEach((document) => {
      this.docsById[document.id] = document;
    });
  }

  addDocsToStore(docs: gapi.client.drive.File[]) {
    docs.forEach((document) => {
      this.docsById[document.id || 'wtf'] = creatDocFromGoogleDoc(document);
    });
  }

  /**
   * For some reason, the drive api does not return the id of the target. It does return a link however
   *
   * @param link link: "https://docs.google.com/document/d/1xgblKX2-5BAbmGwaERTREP6OhXPv9BOjnPXF1Ohgvrw"
   */
  getByLink(link: string) {
    return this.docsById[link.replace('https://docs.google.com/document/d/', '')];
  }

  getDocs() {
    return Object.values(this.docsById);
  }

  getLength() {
    return Object.keys(this.docsById).length;
  }
}
