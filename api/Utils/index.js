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
// import cloudinary from "../Config/cloudinary.js";
import PdfParse from "pdf-parse";
import { getChapterMap } from "./getChapterMap.js";
import { callGemini } from "./callGemini.js";

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

export async function getMetaData(PDF_FILE) {
  const buffer = fs.readFileSync(PDF_FILE);
  const output = await PdfParse(buffer);


  const filename = path.basename(PDF_FILE);

  // output.text = output.text.toString("utf8");
  // console.log("output", output)
  return {
    title: output.info.Title || output.Title || filename,
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

export async function splitChapters(path) {
  const { text } = await extract_text_from_PDF(path);

  const lines = removeSpaces(text);

  const chapterMap = await getChapterMap(text);
  if (!chapterMap) {
    console.log("❎ Unable to Split text into chapters");
    return {
      success: false,
      message: "❎ Unable to Split text into chapters, Try Again"
    };
  }

  const chaptersList = chapterMap?.chapters || [];

  const mainTextArray = [];

  // 1. Skip the TOC
  // We look for the first chapter's title. 
  // We search for the *second* occurrence (usually the first is TOC, second is Body)
  let firstOccurrence = lines.findIndex(line => line.includes(chaptersList[0]?.title));
  let startSearchFrom = lines.findIndex((line, idx) =>
    idx > firstOccurrence && line.includes(chaptersList[0].title)
  );

  // If we can't find a second occurrence, fall back to the first + a safe buffer
  if (startSearchFrom === -1) startSearchFrom = firstOccurrence + 20;

  let currentPointer = startSearchFrom;

  for (let i = 0; i < chaptersList.length; i++) {
    const currentTitle = chaptersList[i].title;
    const nextChapter = chaptersList[i + 1];

    // Find where THIS chapter actually starts
    const startIndex = lines.findIndex((line, idx) =>
      idx >= currentPointer && line.includes(currentTitle)
    );

    if (startIndex === -1) continue;

    // Find where the NEXT chapter starts
    let endIndex = lines.length;
    if (nextChapter) {
      const foundEnd = lines.findIndex((line, idx) =>
        idx > startIndex + 5 && line.includes(nextChapter.title)
      );
      if (foundEnd !== -1) endIndex = foundEnd;
    }

    // Extract the content
    const chapterLines = lines.slice(startIndex, endIndex);
    const content = chapterLines.join(" ").trim();

    mainTextArray.push({
      id: i + 1,
      title: currentTitle,
      main: content
    });

    // Move the pointer forward so the next loop starts AFTER this chapter
    currentPointer = endIndex;
  }

  console.log("✅ Successfully split into:", mainTextArray.length, "chapters");
  return mainTextArray;
}

/**
 * converts the text array given to audio files and export to a dedicated folder
 * @description
 * 1. feed the contents into an array of strings
 * 2. match all text that dont pass the initial regex
 * 3. feed that into a separate array
 * 4. return the chapter and main text as an array
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
// export async function uploadAudio(files, preset) {
//   try {
//     const uploadPromises = files.map((file) => {
//       cloudinary.uploader.upload(file.path, preset, (error, result) => {
//         console.log(result, error);
//       });
//     });

//     let uploadedAudio = await Promise.all(uploadPromises);
//     return uploadedAudio;
//   } catch (err) {
//     console.error(err);
//   }
// }

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


export async function generateSummary(chapter, bookTitle) {
  // Destructure properties from the chunk object
  const { title: chapterTitle, main } = chapter;

  // console.log("chunk", chunk)

  const prompt = `
   System Role: You are a technical data extractor. Analyze this text from '${bookTitle}', Chapter: '${chapterTitle}'.

    Task: Extract the core architecture into a raw JSON object with these exact keys:
    - "thesis": A 1-sentence core purpose.
    - "mechanisms": An array of 3-5 technical bullet points.
    - "insight": The absolute most critical concept a student must remember.

    Constraint: Return ONLY valid JSON. No markdown wrappers, no backticks, no markdown formatting.

    Text: ${main}
      `;

  // console.log("prompt", prompt)
  // Using 1.5-flash for speed and low cost
  return await callGemini({ prompt, model: "gemini-2.5-flash-lite" });
}


export async function generatePodcastScript(summariesText) {
  const prompt = `
System Role: You are an elite audio scriptwriter.
    Convert the following array of sequential chapter summaries from the book '${bookTitle
    }' into a fluid podcast script.

    Guidelines:
    1. Identify 2 domain authorities to act as constant hosts throughout the entire show.
    2. Maintain a continuous narrative arc. Host A uses the Feynman Technique (simple physical analogies) and Host B maps it back to technical reality.
    3. Sequence through the chapter data array naturally without explicitly listing chapter numbers.
    4. Output the script as an array of JSON speaker blocks utilizing "voice" (SPEAKER_1/SPEAKER_2),
"speaker_name", and "text" keys. Include SSML pause tags (<break time="500ms"/>) inside the text strings.

    Source Material JSON Data:
    ${JSON.stringify(detailedSummaries, null, 2)}
    `;

  return await callGemini({ prompt, model: "gemini-2.5-flash" });
}
