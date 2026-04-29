const buildQAPrompt = (query, chunks) => {
  const context = chunks
    .map((c, i) => `[Source ${i + 1}]:\n${c.content}`)
    .join('\n\n---\n\n');

  return `You are SmartDoc, an AI assistant that answers questions based strictly on provided document content.

DOCUMENT CONTEXT:
${context}

USER QUESTION: ${query}

INSTRUCTIONS:
- Answer using ONLY the information in the document context above.
- Be clear, concise, and accurate.
- If the answer is not in the context, say: "I couldn't find this in the uploaded document."
- Reference which source(s) you used at the end (e.g. "Based on Source 1 and 2").

ANSWER:`;
};

const buildSummaryPrompt = (text) => {
  const truncated = text.slice(0, 6000);
  return `Summarize the following document clearly and concisely.

Include:
1. What this document is about (1-2 sentences)
2. Key points (3-5 bullet points)  
3. Main conclusions or takeaways

DOCUMENT:
${truncated}

SUMMARY:`;
};

module.exports = { buildQAPrompt, buildSummaryPrompt };
