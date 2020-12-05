const json2csv = require("json2csv");
const fs = require("fs");
const {
  cleanTweetObjectPlusExtras,
  occurrenceCount,
  cleanTweetApiData,
  getTweetSentiment,
  uniques,
} = require("./src/utils");
const { fetchManyTweetResults } = require("./src/twitterApi.js");

const query =
  "@elonmusk -is:retweet lang:en&tweet.fields=created_at,public_metrics&expansions=author_id&user.fields=username";

const amountDownloadedPerCall = 50;
const timesToDownload = 5;

const writeDataAsCSV = (fileName, data) => {
  const csv = json2csv.parse(data);
  fs.writeFileSync(fileName, csv, () => console.log("Success"));
};

async function main() {
  const rawData = await fetchManyTweetResults(
    query,
    amountDownloadedPerCall,
    timesToDownload
  ).catch((e) => console.log(e));
  const data = rawData.flatMap(cleanTweetApiData);
  writeDataAsCSV("tweets.csv", data);

  const cleanedData = data.map(cleanTweetObjectPlusExtras);
  writeDataAsCSV("cleantokens.csv", cleanedData.map(cleanForTokenCSV));

  const lemTokens = cleanedData.flatMap((c) => c.lemmatized);
  const occurrences = occurrenceCount(lemTokens)
    .map((o) => ({
      word: o[0],
      count: o[1],
    }))
    .sort((a, b) => b.count - a.count);

  writeDataAsCSV("frequency.csv", occurrences);

  // Sentiments Analysis
  const sentiments = cleanedData
    .map(getTweetSentiment)
    .map(cleanForSentimentCSV);
  writeDataAsCSV("sentiments.csv", sentiments);

  // j.2 10 most important users
  const engagementData = uniques(cleanedData.map((x) => x.username))
    .map((x) => [x, cleanedData.filter((t) => t.username === x)])
    .flatMap((x) => x[1].reduce(addToCounter, newCounter(x[0])))
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, 10);
  writeDataAsCSV("engagement.csv", engagementData);
}

const cleanForSentimentCSV = (tweet) => ({
  id: tweet.id,
  cleanedText: tweet.cleanedText,
  polarity: tweet.polarity.toFixed(3),
  subjectivity: tweet.subjectivity.toFixed(3),
});

const cleanForTokenCSV = (tweet) => ({
  id: tweet.id,
  text: tweet.text,
  tokens: tweet.tokens,
  stemming: tweet.stemming,
  lemmatized: tweet.lemmatized,
});

const cleanForEngagementCSV = (tweet) => ({
  id: tweet.id,
});

const addToCounter = (counter, tweet) => ({
  ...counter,
  numberOfTweets: counter.numberOfTweets + 1,
  totalRetweets: counter.totalRetweets + tweet.retweet_count,
  totalLikes: counter.totalLikes + tweet.like_count,
  totalEngagement:
    counter.totalEngagement + tweet.retweet_count + tweet.like_count,
});

const newCounter = (name) => ({
  name,
  numberOfTweets: 0,
  totalRetweets: 0,
  totalLikes: 0,
  totalEngagement: 0,
});

main();
