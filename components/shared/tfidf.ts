interface IDocumentument {
  [text: string]: number;
}

interface IIdfCache {
  [text: string]: number;
}

const stopwords = [
  'about',
  'after',
  'all',
  'also',
  'am',
  'an',
  'and',
  'another',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'between',
  'both',
  'but',
  'by',
  'came',
  'can',
  'come',
  'could',
  'did',
  'do',
  'each',
  'for',
  'from',
  'get',
  'got',
  'has',
  'had',
  'he',
  'have',
  'her',
  'here',
  'him',
  'himself',
  'his',
  'how',
  'if',
  'in',
  'into',
  'is',
  'it',
  'like',
  'make',
  'many',
  'me',
  'might',
  'more',
  'most',
  'much',
  'must',
  'my',
  'never',
  'now',
  'of',
  'on',
  'only',
  'or',
  'other',
  'our',
  'out',
  'over',
  'said',
  'same',
  'see',
  'should',
  'since',
  'some',
  'still',
  'such',
  'take',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'up',
  'very',
  'was',
  'way',
  'we',
  'well',
  'were',
  'what',
  'where',
  'which',
  'while',
  'who',
  'with',
  'would',
  'you',
  'your',
  'a',
  'i',
  '-',
];

const removeStopwords = (tokens: string[]) =>
  tokens.filter((value) => !stopwords.includes(value.toLowerCase()));

export const removePunctuationRegex = /[.,/#|!?$<>[\]%^&*;:{}=\-_`~()]/g;

const buildDocument = (text: string, key: string): IDocumentument =>
  removeStopwords(text.replace(removePunctuationRegex, '').split(' ')).reduce(
    (document: IDocumentument, term: string) => {
      const formattedTerm = term
        .replace('(', '')
        .replace(')', '')
        .replace('–', '')
        .replace('/', '')
        .replace('meeting', '');
      if (formattedTerm.length > 1)
        document[formattedTerm] = document[formattedTerm] ? document[formattedTerm] + 1 : 1;
      return document;
    },
    {
      __key: key,
    } as any,
  );

const tf = (term: string, document: IDocumentument) => (document[term] ? document[term] : 0);
const documentHasTerm = (term: string, document: IDocumentument) =>
  document[term] && document[term] > 0;

export default class Tfidf {
  private documents: IDocumentument[];
  private idfCache: IIdfCache;
  private documentCount: number;

  constructor(documentsToAdd: { text: string; key: string }[]) {
    this.idfCache = {};
    this.documentCount = documentsToAdd.length;
    this.documents = [buildDocument(documentsToAdd.map((d) => d.text).join(' '), '0')];
    this.restoreCache();
  }

  idf = (term: string, shouldForce: boolean) => {
    // Lookup the term in the New term-IDF caching,
    // this will cut search times down exponentially on large document sets.
    if (this.idfCache[term] && shouldForce !== true) return this.idfCache[term];

    const docsWithTerm = this.documents.reduce(
      (count, document) => count + (documentHasTerm(term, document) ? 1 : 0),
      0,
    );

    const idf = 1 + Math.log(this.documentCount / (1 + docsWithTerm));

    // Add the idf to the term cache and return it
    this.idfCache[term] = idf;
    return idf;
  };

  restoreCache() {
    // make sure the cache is invalidated when new documents arrive
    for (const term in this.idfCache) {
      // invoking idf with the force option set will
      // force a recomputation of the idf, and it will
      // automatically refresh the cache value.
      this.idf(term, true);
    }
  }

  tfidf(terms: string[], documentIndex: number) {
    const getIdf = this.idf;
    const documents = this.documents;
    return terms.map((term) => {
      let idf = getIdf(term, false);
      idf = idf === Infinity ? 0 : idf;
      const documentsToSearch = documents.find(
        (item) => item.__key === (documentIndex.toString() as any),
      );
      if (documentsToSearch) {
        return tf(term, documentsToSearch) * idf;
      }
      console.log('fail');
      return 0;
    }, 0.0);
  }

  /*
  listTerms(documentIndex: number) {
    const terms: { tfidf: number; term: string }[] = [];
    const documentsToSearch: any = [];
    const addedTerms = {} as any;
    this.documents.forEach((item) => {
      if (item.__key === (documentIndex.toString() as any)) {
        documentsToSearch.push(item);
      }
    });

    documentsToSearch.forEach((document: any) => {
      for (const term in document) {
        if (term !== '__key')
          if (!addedTerms[term]) {
            terms.push({
              term,
              tfidf: this.tfidf(term, documentIndex),
            });
            addedTerms[term] = true;
          }
      }
    });
    return terms.sort((x: any, y: any) => y.tfidf - x.tfidf);
  }
*/

  tfidfs(terms: string) {
    const formattedTerms = removeStopwords(
      terms.replace(removePunctuationRegex, '').split(' '),
    ).filter((t) => t.length > 2);
    const values = this.documents.map((_document, index) => this.tfidf(formattedTerms, index));
    return formattedTerms.map((t, index) => ({ term: t, value: values[0][index] }));
  }
}
