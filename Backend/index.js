import express from "express";
import PdfParse from "pdf-parse";

import fs from "fs";
import {
  extractContent,
  removeSpaces,
  splitChapters,
} from "./Utils/helper.util.js";
import say from "say";

// const app = express();

// app.listen(4000, ()=>{
//     console.log("app listening on port 4000")
// })

const availableVoices = [
  "Microsoft Hazel Desktop",
  "Microsoft David Desktop",
  "Microsoft Zira Desktop",
];

// let PDF_FILE = "./atomic-habits.pdf";
// let dataBuffer = fs.readFileSync(PDF_FILE);
// PdfParse(dataBuffer)
//   .then(function (data) {
//     fs.writeFileSync(`${PDF_FILE}.txt`, data.text, {
//       encoding: "utf8",
//       flag: "w",
//     });
//   })
//   .catch(function (err) {
//     console.error(err);
//   });

const TEXT_FILE = "./atomic-habits.pdf.txt";

const output = fs.readFileSync(TEXT_FILE).toString("utf-8");
const contents = extractContent(output);
console.log(contents);

const chaptersArray = splitChapters(output);
console.log(chaptersArray[40]);

// console.log(chapterArray[0]);

// say.speak(chaptersArray[0]);
// console.log("pattern", pattern);

// chaptersArray.forEach((element, index) => {
//   if (!pattern.test(element)) {
//     say.export(element, null, 1.0, `./ATOMIC/${chaptersArray[index - 1]}.wav`, (err) => {
//       if (err) {
//         console.error(err);
//       }

//       console.log(`audio file saved as ${chaptersArray[index - 1]}.wav`);
//     });
//   }
// });

say.export(chaptersArray[0], null, 1.0, `${chaptersArray[9]}.wav`, (err) => {
  if (err) {
    return console.error(err);
  } else console.log(`audio file saved as ${chaptersArray[9]}.wav`);
  console.log(chaptersArray[10]);
});
