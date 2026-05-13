/**
 * @format
 * I have a text that contains a table of contents and main text split into chapters
 * the table of contents has to be extracted and separated from the main text
 * then based on the table of contents, the main text is split into chapters
 * each of these chapters is exported as its own separate audio file in a folder "./[BOOK TITLE]"
 */

import fs from "fs";
import say from "say";
import path from "path";
import AdmZip from "adm-zip";
import cloudinary from "../Config/cloudinary.js";
import PdfParse from "pdf-parse";

/**
 * Read the file and extract buffer
 * parse pdf buffer into txt
 * read from output.txt file
 * save txt into variable
 * delete the txt file
 */

/**
 *
 * @param {String} text
 * @returns {String} cleanedText
 */
export function cleanText(text) {
  const regex = /[\/\\.,\s+]/g;
  return text.split(regex).filter(Boolean).join("-");
}

/**
 *
 * @param {String} PDF_FILE
 * @returns {{title: string, author: string, text: string}}
 * @example
 * ```
 * extract_text_from_PDF("./atomic-habits.pdf");
 * ```
 */

export async function extract_text_from_PDF(PDF_FILE) {
  const buffer = fs.readFileSync(PDF_FILE);
  const output = await PdfParse(buffer);

  // console.log(output)

  const filename = path.basename(PDF_FILE);

  output.text = output.text.toString("utf8");
  return {
    title: filename, //cleanText(output.info.Title?.split(".").slice(0, -1).join(".")),
    author: output.info["Author" | "Creator"],
    text: output.text
  };
}

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
 * @name splitChapters
 * @description separates the main text into chapters
 * @returns {String[]} [contents, mainText]
 * @param {String} FILE_OUTPUT
 */

export async function splitChapters(path, chaptersOnly = true) {
  const { title, author, text } = await extract_text_from_PDF(path);
  const lines = removeSpaces(text); // Assuming this cleans text and returns array of lines

  const startKeywords = [
    "table of contents",
    "contents",
    "chapters",
    "chapter list",
    "contents page",
    "summary",
    "overview",
    "outline"
  ];

  const endKeywords = [
    "index",
    "bibliography",
    "references",
    "list of figures",
    "list of tables",
    "end of contents",
    "colophon",
    "acknowledgements",
    "back matter",
    "index terms"
  ];

  // Helper function to find index based on keywords
  function findKeywordIndex(arr, keywords, fromStart = true) {
    const lowerArr = arr.map((line) => line.toLowerCase());
    if (fromStart) {
      for (let i = 0; i < lowerArr.length; i++) {
        for (const keyword of keywords) {
          if (lowerArr[i].includes(keyword)) {
            return i;
          }
        }
      }
    } else {
      for (let i = lowerArr.length - 1; i >= 0; i--) {
        for (const keyword of keywords) {
          if (lowerArr[i].includes(keyword)) {
            return i;
          }
        }
      }
    }
    return -1;
  }

  const startIndex = findKeywordIndex(lines, startKeywords, true);
  if (startIndex === -1) {
    console.error("Start keyword not found");
    return null;
  }

  const endIndex = findKeywordIndex(lines, endKeywords, true);
  if (endIndex === -1 || endIndex <= startIndex) {
    console.error("End keyword not found or invalid");
    return null;
  }

  // Extract the contents lines located between startIndex and endIndex
  const contents = lines.slice(startIndex, endIndex);

  // Remove leading numbers and whitespace from contents
  const cleanedContents = contents.map((line) =>
    line.replace(/^\d+/, "").trim()
  );

  // Extract main text lines after endIndex
  const mainText = lines.slice(endIndex);

  // Find indices of each contents line in mainText
  const contentsIndexArr = cleanedContents.map((content) =>
    mainText.findIndex((line) => line === content)
  );

  const mainTextArray = [];
  const chapters = [];
  for (let i = 0; i < contentsIndexArr.length; i++) {
    const currIndex = contentsIndexArr[i];
    let nextIndex = contentsIndexArr[i + 1] || mainText.length;
    if (currIndex === -1) continue; // skip if content title not found

    const [title, ...chapterLines] = mainText.slice(currIndex, nextIndex);
    chapterLines[0] += " , ";

    mainTextArray.push({
      index: i,
      title: mainText[currIndex],
      next: mainText[nextIndex] || null,
      main: chapterLines.join(" ")
    });

    chapters.push(mainText[currIndex]);
  }

  if (chaptersOnly) return chapters;
  else return [title, mainTextArray];
}

/**
 * converts the text array given to audio files and export to a dedicated folder
 * @description
 * 1. feed the contents into an array of strings
 * 2. match all text that dont pass the initial regex
 * 3. feed that into a separate array
 * 4. return the content and main text as an array
 *
 * @param {String[]} mainTextArray
 * @param {String} voice
 * @returns {String[]} createdFiles
 */
export async function createAudio(mainTextArray, voice = "hazel") {
  const voices = [
    {
      name: "hazel",
      value: "Microsoft Hazel Desktop"
    },
    {
      name: "david",
      value: "Microsoft David Desktop"
    },
    {
      name: "zira",
      value: "Microsoft Zira Desktop"
    }
  ];

  voice = voices.find((v) => v === voice).value;

  if (!fs.existsSync(title)) {
    console.log("creating a new folder...");
    fs.mkdirSync(title);
    console.log("exporting...");
  }

  let main_start = new Date();

  let createdFiles = [];

  for (let i = 0; i < mainTextArray.length; i++) {
    let start = new Date();

    let filePath = `./${title}/${i + 1}-${mainTextArray[i].title}.wav`;

    say.export(mainTextArray[i].main, voice, null, filePath, (err) => {
      if (err) return console.error(err);
      let end = new Date();
      console.log(`export to ${filePath} took ${(end - start) / 1000}s`);

      createdFiles.push(filePath);

      if (i == mainTextArray.length - 1) {
        // compressPlaylist(path.join(`./${title}`));
        let main_end = new Date();
        console.log(`all exports took ${(main_end - main_start) / 1000}s`);
      }
    });

    return createdFiles;
  }
}

/**
 * @name uploadAudio
 * @description uploads files to cloudinary storage concurrently
 * @param {Array<{path: string}>} files - Array of file objects with path property
 * @param {Object} preset
 * @returns {Promise<Array>}
 */
export async function uploadAudio(files, preset) {
  try {
    const uploadPromises = files.map((file) => {
      cloudinary.uploader.upload(file.path, preset, (error, result) => {
        console.log(result, error);
      });
    });

    let uploadedAudio = await Promise.all(uploadPromises);
    return uploadedAudio;
  } catch (err) {
    console.error(err);
  }
}

/**
 * @name compressPlaylist
 * @description takes a folder or file and compresses it into a zip file
 * @param {String} folder_path
 * @returns {String} zipFilePath
 * @example
 * ```
 * compressPlaylist("../path/to/file")
 * ```
 */
export function compressPlaylist(folder_path) {
  const zip = new AdmZip();

  try {
    zip.addLocalFolder(folder_path);
    zip.writeZip(path.basename(folder_path) + ".zip", (err) => {
      if (err) {
        throw new Error(
          `error encountered while compressing files: ${err.message}`
        );
      }
      console.log("file compressed successfully");
      return path.basename(folder_path) + ".zip";
    });
  } catch (err) {
    console.error(err);
  }
}
