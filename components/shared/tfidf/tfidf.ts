import { flatten, max, min } from 'lodash';
import stopwords from './stop-words';

interface IDocument {
  [text: string]: number;
}

interface IIdfCache {
  [text: string]: number;
}

const buildDocument = (text: string, key: string): IDocument =>
  text.split(' ').reduce(
    (document: IDocument, term: string) => {
      if (!stopwords.includes(term)) document[term] = document[term] ? document[term] + 1 : 1;
      return document;
    },
    {
      __key: key,
    } as any,
  );

const tf = (term: string, document: IDocument) => (document[term] ? document[term] : 0);
const documentHasTerm = (term: string, document: IDocument) => document[term] && document[term] > 0;

export default class Tfidf {
  private documents: IDocument[];
  private idfCache: IIdfCache;

  constructor(documentsToAdd: { text: string; key: string }[]) {
    this.documents = [];
    this.idfCache = {};
    documentsToAdd.map((doc) => this.addDocument(doc.text, doc.key, false));
  }

  idf = (term: string, shouldForce: boolean) => {
    // Lookup the term in the New term-IDF caching,
    // this will cut search times down exponentially on large document sets.
    if (this.idfCache[term] && shouldForce !== true) return this.idfCache[term];

    const docsWithTerm = this.documents.reduce(
      (count, document) => count + (documentHasTerm(term, document) ? 1 : 0),
      0,
    );

    const idf = 1 + Math.log(this.documents.length / (1 + docsWithTerm));

    // Add the idf to the term cache and return it
    this.idfCache[term] = idf;
    return idf;
  };

  // If restoreCache is set to true, all terms idf scores currently cached will be recomputed.
  // Otherwise, the cache will just be wiped clean
  addDocument(text: string, key: string, shouldRestoreCache: boolean) {
    this.documents.push(buildDocument(text, key));

    // make sure the cache is invalidated when new documents arrive
    if (shouldRestoreCache) {
      for (const term in this.idfCache) {
        // invoking idf with the force option set will
        // force a recomputation of the idf, and it will
        // automatically refresh the cache value.
        this.idf(term, true);
      }
    } else {
      this.idfCache = {};
    }
  }

  tfidf(term: string, documentIndex: number) {
    const getIdf = this.idf;
    const documents = this.documents;
    return term.split(' ').reduce(function (value, term) {
      let idf = getIdf(term, false);
      idf = idf === Infinity ? 0 : idf;
      return value + tf(term, documents[documentIndex]) * idf;
    }, 0.0);
  }

  listTerms(documentIndex: number) {
    const terms = [];
    for (const term in this.documents[documentIndex]) {
      if (term != '__key')
        terms.push({
          term,
          tfidf: this.tfidf(term, documentIndex),
        });
    }

    return terms.sort(function (x, y) {
      return y.tfidf - x.tfidf;
    });
  }

  tfidfs(terms: string) {
    return this.documents.map((_document, index) => this.tfidf(terms, index));
  }

  getMin() {
    return min(flatten(this.documents.map((document) => Object.values(document))));
  }

  getMax() {
    return max(flatten(this.documents.map((document) => Object.values(document))));
  }
}
