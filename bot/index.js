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



bot.start((ctx) => {

    ctx.reply('Welcome to my bot!', Markup.keyboard(["🎙️ PDF to Podcast", "Generate AudioBook", "📝 Exam Study Guide Generator", "🔍 Deep Research Digest"]))
}
);


bot.help((ctx) => ctx.reply('Send me a message and I will reply.'));


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

// 2. User triggers the flow
bot.command('convert', async (ctx) => {
    ctx.session.step = 'AWAITING_PDF';
    await ctx.reply('Please upload the PDF file you want to convert to audio 📄');
});

// 3. Catch all documents/files
bot.on('document', async (ctx) => {
    // If the user isn't in the correct step, ignore or guide them
    if (ctx.session.step !== 'AWAITING_PDF') {
        return ctx.reply('Use /convert to start a new audio extraction project.');
    }

    // Verify it is a PDF
    if (ctx.message.document.mime_type !== 'application/pdf') {
        return ctx.reply('Please upload a valid PDF file.');
    }

    // Store the file information in the session for later steps
    ctx.session.pdfData = {
        fileId: ctx.message.document.file_id,
        fileName: ctx.message.document.file_name
    };

    // Advance the state machine
    ctx.session.step = 'AWAITING_VOICE_SELECTION';

    // Ask the next question using inline buttons
    await ctx.reply(`Received: ${ctx.session.pdfData.fileName}.\nNow choose a narration voice:`,
        Markup.inlineKeyboard([
            [Markup.button.callback('Male Voice 🧔', 'voice_male')],
            [Markup.button.callback('Female Voice 👩', 'voice_female')]
        ])
    );
});

// 4. Handle the button selection
bot.action(/voice_(.+)/, async (ctx) => {
    if (ctx.session.step !== 'AWAITING_VOICE_SELECTION') {
        return ctx.answerCbQuery('Session expired. Please restart with /convert');
    }

    const selectedVoice = ctx.match[1]; // Extracts 'male' or 'female' from regex
    ctx.session.audioSettings.voice = selectedVoice;

    await ctx.answerCbQuery();
    await ctx.editMessageText(`Voice updated to: ${selectedVoice === 'male' ? 'Male 🧔' : 'Female 👩'}`);

    // Trigger the actual processing
    await ctx.reply('Sending your file to our backend conversion engine. Stand by...');

    // Hand off data to your API using Axios
    // const response = await axios.post('...', { fileId: ctx.session.pdfData.fileId, voice: ctx.session.audioSettings.voice });

    // Reset the user's session when complete
    console.log(ctx.session)
    ctx.session.step = 'idle';
    ctx.session.pdfData = null;
});

// Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'));
// process.once('SIGTERM', () => bot.stop('SIGTERM'));