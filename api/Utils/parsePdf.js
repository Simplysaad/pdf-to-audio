/**
 *
 * @param {String} PDF_FILE
 * @returns {{title: string, author: string, text: string}}
 * @example
 * ```
 * extract_text_from_PDF("./atomic-habits.pdf");
 * ```
 */

import PdfParse from "pdf-parse";
import fs from "fs"
import path from "path";

export default async function extract_text_from_PDF(PDF_FILE) {
    try {
        const buffer = fs.readFileSync(PDF_FILE);
        const output = await PdfParse(buffer);

        const filename = path.basename(PDF_FILE);

        // Fallback logic for author: check Author first, then Creator
        const author = output.info.Author || output.info.Creator || "Unknown Author";

        output.text.replace("'\n' +'\n' +'\n' +'\n' +'\n' +'\n' +'\n' +'\n'", "")
        return {
            title: output.info.Title || filename,
            author: author,
            info: output.info,
            text: output.text // PdfParse already returns a string, no need for .toString("utf8")
        };
    } catch (error) {
        console.error("Failed to parse PDF:", error.message);
        throw error;
    }
}

