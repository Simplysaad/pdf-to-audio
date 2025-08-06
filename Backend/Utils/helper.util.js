export function removeSpaces(text) {
  let textArray;
  if (Array.isArray(text)) textArray = text;
  else textArray = text.split(" ");
  return textArray.map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
}
