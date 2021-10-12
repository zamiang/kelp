interface IDocument {
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

export const cleanText = (text: string) => {
  const terms = removeStopwords(
    text
      .toLocaleLowerCase()
      .replaceAll('–', ' ')
      .replaceAll('—', ' ')
      .replaceAll('_', ' ')
      .replaceAll('/', ' ')
      .replaceAll('(', '')
      .replaceAll(')', '')
      .replace(removePunctuationRegex, '')
      .replaceAll('meeting', '')
      .split(' '),
  );
  return terms;
};

const buildDocument = (text: string, key: string): IDocument => {
  const terms = cleanText(text);
  return terms.reduce(
    (document: IDocument, term: string) => {
      if (term.length > 1) document[term] = document[term] ? document[term] + 1 : 1;
      return document;
    },
    {
      __key: key,
    } as any,
  );
};

const tf = (term: string, document: IDocument) => (document[term] ? document[term] : 0);
const documentHasTerm = (term: string, document: IDocument) => document[term] && document[term] > 0;

export default class Tfidf {
  private documents: IDocument[];
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

  tfidfs(terms: string) {
    const formattedTerms = cleanText(terms).filter((t) => t.length > 2);
    const values = this.documents.map((_document, index) => this.tfidf(formattedTerms, index));
    return formattedTerms.map((t, index) => ({ term: t, value: values[0][index] }));
  }

  listTerms(maxLength = 40) {
    const documentsToSearch: IDocument[] = [];
    this.documents.forEach((item) => {
      documentsToSearch.push(item);
    });
    const terms = Object.entries(documentsToSearch[0]).sort(([, a], [, b]) => b - a);
    return terms.slice(0, maxLength).map((t) => t[0]);
  }

  listTermsWithValue(maxLength = 20) {
    const documentsToSearch: IDocument[] = [];
    this.documents.forEach((item) => {
      documentsToSearch.push(item);
    });
    const terms = Object.entries(documentsToSearch[0]).sort(([, a], [, b]) => b - a);
    return terms.slice(0, maxLength).map((t) => ({ term: t[0], tfidf: t[1] }));
  }
}
