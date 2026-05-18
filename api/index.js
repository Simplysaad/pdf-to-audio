import express from "express"
import "dotenv/config";
import { extract_text_from_PDF } from "./Utils/index.js";
import { getChapterMap } from "./Utils/getChapterMap.js";
import { Telegraf } from "Telegraf"
const app = express();

let { PORT } = process.env

const tgPush = new Telegraf(process.env.TELEGRAM_BOT_KEY).telegram

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.listen(PORT, (err) => {
    if (err) console.error("Unable to start server", err)
    else console.log("Server Up and running on " + PORT)
})

app.get("/api/status", async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Server up and running",
            data: {}
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server down, try again later",
            data: {}
        })
    }
})


app.post("/api/podcast", async (req, res, next) => {
    try {
        // Extract text from pdf

        const { file_url, file_name, chatId } = req.body

        await tgPush.sendMessage(chatId, "⏳ Step 1/3: Extracting text from PDF...");
        const { text } = await extract_text_from_PDF(file_url)

        await tgPush.sendMessage(chatId, "✅ Extraction complete! \n⏳ Step 2/3: Analyzing chapters and splitting text...");

        const chapterMap = await getChapterMap(text);
        let chapters = chapterMap.chapters.map((c) => c.title)

        await tgPush.sendMessage(chatId, `✅ Splitting complete! Generated ${chapters.length} chapters.\n⏳ Step 3/3: Synthesizing AI audio tracks...`);


        return res.status(200).json({
            success: true,
            message: `✅ Successfully Split text into the following chapters: 
                ${chapters.map((chapter) => "*" + chapter + "\n")}
            `
        })

    } catch (err) {
        next(err)
    }
})