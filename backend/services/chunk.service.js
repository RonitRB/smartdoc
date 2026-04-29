const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

const chunkText = (text) => {
  // Normalize whitespace
  const cleaned = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
  
  // Split by double newlines (paragraphs) or single newlines
  const paragraphs = cleaned.split(/\n{2,}/).map(p => p.trim()).filter(p => p.length > 30);

  if (!paragraphs.length) {
    // Fallback: split raw text by size
    const chunks = [];
    for (let i = 0; i < cleaned.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
      const content = cleaned.slice(i, i + CHUNK_SIZE).trim();
      if (content) chunks.push({ content, chunkIndex: chunks.length });
    }
    return chunks;
  }

  const chunks = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + '\n' + para).length <= CHUNK_SIZE) {
      current = current ? current + '\n' + para : para;
    } else {
      if (current) {
        chunks.push({ content: current.trim(), chunkIndex: chunks.length });
        // Overlap: carry last part of previous chunk
        current = current.slice(-CHUNK_OVERLAP) + '\n' + para;
      } else {
        // Single paragraph larger than chunk size — split by sentences
        const sentences = para.match(/[^.!?]+[.!?]+[\s]*/g) || [para];
        for (const s of sentences) {
          if ((current + s).length <= CHUNK_SIZE) {
            current += s;
          } else {
            if (current.trim()) chunks.push({ content: current.trim(), chunkIndex: chunks.length });
            current = s;
          }
        }
      }
    }
  }

  if (current.trim()) chunks.push({ content: current.trim(), chunkIndex: chunks.length });

  return chunks;
};

module.exports = { chunkText };
