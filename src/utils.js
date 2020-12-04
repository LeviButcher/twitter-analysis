const natural = require("natural");

const matchUrl = /http\S+/g;
const matchUsername = /\@\S+/g;
const matchNonASCII = /[^\x00-\x7F]+/g;
const matchPunctuation = /[\.|?|!|,|'|(|)|;|"]/g;
const matchNewlines = /[\r\n|\r|\n]/g;

const cleanTextRegex = [
  matchUrl,
  matchUsername,
  matchNonASCII,
  matchPunctuation,
];

const commonWords = ["the", "and", "but", "is", "at", "which"];

const replaceWithEmptyString = (text, regex) => text.replace(regex, "");

// Removes Urls, UserNames, emojis, punctuation, and newlines from text
const cleanTweetText = (text) => {
  const res = cleanTextRegex.reduce(replaceWithEmptyString, text);
  return res.split(matchNewlines).join(" ");
};

const isCommonWord = (word) =>
  commonWords.some((common) => common.toLowerCase() === word.toLowerCase());

const notCommonWord = (w) => !isCommonWord(w);

const removeCommonWords = (wordTokens) => wordTokens.filter(notCommonWord);

const isLengthAtLeastThree = (array) => array.length >= 3;

const tokenizeAndRemoveCommonWords = (text) =>
  removeCommonWords(text.split(" ")).filter(isLengthAtLeastThree);

const cleanTweetObjectPlusExtras = (tweet) => {
  const cleanedText = cleanTweetText(tweet.text);
  const tokens = tokenizeAndRemoveCommonWords(cleanedText);

  return {
    ...tweet,
    cleanedText,
    tokens,
    stemming: tokens.map(natural.PorterStemmer.stem),
    lemmatized: [],
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

module.exports = {
  cleanTweetText,
  tokenizeAndRemoveCommonWords,
  cleanTweetObjectPlusExtras,
  uniques,
  occurrenceCount,
};
