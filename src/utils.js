const stopWords = require("../stopwords.json");
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

/*
  cleanTweetText
  Removes Urls, UserNames, emojis, punctuation, and newlines from text

  Returns: string with No, Urls, UserNames, emojis, punctuation, and newlines
*/
const cleanTweetText = (text) =>
  cleanTextRegex
    .reduce(replaceWithEmptyString, text)
    .split(matchNewlines)
    .join(" ")
    .trim();

// Checks if word is a stop word from list of common stop words
const isStopWord = (word) =>
  stopWords.some((common) => common.toLowerCase() === word.toLowerCase());

const compose = (f) => (g) => (input) => f(g(input));

const not = (bool) => !bool;

const notStopWord = compose(not)(isStopWord);

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

// Returns an array of unique items from input array
const uniques = (arr) =>
  arr.reduce(
    (acc, curr) => (acc.some((x) => x === curr) ? acc : [...acc, curr]),
    []
  );

const count = (f, arr) =>
  arr.reduce((acc, curr) => (f(curr) ? acc + 1 : acc), 0);

// Returns an array of tuples of (item, count) based on input array
const occurrenceCount = (arr) => {
  const u = uniques(arr);
  return u.map((uu) => [uu, count((c) => c === uu, arr)]);
};

const zip = ([a, ...aa], [b, ...bb]) => {
  if (aa.length == 0 || bb.length == 0) return [];
  return [[a, b], ...zip(aa, bb)];
};

// Flatten out Response
const cleanTweetApiData = ({ data, includes: { users } }) =>
  zip(data, users)
    .map(([tweet, user]) => ({ ...user, ...tweet }))
    .map((x) => {
      const { public_metrics } = x;
      delete x.public_metrics;

      return {
        ...x,
        created_at: new Date(x.created_at).toLocaleString(),
        ...public_metrics,
      };
    });

const getTweetSentiment = (cleanedTweet) => ({
  ...cleanedTweet,
  polarity: 0,
  subjectivity: analyser.getSentiment(cleanedTweet.stemming),
});

module.exports = {
  cleanTweetText,
  tokenizeAndRemoveStopWords,
  cleanTweetObjectPlusExtras,
  uniques,
  occurrenceCount,
  cleanTweetApiData,
  getTweetSentiment,
};
