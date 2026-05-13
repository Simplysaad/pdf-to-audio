import { GoogleGenAI } from "@google/genai";

const { GEMINI_API_KEY } = process.env;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function getChapterMap(pdfText = "text not provided") {
    // Substring is faster than split/slice
    const sampleText = pdfText.substring(0, 20000);

    const prompt = `
        Analyze this text from a PDF.
        Identify the book title and the chapters.
        Return ONLY a JSON object with this exact structure:
        {
          "bookTitle": "string",
          "chapters": [
            { "id": 1, "title": "Chapter Title", "start_phrase": "First 10 words of the chapter" }
          ]
        }
        Text: ${sampleText}
    `;

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Use the current stable model
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        // result.text contains the raw string answer
        const rawText = result.text;

        // Clean up potential markdown formatting if Gemini adds it
        const cleanJson = rawText.replace(/```json|```/g, "").trim();

        const chapterMap = JSON.parse(cleanJson);
        console.log("✅ Chapter Map generated for:", chapterMap.bookTitle);

        return chapterMap;
    } catch (error) {
        // Detailed error logging
        console.error("Gemini Error:", error.message);
        return null;
    }
}