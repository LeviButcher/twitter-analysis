const fetch = require("node-fetch");
require("dotenv").config();

token = process.env.TWITTER_BEARER_TOKEN;

if (!token) throw new Error("env var:TWITTER_BEARER_TOKEN not set");

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

/*
    fetchManyTweetResults

    Query twitter api with the query passed in and get next results nMany time

    Twitter Api Result Format: {
      data: [

      ],
      includes: {

      }
    }

    Returns: Array of Twitter Api Result Objects
*/
const fetchManyTweetResults = async (query, maxResults, nMany, nextToken) => {
  if (maxResults < 10 || nMany > 100)
    throw Promise.reject("maxResults not in range 10 - l00");
  if (nMany < 1) throw Promise.reject("nMany cannot be less then 1");
  const res = await fetchTweets(query, maxResults, nextToken);
  const { meta, ...data } = await res.json();

  // Handle Response failure
  if (data.status) return [];

  if (meta.next_token && nMany > 1) {
    const next = await fetchManyTweetResults(
      query,
      maxResults,
      nMany - 1,
      meta.next_token
    );

    return [data, ...next];
  }

  return [data];
};

module.exports = { fetchManyTweetResults, fetchTweets };
