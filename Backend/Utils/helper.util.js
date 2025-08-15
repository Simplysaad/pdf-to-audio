export function removeSpaces(text) {
  let textArray;
  if (Array.isArray(text)) textArray = text;
  else textArray = text.split(" ");
  return textArray.map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
}

export function removeContent(output) {
  const contentsArray = removeSpaces(
    output
      .replaceAll("\n", " ")
      .match(/(contents)\s+(.*?)\s+index/gi)[0]
      .split(" ")
  );

  let outputArray = removeSpaces(output.replaceAll("\n", " ").split(" "));

  contentsArray.forEach((match) => {
    const index = outputArray.findIndex((s) => s === match);
    outputArray.splice(index, 1);
  });
}
export function extractContent(output) {
  return removeSpaces(
    output
      .replaceAll("\n", " ")
      .match(/(?:(?!contents\s+.*?\s+index))/gi)[0]
      .split(" ")
  );
}

// export function splitChapters() {
//   const escaped = contents
//     .filter(Boolean)
//     .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
//     .map((s) => `\\b${s}\\b`);

//   const pattern = new RegExp(`\\b(${escaped.join("|")}\\b)`, "gi");

//   const outputArray = removeSpaces(output)
//     .join(" ")
//     .split(pattern)
//     .filter(Boolean);
// }
export function splitChapters(output) {
  /**
   * convert the text into an array
   * find a match in the whole text
   * create an object
   * set the title property to the match
   * set the contents property to the next index
   */

  // convert the text into an array

  const contents = extractContent(output);
  const mainText = removeContent(output);

  const escaped = contents
    .filter(Boolean)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .map((s) => `\\b${s}\\b`);

  const pattern = new RegExp(`\\b(${escaped.join("|")}\\b)`, "gi");

  const outputArray = removeSpaces(mainText)
    .join(" ")
    .split(pattern)
    .filter(Boolean);

  console.log(outputArray[0]);

  const chapters = [];

  contents.forEach((item, index) => {
    // find a match in the whole text
    let matchIndex = outputArray.findIndex((s) => s === item);
    if (matchIndex) {
      //   create an object
      //  * set the title property to the match
      //  * set the contents property to the next index
      chapters.push({
        chapterIndex: index,
        title: outputArray[matchIndex],
        // its returning results from the contents array
        // i want to remove all the items in the array from the text
        // so i can find the match from the actual body
        content: outputArray[matchIndex + 2],
      });
    }
  });
  return chapters;
}
