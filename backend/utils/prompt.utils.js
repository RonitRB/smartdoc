/**
 * Build the RAG prompt for the LLM
 * Injects retrieved context chunks + user query
 */

const buildQAPrompt = (query, chunks) => {
  const context = chunks
    .map((chunk, i) => `[Chunk ${i + 1}]:\n${chunk.content}`)
    .join('\n\n');

  return `You are SmartDoc, an AI assistant that answers questions strictly based on the provided document context.

CONTEXT FROM DOCUMENT:
${context}

USER QUESTION:
${query}

INSTRUCTIONS:
- Answer ONLY using information from the context above.
- If the answer is not in the context, say: "I couldn't find this information in the uploaded document."
- Be concise and accurate.
- At the end of your answer, mention which chunk(s) you used (e.g. "Source: Chunk 1, Chunk 3").

ANSWER:`;
};

const buildSummaryPrompt = (text) => {
  const truncated = text.slice(0, 8000); // limit input size
  return `You are SmartDoc, an AI document summarizer.

Summarize the following document content clearly and concisely. Include:
1. Main topic or purpose
2. Key points (3-5 bullet points)
3. Important conclusions or findings

DOCUMENT CONTENT:
${truncated}

SUMMARY:`;
};

module.exports = { buildQAPrompt, buildSummaryPrompt };
