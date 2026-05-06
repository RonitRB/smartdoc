const Document = require('../models/Document.model');
const Chunk = require('../models/Chunk.model');
const { generateResponse } = require('../services/ai.service');
const { buildContentPrompt } = require('../utils/prompt.utils');

const VALID_TYPES = ['blog', 'social', 'email', 'bullets', 'quiz', 'keywords', 'translate'];

// @POST /api/generate/:documentId
const generateContent = async (req, res, next) => {
  try {
    const { type, language = 'English' } = req.body;
    const { documentId } = req.params;

    if (!type || !VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`
      });
    }

    const document = await Document.findOne({ _id: documentId, user: req.user._id });
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    if (document.status !== 'ready') {
      return res.status(400).json({ success: false, message: 'Document is still processing' });
    }

    // Get all chunks and combine text
    const chunks = await Chunk.find({ document: documentId }).sort({ chunkIndex: 1 });
    if (!chunks.length) {
      return res.status(400).json({ success: false, message: 'No content found in document' });
    }

    const fullText = chunks.map(c => c.content).join('\n\n');
    const prompt = buildContentPrompt(type, fullText, language);
    const content = await generateResponse(prompt);

    res.json({
      success: true,
      type,
      language,
      content,
      documentName: document.originalName,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateContent };
