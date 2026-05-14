# Technical Specification: P2P-Podcast-Pipeline

A system for deterministic chapter extraction and semantic transformation of technical PDF documents into SSML-formatted audio scripts.

## 1. Core Logic & Data Flow

The system operates as a linear pipeline with specific "guardrails" to handle the non-linear nature of PDF text streams.

### Phase A: Text Extraction & Normalization

* **Source:** `pdf-parse`
* **Normalization:** The raw string is stripped of excessive whitespace but preserves line breaks.
* **Constraint:** Technical books often contain headers/footers on every page. The system currently treats these as noise within the chapter `main` text.

### Phase B: The "TOC-Bypass" Chapter Mapping

To solve the issue of finding titles in the Table of Contents (TOC) instead of the actual chapters:

1. **Map Generation:** Gemini analyzes the first ~20k characters to identify the `chapterMap` (Title and Start Phrase).
2. **Sequential Search Pointer:**
* The system initializes a `currentSearchIndex`.
* It performs a `fullText.indexOf(chapterTitle, currentSearchIndex)`.
* Once a chapter is found, the `currentSearchIndex` is updated to the end of that chapter.
* **Logic:** This prevents the algorithm from "looking back" at the TOC once it has entered the body of the book.



### Phase C: Distributed Batch Processing

To manage LLM rate limits (especially on Free Tiers):

* **Pattern:** Sequential `for...of` loop with an asynchronous sleep timer (`setTimeout`).
* **Interval:** 3000ms between calls.
* **Atomicity:** Each chapter is summarized independently. If one chapter fails, the `null` result is caught, and the pipeline continues to the next.

## 2. Prompt Engineering Schema

### Chapter Summarization (Recursive)

* **Input:** Individual chapter `main` text.
* **Output Requirement:** Extraction of "Mental Models" and "Technical Mechanisms."
* **Purpose:** To compress ~50 pages of text into ~300 words of high-density data, fitting the context window for the final synthesis.

### Podcast Synthesis (The Feynman Transformation)

* **The Logic:** Uses the **Feynman Technique** (Explanation via analogy).
* **Roleplay:** Dynamically assigns "Authorities" based on the subject matter to increase the professional tone of the generated audio.
* **Format:** Strict **SSML (Speech Synthesis Markup Language)**.

## 3. Data Structures

### `chapterMap`

```json
{
  "chapters": [
    { "id": 1, "title": "Introduction", "start_phrase": "The journey of..." }
  ]
}

```

### `mainTextArray` (Internal State)

```javascript
[
  {
    "id": 1,
    "title": "Chapter Title",
    "main": "The full extracted text body of the chapter...",
    "summary": "The AI generated summary points..."
  }
]

```

## 4. Operational Maintenance

* **Rate Limits:** If using Google AI Studio (Free), do not exceed 15 RPM for Flash models.
* **PDF Parsing:** If `pdf-parse` fails on modern encrypted PDFs in the future, the splitting logic (Phase B) remains valid as long as the input is a UTF-8 string.
* **SSML Compatibility:** The output tags `<voice>`, `<break>`, and `<emphasis>` are W3C standards. If piping to OpenAI TTS, remember that OpenAI uses a simplified subset of SSML; some tags may need to be stripped or converted to plain text with voice-switching logic.
* **Model Strings:** As of 2026, `gemini-2.5-flash` is the primary workhorse. Future versions should prioritize "Context Window" and "Reasoning" capabilities.

## 5. Known Edge Cases & Mitigation

* **TOC Trap:** Handled via the Sequential Pointer.
* **Code Blocks:** Currently summarized as text. Future versions may require a Regex to exclude code from the "Audio Script" to prevent the TTS from reading out loud complex syntax.
* **Missing Chapters:** Handled via `if (startIndex === -1) continue;` to prevent pipeline crashes.

---

**Current Developer:** Sa'ad Idris (Simplysaad)

**Role:** Full-stack System Architect

**Project Goal:** Bridging the gap between static PDF data and mobile-first audio learning.