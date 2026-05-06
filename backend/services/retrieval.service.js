const Chunk = require('../models/Chunk.model');

/**
 * TF-IDF-inspired retrieval with term frequency normalization.
 * Much more accurate than naive word counting.
 */
const retrieveRelevantChunks = async (documentId, query, topK = 5) => {
  const chunks = await Chunk.find({ document: documentId });
  if (!chunks.length) return [];

  const totalDocs = chunks.length;

  // Stop words to ignore in scoring
  const stopWords = new Set(['the','a','an','is','are','was','were','be','been','being','have',
    'has','had','do','does','did','will','would','could','should','may','might','shall',
    'to','of','in','for','on','with','at','by','from','as','into','through','about',
    'this','that','these','those','it','its','i','we','you','they','he','she','and',
    'or','but','not','no','so','if','then','than','when','what','which','how','who',
    'where','there','here','all','each','every','both','few','more','most','other',
    'some','such','can','will','just','also','very','much','many','any','only']);

  // Extract and normalize query terms
  const queryWords = query.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  if (!queryWords.length) {
    // If all words are stop words, return first few chunks
    return chunks.slice(0, Math.min(topK, chunks.length));
  }

  // Calculate document frequency (DF) for each query term
  const df = {};
  for (const word of queryWords) {
    df[word] = 0;
    for (const chunk of chunks) {
      if (chunk.content.toLowerCase().includes(word)) {
        df[word]++;
      }
    }
  }

  // Score each chunk using TF-IDF
  const scored = chunks.map(chunk => {
    const content = chunk.content.toLowerCase();
    const words = content.split(/\s+/);
    const totalWords = words.length || 1;
    let score = 0;

    for (const word of queryWords) {
      // Term Frequency (TF) — normalized by chunk length
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
      const matches = content.match(regex);
      const tf = matches ? matches.length / totalWords : 0;

      // Inverse Document Frequency (IDF)
      const idf = df[word] > 0 ? Math.log(totalDocs / df[word]) + 1 : 0;

      score += tf * idf;

      // Bonus for exact phrase match
      if (content.includes(word)) score += 0.1;
    }

    // Bonus for matching multiple query terms
    const matchedTerms = queryWords.filter(w => content.includes(w)).length;
    if (matchedTerms > 1) score *= (1 + matchedTerms * 0.15);

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top K, minimum 3 even if score is 0
  const k = Math.max(Math.min(topK, chunks.length), Math.min(3, chunks.length));
  return scored.slice(0, k).map(s => s.chunk);
};

module.exports = { retrieveRelevantChunks };
