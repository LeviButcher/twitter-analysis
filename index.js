const json2csv = require("json2csv");
const fs = require("fs");
const downloadTweets = require("./src/downloadTweets");
const { cleanTweetObjectPlusExtras, occurrenceCount } = require("./src/utils");

const writeDataAsCSV = (fileName, data) => {
  const csv = json2csv.parse(data);
  fs.writeFileSync(fileName, csv, () => console.log("Success"));
};

async function main() {
  const data = await downloadTweets();
  writeDataAsCSV("tweets.csv", data);
  const cleanedData = data.map(cleanTweetObjectPlusExtras);
  writeDataAsCSV("cleantokens.csv", cleanedData);
  const lemTokens = cleanedData.flatMap((c) => c.tokens);
  const occurrences = occurrenceCount(lemTokens).map((o) => ({
    word: o[0],
    count: o[1],
  }));
  writeDataAsCSV("frequency.csv", occurrences);
}

main();
