import { Telegraf, Markup, session } from 'telegraf'
import "dotenv/config"
import axiosInstance from './utils/axiosInstance.js';



// Initialize the bot with your API token
const bot = new Telegraf(process.env.TELEGRAM_BOT_KEY);

// Start the bot using long-polling
bot.launch()
    .then(() => console.log('Bot is running!'))
    .catch((err) => console.error('Failed to start bot', err));

console.log('Bot is running!')


bot.command('status', async (ctx) => {
    const { data: response } = await axiosInstance.get("/api/status")
    console.log(response)

    await ctx.reply(response.message);
});

bot.use(session());

// 1. Initialize session defaults if they don't exist
bot.use((ctx, next) => {
    ctx.session ??= { step: 'idle', pdfData: null, audioSettings: {} };
    return next();
});

// 1. User runs /start
bot.start((ctx) => {
    ctx.reply("Welcome to SoundChapters, Kindly Upload your PDF file 📄 \n Upload only one and make sure it is only PDF")
})

// 2. User uploads file

bot.on("document", async (ctx) => {
    // console.log(ctx.message?.document)

    let document = ctx.message.document
    let fileLink = await ctx.telegram.getFileLink(document.file_id)

    const doc = {
        file_url: fileLink.href,
        ...document
    }

    const { data: response } = await axiosInstance.post("/api/podcast", {
        ...doc, chatId: ctx.chat.id
    })

    await ctx.reply(response.message)

    // console.log(response)
})
// 3. User selects what they want to do
// 4. Based on their choice, the bot runs the conversion process, sending messages intermittently