/**
 * Split text into semantic chunks for RAG retrieval
 * Strategy: paragraph-aware chunking with overlap
 */

const CHUNK_SIZE = 800;       // characters per chunk
const CHUNK_OVERLAP = 100;    // overlap between chunks for context continuity

/**
 * Split text into overlapping chunks
 * @param {string} text - Full extracted text
 * @returns {Array<{content: string, chunkIndex: number}>}
 */
const chunkText = (text) => {
  // Clean up excessive whitespace
  const cleaned = text.replace(/\s+/g, ' ').trim();

  // Split into paragraphs first for semantic coherence
  const paragraphs = cleaned.split(/\n{2,}/).filter(p => p.trim().length > 50);

  const chunks = [];
  let currentChunk = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    if ((currentChunk + ' ' + paragraph).length <= CHUNK_SIZE) {
      currentChunk += (currentChunk ? ' ' : '') + paragraph;
    } else {
      if (currentChunk) {
        chunks.push({ content: currentChunk.trim(), chunkIndex });
        chunkIndex++;
        // Keep overlap from the end of the previous chunk
        currentChunk = currentChunk.slice(-CHUNK_OVERLAP) + ' ' + paragraph;
      } else {
        // Paragraph itself is too large — split by sentences
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        for (const sentence of sentences) {
          if ((currentChunk + ' ' + sentence).length <= CHUNK_SIZE) {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
          } else {
            if (currentChunk) {
              chunks.push({ content: currentChunk.trim(), chunkIndex });
              chunkIndex++;
              currentChunk = sentence;
            } else {
              chunks.push({ content: sentence.trim(), chunkIndex });
              chunkIndex++;
            }
          }
        }
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push({ content: currentChunk.trim(), chunkIndex });
  }

  return chunks;
};

module.exports = { chunkText };
