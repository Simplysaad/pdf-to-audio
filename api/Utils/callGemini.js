import { GoogleGenAI } from "@google/genai";

const { GEMINI_API_KEY } = process.env;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function callGemini({ prompt, returnType, model }) {
    try {
        const result = await ai.models.generateContent({
            model: model || "gemini-3.1-flash-lite",
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });
        if (result) console.log("✅ Prompt executed successfully", result);

        // result.text contains the raw string answer
        const rawText = result.text;

        if (returnType === "json") {
            const cleanJson = rawText.replace(/```json|```/g, "").trim();
            return JSON.parse(cleanJson);
        }

        return rawText

    } catch (error) {
        // Detailed error logging
        console.error("❌ Gemini Error:", error.message);
        return null;
    }
}