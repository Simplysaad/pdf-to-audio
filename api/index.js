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


// console.log(process.env)

let extracted_text = await extract_text_from_PDF("./test.pdf")
console.log(extracted_text)

let response = await getChapterMap(extracted_text.text)

console.log(response)