const { fetchManyTweetResults } = require("./twitterApi.js");

const timesToDownload = 10;
const amountDownloadedPerCall = 100;

// Flatten out Objects
const cleanTweetData = (tweetData) => {
  const { public_metrics } = tweetData;
  delete tweetData.public_metrics;
  return { ...tweetData, ...public_metrics };
};

async function downloadTweets() {
  const data = await fetchManyTweetResults(
    "@elonmusk&tweet.fields=created_at,public_metrics&expansions=author_id&user.fields=username",
    amountDownloadedPerCall,
    timesToDownload
  ).catch((e) => console.log(e));

  return data.map(cleanTweetData);
}

module.exports = downloadTweets;
