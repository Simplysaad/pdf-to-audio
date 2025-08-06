import express from "express";
import PdfParse from "pdf-parse";

import fs from "fs";
import { removeSpaces } from "./Utils/helper.util.js";
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

let PDF_FILE = "./atomic-habits.pdf";
let dataBuffer = fs.readFileSync(PDF_FILE);
PdfParse(dataBuffer)
  .then(function (data) {
    fs.writeFileSync(`${PDF_FILE}.txt`, data.text, {
      encoding: "utf8",
      flag: "w",
    });
    debugger;
  })
  .catch(function (err) {
    debugger;
  });

const TEXT_FILE = "./atomic-habits.pdf.txt";

const output = fs.readFileSync(TEXT_FILE).toString("utf-8");
const contents = output
  .replaceAll("\n", " ")
  .match(/contents\s+(.*?)\s+index/gi)[0]
  .split(" ");

console.log(contents);

const escaped = removeSpaces(contents)
  .filter(Boolean)
  .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .map((s) => `\\b${s}\\b`);

const pattern = new RegExp(`\\b(${escaped.join("|")}\\b)`, "gi");

const outputArray = removeSpaces(output)
  .join(" ")
  .split(pattern)
  .filter(Boolean);

console.log(outputArray[0]);
// say.speak(outputArray[0]);
// console.log("pattern", pattern);

// outputArray.forEach((element, index) => {
//   if (!pattern.test(element)) {
//     say.export(element, null, 1.0, `./ATOMIC/${outputArray[index - 1]}.wav`, (err) => {
//       if (err) {
//         console.error(err);
//       }

//       console.log(`audio file saved as ${outputArray[index - 1]}.wav`);
//     });
//   }
// });

say.export(outputArray[0], null, 1.0, `${outputArray[9]}.wav`, (err) => {
  if (err) {
    return console.error(err);
  } else console.log(`audio file saved as ${outputArray[9]}.wav`);
  console.log(outputArray[10]);
});
