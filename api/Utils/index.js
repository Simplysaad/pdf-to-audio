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
import axios from "axios";
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
  let buffer;
  let filename;
  const isUrl = PDF_FILE.startsWith("https://") || PDF_FILE.startsWith("http://");

  try {
    // Phase 1: Read or Download the File
    if (isUrl) {
      const maxRetries = 4;
      let attempts = 0;

      while (attempts < maxRetries) {

        try {
          const response = await axios.get(PDF_FILE, { responseType: "arraybuffer", timeout: 150000 });
          buffer = Buffer.from(response.data);
          filename = path.basename(new URL(PDF_FILE).pathname);
          break;
        } catch (downloadErr) {
          attempts++;

          console.warn(`Download attempt ${attempts} failed: ${downloadErr.message}`);

          if (attempts >= maxRetries) {
            throw new Error("Unable to download file from cloud after maximum retry attempts");
          }

          const delayTime = 1000 * attempts;
          await new Promise(resolve => setTimeout(resolve, delayTime));
        }
      }

    } else {
      try {
        buffer = fs.readFileSync(PDF_FILE);
        filename = path.basename(PDF_FILE);
      } catch (readErr) {
        throw new Error("Unable to read file from local storage");
      }
    }

    // Phase 2: Parse the PDF Buffer
    try {
      const output = await PdfParse(buffer);
      const author = output.info?.Author || output.info?.Creator || "Unknown Author";

      return {
        title: filename,
        author: author,
        text: output.text
      };
    } catch (parseErr) {
      throw new Error("Unable to extract text from PDF");
    }

  } catch (error) {
    // Log the actual underlying operational error for debugging
    console.error("PDF Processing Detailed Error:", error);
    // Rethrow the clean, user-friendly error message upward to the Express route
    throw error;
  }
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
 * @param {String} text
 */

export async function splitChapters(text) {
  // const { text } = await extract_text_from_PDF(path);

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
   # Role
You are an expert editor and information architect specializing in high-density text summarization.

# Task
Generate a concise, high-comprehension summary of the provided text. Extract the core arguments, critical data, and essential insights while maintaining absolute brevity.

# Guidelines
1. **Analyze Strategy**: Identify the primary thesis, supporting arguments, and definitive conclusions.
2. **Prioritize Value**: Focus strictly on the "need-to-know" information; ruthlessly eliminate filler, repetition, and background context.
3. **Optimize Word Count**: Keep the output as brief as possible without sacrificing the text's original meaning or logical flow.
4. **Maintain Clarity**: Ensure a non-expert reader can fully grasp the core concepts immediately upon reading.
5. **Preserve Accuracy**: Do not extrapolate, assume, or introduce outside information.

# Output Format
* **One-Sentence Summary**: A single, punchy overview of the main takeaway (under 25 words).
* **Key Insights**: A bulleted list of the absolute most critical points, using bold text for visual anchors.
* **Actionable Conclusion**: A brief, final statement on the overall impact or outcome of the text.

# Constraints
* Use short, direct sentences.
* Avoid passive voice.
* No introductory or concluding conversational filler (e.g., do not say "Here is your summary").

# Source Text
 ${main}
`;

  // console.log("prompt", prompt)
  // Using 1.5-flash for speed and low cost
  return await callGemini({ prompt, model: "gemini-2.5-flash-lite" });
}


export async function generatePodcastScript(summariesText) {
  const prompt = `
# Role
You are a versatile, world-class podcast producer capable of translating complex topics—ranging across STEM, behavioral sciences, history, and the arts—into gripping audio narratives.

# Task
Analyze the provided summary, determine its domain, and write a captivating 5-minute podcast script.

# Domain-Specific Adaptability
Before writing, identify the core field of the text and apply the corresponding storytelling framework:
*   **Science/Engineering**: Focus on the "Mind-Blowing Breakthrough." Use vivid analogies to explain complex data. Emphasize the "How it works" and the future impact.
*   **Psychology/Behavioral Science**: Focus on the "Human Element." Use relatable everyday scenarios. Emphasize why the reader should care about their own mind or society.
*   **Arts/Humanities**: Focus on "Emotion and Culture." Use descriptive, sensory language. Emphasize the creative struggle, historical context, and philosophical meaning.

# Research & Expansion Rule
You must search for and integrate outside context (real-world examples, historical parallels, counter-intuitive facts, or thought experiments) to maximize entertainment value. The core plot and takeaways must remain 100% consistent with the provided summary.

# Format & Structure
*   **Hosts**: **Alex** (the relatable, curious proxy for the audience) and **Sam** (the domain expert who breaks down concepts simply).
*   **The Hook**: Start with a provocative question, a shocking statistic, or a vivid "imagine this" scenario. Never start with generic introductions.
*   **Word Count**: 650–750 words (5 minutes of spoken dialogue). Include audio/SFX cues in brackets [like this].
*   **Tone**: Conversational, fast-paced, and intellectually engaging. Use natural banter, contractions, and verbal pauses (e.g., "Wait...", "Huh, interesting.").

# Source Summary
    ${detailedSummaries}
`;

  return await callGemini({ prompt, model: "gemini-2.5-flash" });
}

/**
 * user starts
 * user uploads pdf to server
 * server uploads to cloudinary
 *
 * server downloads file from cloudinary
 * server converts to text then audio
 * server uploads audio to cloudinary
 *
 * server returns the links to all of the audio as an array
 * bot creates message for each audio file
 * bot sends it back to the user
 */

// import "dotenv/config"
// import { generatePodcastScript, generateSummary, getMetaData, splitChapters } from "./Utils/index.js";

// const mainTextArray = await splitChapters("./test_2.pdf")
// const { title } = await getMetaData("./test_2.pdf")
// // console.log(mainTextArray)

// // await processFullBook(mainTextArray)


async function processFullBook(chunks, bookTitle) {
  const summaries = [];

  console.log(`🚀 Starting sequential processing for ${chunks.length} chapters...`);

  for (const [index, chunk] of chunks.entries()) {
    console.log(`Processing Chapter ${index + 1}/${chunks.length}: ${chunk.title}...`);

    const summary = await generateSummary(chunk, bookTitle);

    if (summary) {
      summaries.push(summary);
      console.log(`✅ Chapter ${index + 1} complete.`);
    } else {
      console.error(`❌ Chapter ${index + 1} failed.`);
      summaries.push(`[Summary missing for chapter: ${chunk.title}]`);
    }

    // 💡 THE CRITICAL PART: The "Cooldown"
    // On the Free Tier, wait 2-3 seconds between calls to keep the API happy.
    await new Promise(resolve => setTimeout(resolve, 3000));
  }



  const aggregateText = summaries.join("\n\n--- NEXT CHAPTER ---\n\n");
  // TODO: remove during prod
  fs.writeFile("./test/summary.json", JSON.stringify(aggregateText) || aggregateText || "nothing yet", "utf-8", (err) => {
    if (err) console.error(err)
    console.log("successfully written to file1")
  })



  console.log("🎤 Generating final podcast script...");
  const podcastScript = await generatePodcastScript(aggregateText);
  // TODO: remove during prod
  fs.writeFile("./test/podcast.html", JSON.stringify(podcastScript) || aggregateText || "nothing yet", "utf-8", (err) => {
    if (err) console.error(err)
    console.log("successfully written to file2")
  })

  return podcastScript

}