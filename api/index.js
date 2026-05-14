/**
 * user starts
 * user uploads pdf to server
 * server uploads to cloudinary
 *
 * server downloads file from cloudinary
 * server converts to text then audio
 * server uploads audio to cloudinary
 *
 * server returns the links to all of the audio as an array
 * bot creates message for each audio file
 * bot sends it back to the user
 */

import "dotenv/config"
import fs from "fs";
import { generatePodcastScript, generateSummary, getMetaData, splitChapters } from "./Utils/index.js";

const mainTextArray = await splitChapters("./test_2.pdf")
const { title } = await getMetaData("./test_2.pdf")
// console.log(mainTextArray)

await processFullBook(mainTextArray)
async function processFullBook(chunks, bookTitle) {
    const summaries = [];

    console.log(`🚀 Starting sequential processing for ${chunks.length} chapters...`);

    for (const [index, chunk] of chunks.entries()) {
        console.log(`Processing Chapter ${index + 1}/${chunks.length}: ${chunk.title}...`);

        const summary = await generateSummary(chunk, bookTitle);

        if (summary) {
            summaries.push(summary);
            console.log(`✅ Chapter ${index + 1} complete.`);
        } else {
            console.error(`❌ Chapter ${index + 1} failed.`);
            summaries.push(`[Summary missing for chapter: ${chunk.title}]`);
        }

        // 💡 THE CRITICAL PART: The "Cooldown"
        // On the Free Tier, wait 2-3 seconds between calls to keep the API happy.
        await new Promise(resolve => setTimeout(resolve, 3000));
    }



    const aggregateText = summaries.join("\n\n--- NEXT CHAPTER ---\n\n");
    // TODO: remove during prod
    fs.writeFile("./test/summary.json", JSON.stringify(aggregateText) || aggregateText || "nothing yet", "utf-8", (err) => {
        if (err) console.error(err)
        console.log("successfully written to file1")
    })



    console.log("🎤 Generating final podcast script...");
    const podcastScript = await generatePodcastScript(aggregateText);
    // TODO: remove during prod
    fs.writeFile("./test/podcast.html", JSON.stringify(podcastScript) || aggregateText || "nothing yet", "utf-8", (err) => {
        if (err) console.error(err)
        console.log("successfully written to file2")
    })

    return podcastScript

}