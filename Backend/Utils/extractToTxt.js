import PdfParse from "pdf-parse";
import fs from "fs";

let PDF_FILE = "./atomic-habits.pdf";
let dataBuffer = fs.readFileSync(PDF_FILE);
PdfParse(dataBuffer)
  .then(function (data) {
    fs.writeFileSync(`${PDF_FILE}.txt`, data.text, {
      encoding: "utf8",
      flag: "w",
    });
  })
  .catch(function (err) {
    console.error(err);
  });
