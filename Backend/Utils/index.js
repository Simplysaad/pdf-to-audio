/**
 * PROBLEM
 * I have a text that contains a table of contents and main text split into chapters
 * the table of contents has to be extracted and separated from the main text
 * then based on the table of contents, the main text is split into chapters
 * each of these chapters is exported as its own separate audio file in a folder "./[BOOK TITLE]"
 */

import fs from "fs";
import say from "say";
import path from "path";
import extract_text_from_PDF, { cleanText } from "./Utils/extractToTxt.js";
import compress_playlist from "./Utils/compress.js";

/**
 * @name removeSpaces
 * @description removes all unnecessary spaces from the given text and returns it as an array
 * @param {String | String[]} text
 * @returns {String}
 */

function removeSpaces(text) {
  if (!Array.isArray(text)) text = text.split("\n");
  return text.map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
}

/**
 * @name split_chapters
 * @description separates the main text into chapters
 * @returns {String[]} [contents, mainText]
 * @param {String} FILE_OUTPUT
 */

async function split_chapters() {
  // match all text that match the content table

  const { title, author, text } = await extract_text_from_PDF(
    "./atomic-habits.pdf"
  );
  const getLines = removeSpaces(text);

  let keywords = ["contents", "table of contents", "index"];
  const contentBoundary = [];

  keywords.forEach((k) => {
    let index = getLines.findIndex((e) => e.toLowerCase() === k);
    if (index >= 0) contentBoundary.push(index);
  });

  const contents = getLines.slice(...contentBoundary);
  let contentArray = contents.map((con) => con.replace(/^\d+/, "").trim());

  const mainText = getLines.slice(contentBoundary.at(-1));

  let contentsIndexArr = [];
  contentArray.forEach((con) => {
    let idx = mainText.findIndex((x) => x === con);
    if (idx !== -1) {
      contentsIndexArr.push(idx);
    }
  });

  let mainTextArray = [];
  contentsIndexArr.forEach((contentIndex, idx) => {

    const main = mainText.slice(contentIndex, contentsIndexArr[idx + 1])
    main[0] += " , "


    mainTextArray.push({
      index: idx,
      title: mainText[contentIndex],
      next: mainText[contentsIndexArr[idx + 1]],
      main: main.join(" "),
    });
  });

  const availableVoices = [
    "Microsoft Hazel Desktop",
    "Microsoft David Desktop",
    "Microsoft Zira Desktop",
  ];

  if (!fs.existsSync(title)) {
    console.log("just creating it...");
    fs.mkdirSync(title);
    console.log("exporting...");
  }
  let main_start = new Date();

  for (let i = 0; i < mainTextArray.length; i++) {
    let start = new Date();
    say.export(
      mainTextArray[i].main,
      "Microsoft David Desktop",
      null,
      `./${title}/${i + 1}-${mainTextArray[i].title}.wav`,
      (err) => {
        if (err) return console.error(err);
        let end = new Date();
        console.log(
          `export to ${i + 1}-${mainTextArray[i].title}.wav took ${
            (end - start) / 1000
          }s`
        );
        if (i == mainTextArray.length - 1){
          compress_playlist(path.join(`./${title}`));
          let main_end = new Date();
          console.log(`all exports took ${(main_end - main_start) / 1000}s`);
        }
      }
    );
  }

  // compress_playlist(path.join(`./${title}`));
  // feed the contents into an array of strings

  // match all text that dont pass the initial regex
  // feed that into a separate array

  // return the content and main text as an array
}
split_chapters();
