const { TestScheduler } = require("jest");
const {
  cleanTweetText,
  tokenizeAndRemoveStopWords,
  uniques,
  occurrenceCount,
} = require("./utils");

describe("cleanTweetText", () => {
  test("Removes urls from string", () => {
    const res = cleanTweetText("http://google.com hello");
    expect(res).toBe("hello");
  });

  test("Removes secure urls from string", () => {
    const res = cleanTweetText("https://ebay.com hello");
    expect(res).toBe("hello");
  });

  test("Removes multiple urls", () => {
    const res = cleanTweetText("https://ebay.com then go to http://google.com");
    expect(res).toBe("then go to");
  });

  test("Removes @user from string", () => {
    const res = cleanTweetText("@elonmusk U mean @DemolitionRanch");
    expect(res).toBe("U mean");
  });

  test("Removes emoji's from text", () => {
    const res = cleanTweetText("Just for another brother 🙏🏽");
    expect(res).toBe("Just for another brother");
  });

  test("Remove punctuation from text", () => {
    const res = cleanTweetText(
      "Hey! how is it going? I hope your day is great. I have: apples, oranges, and bananas. (PS I 'really' mean it)"
    );
    expect(res).toBe(
      "Hey how is it going I hope your day is great I have: apples oranges and bananas PS I really mean it"
    );
  });

  test("Remove newlines but with spaces", () => {
    const res = cleanTweetText("Gamers!\nRise up");
    expect(res).toBe("Gamers Rise up");
  });
});

describe("tokenizeAndRemoveCommonWords", () => {
  test("Text is returned as array", () => {
    const res = tokenizeAndRemoveStopWords("Hey there stranger how it be");
    expect(res).toEqual(["Hey", "stranger"]);
  });
});

describe("uniques", () => {
  test("Should return uniques values from array", () => {
    const res = uniques([1, 3, 2, 1, 3, 4, 5, 2]);
    expect(res).toEqual([1, 3, 2, 4, 5]);
  });

  test("Should return uniques strings from array", () => {
    const res = uniques(["two", "three", "two"]);
    expect(res).toEqual(["two", "three"]);
  });
});

describe("occurrenceCount", () => {
  test("Should return uniques with count", () => {
    const res = occurrenceCount([1, 3, 2, 1, 3, 4, 5, 2]);
    expect(res).toEqual([
      [1, 2],
      [3, 2],
      [2, 2],
      [4, 1],
      [5, 1],
    ]);
  });
});
