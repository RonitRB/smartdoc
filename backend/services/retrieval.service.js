const Chunk = require('../models/Chunk.model');

const retrieveRelevantChunks = async (documentId, query, topK = 5) => {
  const chunks = await Chunk.find({ document: documentId });
  if (!chunks.length) return [];

  // Stop words to ignore in scoring
  const stopWords = new Set(['the','a','an','is','are','was','were','be','been','being','have',
    'has','had','do','does','did','will','would','could','should','may','might','shall',
    'to','of','in','for','on','with','at','by','from','as','into','through','about']);

  const queryWords = query.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  const scored = chunks.map(chunk => {
    const content = chunk.content.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      const matches = content.match(new RegExp(`\\b${word}\\b`, 'g'));
      if (matches) score += matches.length;
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top K, minimum 3 even if score is 0
  const k = Math.max(Math.min(topK, chunks.length), Math.min(3, chunks.length));
  return scored.slice(0, k).map(s => s.chunk);
};

module.exports = { retrieveRelevantChunks };
