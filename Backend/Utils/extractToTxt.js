import PdfParse from "pdf-parse";
import fs from "fs";
import path from "path";

/**
 * Read the file and extract buffer
 * parse pdf buffer into txt
 * read from output.txt file
 * save txt into variable
 * delete the txt file
 */

export function cleanText(text) {
  const regex = /[\/\\.,\s+]/g;
  return text.split(regex).filter(Boolean).join("-");
}
export default async function extract_text_from_PDF(PDF_FILE) {

  
  const buffer = fs.readFileSync(PDF_FILE);
  const output = await PdfParse(buffer);
  output.text = output.text.toString("utf8");
  return {
    title: cleanText(output.info.Title.split(".").slice(0, -1).join(".")),
    author: output.info.Author,
    text: output.text,
  };
}

extract_text_from_PDF(path.join("./atomic-habits.pdf"));
