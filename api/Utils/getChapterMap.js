import { GoogleGenAI } from "@google/genai";
import { callGemini } from "./callGemini.js";

const { GEMINI_API_KEY } = process.env;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
let chapterMap = {
  bookTitle: 'Programming Collective Intelligence',
  chapters: [
    {
      id: 1,
      title: 'Introduction to Collective Intelligence',
      start_phrase: 'The increasing number of people contributing to the Internet, either deliberately or incidentally, has created a huge set of data that gives us millions of potential insights into'
    },
    {
      id: 2,
      title: 'Making Recommendations',
      start_phrase: 'Introduces thecollaborative filteringtechniques used by many online retailers to recommend products or media. The chapter includes a section on recommending links to'
    },
    {
      id: 3,
      title: 'Discovering Groups',
      start_phrase: 'Builds on some of the ideas in Chapter 2 and introduces two different methods ofclustering, which automatically detect groups of similar items in a large dataset. This chapter'
    },
    {
      id: 4,
      title: 'Searching and Ranking',
      start_phrase: 'Describes the various parts of a search engine including the crawler, indexer, and query engine. It covers thePageRankalgorithm for scoring pages based on inbound links and shows'
    },
    {
      id: 5,
      title: 'Optimization',
      start_phrase: 'Introduces algorithms foroptimization, which are designed to search millions of possible solutions to a problem and choose the best one. The wide variety of uses for these algorithms'
    },
    {
      id: 6,
      title: 'Document Filtering',
      start_phrase: 'Filtering Spam Documents and Words Training the Classifier Calculating Probabilities A Naïve Classifier The Fisher Method Persisting the Trained Classifiers Filtering Blog'
    },
    {
      id: 7,
      title: 'Modeling with Decision Trees',
      start_phrase: 'Predicting Signups Introducing Decision Trees Training the Tree Choosing the Best Split Recursive Tree Building Displaying the Tree Classifying New Observations Pruning the'
    },
    {
      id: 8,
      title: 'Building Price Models',
      start_phrase: 'Building a Sample Dataset k-Nearest Neighbors Weighted Neighbors Cross-Validation Heterogeneous Variables Optimizing the Scale Uneven Distributions Using Real Data—the eBay'
    },
    {
      id: 9,
      title: 'Advanced Classification: Kernel Methods and SVMs',
      start_phrase: 'Matchmaker Dataset Difficulties with the Data Basic Linear Classification Categorical Features Scaling the Data Understanding Kernel Methods Support-Vector Machines Using LIBSVM'
    },
    {
      id: 10,
      title: 'Finding Independent Features',
      start_phrase: 'A Corpus of News Previous Approaches Non-Negative Matrix Factorization Displaying the Results Using Stock Market Data Exercises'
    },
    {
      id: 11,
      title: 'Evolving Intelligence',
      start_phrase: 'What Is Genetic Programming? Programs As Trees Creating the Initial Population Testing a Solution Mutating Programs Crossover Building the Environment A Simple Game Further'
    },
    {
      id: 12,
      title: 'Algorithm Summary',
      start_phrase: 'Bayesian Classifier Decision Tree Classifier Neural Networks Support-Vector Machines k-Nearest Neighbors Clustering Multidimensional Scaling Non-Negative Matrix Factorization Optimization'
    }
  ]
}


export async function getChapterMap(pdfText = "text not provided") {
  const sampleText = pdfText?.substring(0, 20000);

  try {
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

    chapterMap = await callGemini({ prompt, returnType: "json" })
    return chapterMap
  } catch (error) {
    console.error(error)
    throw error
  }

}