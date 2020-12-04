const fetch = require("node-fetch");
require("dotenv").config();

token = process.env.TWITTER_BEARER_TOKEN;

const twitterUrl = "https://api.twitter.com/2/tweets/search/recent?query=";

const fetchTweets = (query, maxResults, nextToken) =>
  fetch(
    twitterUrl +
      `${query}&max_results=${maxResults}${
        nextToken ? `&next_token=${nextToken}` : ""
      }`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

// Return Promise of array data
const fetchManyTweetResults = async (query, maxResults, nMany, nextToken) => {
  if (nMany < 1) throw Promise.reject("nMany too small");
  const res = await fetchTweets(query, maxResults, nextToken);
  const { data, meta } = await res.json();

  if (meta.next_token && nMany > 1) {
    const next = await fetchManyTweetResults(
      query,
      maxResults,
      nMany - 1,
      meta.next_token
    );
    return [...data, ...next];
  }

  return data;
};

module.exports = { fetchManyTweetResults, fetchTweets };
