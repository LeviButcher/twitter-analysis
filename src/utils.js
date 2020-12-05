const stopWords = require("../stopwords.json"); // From https://github.com/Alir3z4/stop-words/blob/master/english.txt
const natural = require("natural");
const { lemmatizer } = require("lemmatizer");

const analyser = new natural.SentimentAnalyzer(
  "English",
  natural.PorterStemmer,
  "afinn"
);

// Custom Regex + Regex from PDF provided
const matchUrl = /http\S+/g;
const matchUsername = /\@\S+/g;
const matchNonASCII = /[^\x00-\x7F]+/g;
const matchPunctuation = /[\.|?|!|,|'|(|)|;|~"]/g;
const matchNewlines = /[\r\n|\r|\n]/g;

const cleanTextRegex = [
  matchUrl,
  matchUsername,
  matchNonASCII,
  matchPunctuation,
];

const replaceWithEmptyString = (text, regex) => text.replace(regex, "");

// Removes Urls, UserNames, emojis, punctuation, and newlines from text
const cleanTweetText = (text) => {
  const res = cleanTextRegex.reduce(replaceWithEmptyString, text);
  return res.split(matchNewlines).join(" ").trim();
};

const isStopWord = (word) =>
  stopWords.some((common) => common.toLowerCase() === word.toLowerCase());

const notStopWord = (w) => !isStopWord(w);

const removeStopWords = (wordTokens) => wordTokens.filter(notStopWord);

const isLengthAtLeastThree = (array) => array.length >= 3;

// Answer to 1.e
const tokenizeAndRemoveStopWords = (text) =>
  removeStopWords(text.split(" ")).filter(isLengthAtLeastThree);

const cleanTweetObjectPlusExtras = (tweet) => {
  const cleanedText = cleanTweetText(tweet.text);
  const tokens = tokenizeAndRemoveStopWords(cleanedText);

  return {
    ...tweet,
    cleanedText,
    tokens,
    stemming: tokens.map(natural.PorterStemmer.stem),
    lemmatized: tokens.map(lemmatizer),
  };
};

const uniques = (arr) =>
  arr.reduce(
    (acc, curr) => (acc.some((x) => x === curr) ? acc : [...acc, curr]),
    []
  );

const count = (f, arr) =>
  arr.reduce((acc, curr) => (f(curr) ? acc + 1 : acc), 0);

const occurrenceCount = (arr) => {
  const u = uniques(arr);
  return u.map((uu) => [uu, count((c) => c === uu, arr)]);
};

const zip = (arr1, arr2) => {
  const [a, ...aa] = arr1;
  const [b, ...bb] = arr2;
  if (aa.length == 0 || bb.length == 0) return [];
  return [[a, b], ...zip(aa, bb)];
};

// Flatten out Response
const cleanTweetApiData = (tweetData) => {
  const {
    data,
    includes: { users },
  } = tweetData;

  return zip(data, users)
    .map((arr) => ({ ...arr[1], ...arr[0] }))
    .map((x) => {
      const { public_metrics } = x;
      delete x.public_metrics;

      return {
        ...x,
        created_at: new Date(x.created_at).toLocaleString(),
        ...public_metrics,
      };
    });
};

const getTweetSentiment = (cleanedTweet) => {
  return {
    ...cleanedTweet,
    polarity: 0,
    subjectivity: analyser.getSentiment(cleanedTweet.stemming),
  };
};

module.exports = {
  cleanTweetText,
  tokenizeAndRemoveStopWords,
  cleanTweetObjectPlusExtras,
  uniques,
  occurrenceCount,
  cleanTweetApiData,
  getTweetSentiment,
};
