export function splitTextIntoChapters(fullText, chapterMap) {
    const { chapters } = chapterMap;
    const chunks = [];

    /**
     * FIX 1: Find the actual end of the Table of Contents.
     * We look for the last chapter's title + a page number.
     * Or, we simply search for the first chapter starting from 
     * a safe distance (e.g., index 15000).
     */
    const lastChapterInTOC = chapters[chapters.length - 1].title;
    const tocEndEstimate = fullText.indexOf(lastChapterInTOC) + 100;

    let currentSearchIndex = tocEndEstimate;

    for (let i = 0; i < chapters.length; i++) {
        const currentChapter = chapters[i];
        const nextChapter = chapters[i + 1];

        // Search only from where the last chapter ended
        let startIdx = fullText.indexOf(currentChapter.start_phrase, currentSearchIndex);

        // FALLBACK: If start_phrase fails, try the Title
        if (startIdx === -1) {
            startIdx = fullText.indexOf(currentChapter.title, currentSearchIndex);
        }

        if (startIdx === -1) {
            console.warn(`⚠️ Skipped ${currentChapter.title}: Not found after index ${currentSearchIndex}`);
            continue;
        }

        let endIdx;
        if (nextChapter) {
            // Find the NEXT chapter, starting from the end of THIS one
            endIdx = fullText.indexOf(nextChapter.start_phrase, startIdx + 50);

            // If next phrase isn't found, try finding the next Title
            if (endIdx === -1) {
                endIdx = fullText.indexOf(nextChapter.title, startIdx + 50);
            }
        }

        // If it's the last chapter or we can't find the next one, go to the end
        if (!endIdx || endIdx === -1) {
            endIdx = fullText.length;
        }

        const content = fullText.substring(startIdx, endIdx).trim();

        chunks.push({
            id: currentChapter.id,
            title: currentChapter.title,
            content: content,
            length: content.length
        });

        // Move the pointer to the end of this chapter
        currentSearchIndex = endIdx;
    }

    return chunks;
}