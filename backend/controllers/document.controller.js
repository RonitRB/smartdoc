const fs = require('fs');
const Document = require('../models/Document.model');
const Chunk = require('../models/Chunk.model');
const { extractTextFromPDF } = require('../services/pdf.service');
const { chunkText } = require('../services/chunk.service');
const { generateResponse } = require('../services/ai.service');
const { buildSummaryPrompt } = require('../utils/prompt.utils');

// @POST /api/documents/upload
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    const document = await Document.create({
      user: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      status: 'processing',
    });

    // Respond immediately, process in background
    res.status(202).json({
      success: true,
      message: 'Document uploaded — processing started',
      document: { id: document._id, originalName: document.originalName, status: document.status },
    });

    setImmediate(() => processDocument(document, req.user._id));
  } catch (error) {
    next(error);
  }
};

const processDocument = async (document, userId) => {
  try {
    console.log(`[SmartDoc] Processing: ${document.originalName} (${document._id})`);

    // 1. Verify file exists
    if (!fs.existsSync(document.filePath)) {
      throw new Error(`File missing at: ${document.filePath}`);
    }

    // 2. Extract text
    const rawText = await extractTextFromPDF(document.filePath);
    if (!rawText || rawText.trim().length < 20) {
      throw new Error('PDF appears to be empty or image-only (no extractable text)');
    }
    console.log(`[SmartDoc] Extracted ${rawText.length} characters`);

    // 3. Chunk
    const chunks = chunkText(rawText);
    if (!chunks.length) throw new Error('Chunking produced no results');
    console.log(`[SmartDoc] ${chunks.length} chunks created`);

    // 4. Save chunks
    await Chunk.deleteMany({ document: document._id }); // clean up any previous attempt
    await Chunk.insertMany(chunks.map(c => ({
      document: document._id,
      user: userId,
      content: c.content,
      chunkIndex: c.chunkIndex,
    })));

    // 5. Generate summary — graceful fallback if AI fails
    let summary = '';
    try {
      summary = await generateResponse(buildSummaryPrompt(rawText));
    } catch (aiErr) {
      console.warn(`[SmartDoc] AI summary failed (non-fatal): ${aiErr.message}`);
      summary = rawText.slice(0, 600).trim() + '...';
    }

    // 6. Mark ready
    await Document.findByIdAndUpdate(document._id, {
      status: 'ready',
      totalChunks: chunks.length,
      summary,
    });

    console.log(`[SmartDoc] ✅ Ready: ${document.originalName} — ${chunks.length} chunks`);
  } catch (err) {
    console.error(`[SmartDoc] ❌ Failed: ${document.originalName} — ${err.message}`);
    await Document.findByIdAndUpdate(document._id, { status: 'failed', summary: err.message });
  }
};

// @GET /api/documents
const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user._id })
      .select('-filePath').sort({ createdAt: -1 });
    res.json({ success: true, documents });
  } catch (error) { next(error); }
};

// @GET /api/documents/:id
const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user._id }).select('-filePath');
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, document });
  } catch (error) { next(error); }
};

// @DELETE /api/documents/:id
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    await Chunk.deleteMany({ document: req.params.id });
    res.json({ success: true, message: 'Document deleted' });
  } catch (error) { next(error); }
};

module.exports = { uploadDocument, getDocuments, getDocument, deleteDocument };
