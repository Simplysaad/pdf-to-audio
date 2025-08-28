import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_KEY;

const bot = new TelegramBot(token);
import {
  compressPlaylist,
  createAudio,
  extract_text_from_PDF,
  splitChapters,
  uploadAudio
} from "../Utils/index.js";

bot.onText(/\/start/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

bot.on("document", async (msg) => {
  try {
    const fileId = msg.document.file_id;

    const fileInfo = await bot.getFile(fileId);

    const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_KEY}/${fileInfo.file_path}`;

    let fileUrl = await cloudinary.uploader.upload(url, (error, result) => {
      console.log(result, error);
    });

    let uploadFile = req.file;

    console.log("uploadFile", uploadFile);

    let { title } = await extract_text_from_PDF(uploadFile.path);

    let mainTextArray = await splitChapters(uploadFile.path);

    let createdFiles = await createAudio(mainTextArray, "david");

    // let folder_path = createdFiles[0]?.split("/").slice(0, -1);

    let uploadedFiles = await uploadAudio(createdFiles);

    const chapters = uploadedFiles.map((chapter, index) => {
      return {
        name: chapter.name || `chapter-${index}`,
        path: chapter.secure_url
      };
    });

    const newUpload = new Upload({
      chatId,
      title,
      chapters
    });

    await newUpload.save();

    // let zipFilePath = compressPlaylist(folder_path);

    const data = {
      mainTextArray,
      newUpload
      // createdFiles,
      // zipFilePath,
    };

    // console.log("data", data);
    return data;

    return res.json({
      success: true,
      message: "upload complete",
      data
    });
  } catch (err) {
    console.error(err);
  }
});
