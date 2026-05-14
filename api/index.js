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
import { splitChapters } from "./Utils/index.js";


// console.log(process.env)

// let { text } = await extract_text_from_PDF("./test.pdf")
// console.log("text", text)

// let chapterMap = await getChapterMap(text)

// console.log("chapterMap", chapterMap)

// // const chapters = chapterMap.chapters

// const chunks = splitTextIntoChapters(text, chapterMap)
// console.log("chunks", chunks)

const text = await splitChapters("./test.pdf")

console.log(text)