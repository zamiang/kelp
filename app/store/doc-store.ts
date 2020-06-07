export interface IDoc {
  id: string;
  name?: string;
  description?: string;
  viewedByMe?: boolean;
  link?: string;
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
});

export default class DocDataStore {
  private docsById: IDocById;

  constructor(docsList: gapi.client.drive.File[]) {
    console.warn('setting up person store');
    this.docsById = {};
    this.addDocsToStore(docsList);
  }

  addDocsToStore(docs: gapi.client.drive.File[]) {
    docs.forEach((document) => {
      this.docsById[document.id || 'wtf'] = creatDocFromGoogleDoc(document);
    });
  }

  getDocs() {
    return Object.values(this.docsById);
  }

  getLength() {
    return Object.keys(this.docsById).length;
  }
}
