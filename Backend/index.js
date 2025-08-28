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

import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
// import { createAudio, splitChapters, uploadAudio } from "./Utils/index.js";
import Upload from "./Models/upload.model.js";

const token = process.env.TELEGRAM_BOT_KEY;

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start (.+)/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `Hey ${msg.from.first_name}, thanks for using splitChapters, kindly upload your PDF file and let's do the magic!`
  );
});

// bot.on("document", async (msg) => {
//   try {
//     // Accept file upload from user
//     const fileId = msg.document.file_id;
//     const fileInfo = await bot.getFile(fileId);
//     const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_KEY}/${fileInfo.file_path}`;

//     // Upload user file to cloudinary from telegram server
//     let PdfFileUrl = await cloudinary.uploader.upload(url, (error, result) => {
//       console.log(result, error);
//     });

//     // Download pdf file unto my server
//     const response = await fetch(PdfFileUrl);
//     const buffer = await response.buffer();

//     let downloadPath = "./downloaded-file.pdf";

//     fs.writeFileSync(downloadPath, buffer);
//     // console.log("pdf downloaded successfully")

//     // Convert text to audio
//     const [title, mainTextArray] = splitChapters(downloadPath);

//     let createdFiles = await createAudio(mainTextArray, "david");

//     let uploadedFiles = await uploadAudio(createdFiles);

//     const chapters = uploadedFiles.map((chapter, index) => {
//       return {
//         name: chapter.name || `chapter-${index}`,
//         path: chapter.secure_url
//       };
//     });

//     const newUpload = new Upload({
//       chatId,
//       title,
//       chapters
//     });

//     await newUpload.save();

//     newUpload.chapters.forEach((chapter) => {
//       let response = fetch(chapter.path)
//         .then((data) => data.buffer())
//         .then((buffer) => bot.sendDocument(chatId), buffer);
//     });
//   } catch (err) {
//     console.error(err);
//   }
// });
