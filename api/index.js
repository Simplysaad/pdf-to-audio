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

import "dotenv/config"
import extract_text_from_PDF from "./Utils/parsePdf.js"
import { getChapterMap } from "./Utils/splitChapters.js"
import { config } from "dotenv"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { splitTextIntoChapters } from "./Utils/chunking.js";


// console.log(process.env)

let { text } = await extract_text_from_PDF("./test.pdf")
console.log("text", text)

let chapterMap = await getChapterMap(text)

console.log("chapterMap", chapterMap)

// const chapters = chapterMap.chapters

const chunks = splitTextIntoChapters(text, chapterMap)
console.log("chunks", chunks)