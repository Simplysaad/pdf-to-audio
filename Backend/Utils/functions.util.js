/**
 * PROBLEM
 * I have a text that contains a table of contents and main text split into chapters
 * the table of contents has to be extracted and separated from the main text
 * then based on the table of contents, the main text is split into chapters
 * each of these chapters is exported as its own separate audio file in a folder "./[BOOK TITLE]"
 */

import fs from "fs";

const TEXT_FILE = "./atomic-habits.pdf.txt";
const FILE_OUTPUT = fs.readFileSync(TEXT_FILE).toString("utf-8");

const NOT_CONTENT_REGEX = /^(?!.*contents\s+.*?\s+index).*$/gi;
const CONTENT_REGEX = /contents\s+(.*?)\s+index/gi;

/**
 * @name removeSpaces
 * @description removes all unnecessary spaces from the given text and returns it as an array
 * @param {String | String[]} text
 * @returns {String}
 */

fs.writeFileSync("output.txt", JSON.stringify(FILE_OUTPUT.split(" ")), {
  encoding: "utf8",
  flag: "w",
});
function removeSpaces(text) {
  // console.log(text.split());
  if (!Array.isArray(text)) text = text.split("\n");
  return text.map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
}

/**
 * @name extract_main_text
 * @description separates the table of contents from the maintext
 * @returns {String[]} [contents, mainText]
 * @param {String} FILE_OUTPUT
 */

function extract_main_text() {
  // match all text that match the content table
  const getLines = removeSpaces(FILE_OUTPUT);

  let keywords = ["contents", "table of contents", "index"];
  const contentBoundary = [];

  keywords.forEach((k) => {
    let index = getLines.findIndex((e) => e.toLowerCase() === k);
    if (index >= 0) contentBoundary.push(index);
  });

  console.log(contentBoundary);

  const contents = getLines.slice(...contentBoundary);
  contents.forEach((con) => {
    con = con.replace(/^\d+/, "");
    console.log(con);
  });

  console.log("contents", contents);

  const mainText = getLines
    .slice(contentBoundary.at(-1))
    .filter((line) => contents.includes(line));

  console.log("mainText", mainText);
  // const escaped = removeSpaces(content)//.join("\n");
  // .filter(Boolean)
  // .join(" ")
  // .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  // .map((s) => `^${s}$`)
  // .map((s) => `\\b${s}\\b`);

  //   const pattern = new RegExp(`\\b(${escaped.join("|")}\\b)`, "gi");
  // const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  // console.log("pattern", pattern);

  // const mainTextArray = removeSpaces(FILE_OUTPUT)
  //   // .join(" ")
  //   .split(pattern)
  //   .filter(Boolean);
  //   console.log(mainTextArray);
  // feed the contents into an array of strings

  // match all text that dont pass the initial regex
  // feed that into a separate array

  // return the content and main text as an array
}
extract_main_text();
