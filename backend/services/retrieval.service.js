const Chunk = require('../models/Chunk.model');

/**
 * Simple keyword-based retrieval (no vector DB needed)
 * Scores chunks by how many query words they contain
 * Upgrade path: replace with vector embeddings later
 *
 * @param {string} documentId
 * @param {string} query
 * @param {number} topK - number of chunks to return
 * @returns {Promise<Array>}
 */
const retrieveRelevantChunks = async (documentId, query, topK = 5) => {
  const chunks = await Chunk.find({ document: documentId });

  const queryWords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3); // ignore short stop words

  const scored = chunks.map((chunk) => {
    const content = chunk.content.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      const count = (content.match(new RegExp(word, 'g')) || []).length;
      score += count;
    }
    return { chunk, score };
  });

  // Sort by relevance score descending
  scored.sort((a, b) => b.score - a.score);

  // Return top K chunks (at least 1 even if score is 0)
  return scored.slice(0, topK).map(s => s.chunk);
};

module.exports = { retrieveRelevantChunks };
