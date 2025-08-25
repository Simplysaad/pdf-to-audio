/**
 * User uploads a pdf file
 *
 * convert pdf to txt
 * return split chapters
 *
 *
 *
 * upload file to cloudinary
 * create audio files from the pdf
 * upload the audio files
 * return the chapters with links to each pof their audio files
 *
 */

import {
  compressPlaylist,
  createAudio,
  extract_text_from_PDF,
  splitChapters,
} from "../Utils/index.js";

export async function postUpload(req, res, next) {
  try {
    let uploadFile = req.file;

    console.log("uploadFile", uploadFile);

    let mainTextArray = await extract_text_from_PDF(uploadFile.path);

    let chapters = await splitChapters(uploadFile.path);

    // let createdFiles = createAudio(mainTextArray, "david");

    // let folder_path = createdFiles[0]?.split("/").slice(0, -1);

    // let zipFilePath = compressPlaylist(folder_path);

    const data = {
      mainTextArray,
      chapters,
      // createdFiles,
      // zipFilePath,
    };

    console.log("data", data);

    return res.json({
      success: true,
      message: "upload complete",
      data,
    });
  } catch (err) {
    next(err);
  }
}
