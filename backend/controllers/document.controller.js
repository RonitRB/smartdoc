const Document = require('../models/Document.model');
const Chunk = require('../models/Chunk.model');
const { extractTextFromPDF } = require('../services/pdf.service');
const { chunkText } = require('../services/chunk.service');
const { generateResponse } = require('../services/ai.service');
const { buildSummaryPrompt } = require('../utils/prompt.utils');
const fs = require('fs');

// @POST /api/documents/upload
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    // Save document record
    const document = await Document.create({
      user: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      status: 'processing',
    });

    res.status(202).json({
      success: true,
      message: 'Document uploaded, processing started',
      document: { id: document._id, originalName: document.originalName, status: document.status },
    });

    // Process immediately (synchronous-ish, but after response is sent)
    setImmediate(() => processDocument(document, req.user._id));
  } catch (error) {
    next(error);
  }
};

// Background processing: extract text, chunk, summarize
const processDocument = async (document, userId) => {
  try {
    console.log(`[SmartDoc] Starting processing for ${document._id}`);

    // 1. Check file exists
    if (!fs.existsSync(document.filePath)) {
      throw new Error(`File not found at path: ${document.filePath}`);
    }

    // 2. Extract text
    console.log(`[SmartDoc] Extracting text from ${document.filePath}`);
    const rawText = await extractTextFromPDF(document.filePath);

    if (!rawText || rawText.trim().length < 10) {
      throw new Error('PDF text extraction returned empty content');
    }
    console.log(`[SmartDoc] Extracted ${rawText.length} characters`);

    // 3. Chunk text
    const chunks = chunkText(rawText);
    if (chunks.length === 0) {
      throw new Error('No chunks generated from text');
    }
    console.log(`[SmartDoc] Generated ${chunks.length} chunks`);

    // 4. Save chunks to DB
    const chunkDocs = chunks.map(c => ({
      document: document._id,
      user: userId,
      content: c.content,
      chunkIndex: c.chunkIndex,
    }));
    await Chunk.insertMany(chunkDocs);
    console.log(`[SmartDoc] Saved ${chunks.length} chunks to DB`);

    // 5. Generate summary (with fallback if AI fails)
    let summary = '';
    try {
      const summaryPrompt = buildSummaryPrompt(rawText);
      summary = await generateResponse(summaryPrompt);
      console.log(`[SmartDoc] Summary generated successfully`);
    } catch (aiError) {
      console.error(`[SmartDoc] AI summary failed (non-fatal):`, aiError.message);
      // Use first 500 chars as fallback summary so document still works
      summary = `Document processed successfully. ${rawText.slice(0, 500)}...`;
    }

    // 6. Update document status to ready
    await Document.findByIdAndUpdate(document._id, {
      status: 'ready',
      totalChunks: chunks.length,
      summary,
    });

    console.log(`[SmartDoc] Document ${document._id} ready — ${chunks.length} chunks`);
  } catch (error) {
    console.error(`[SmartDoc] Processing failed for ${document._id}:`, error.message);
    await Document.findByIdAndUpdate(document._id, {
      status: 'failed',
      summary: `Processing failed: ${error.message}`,
    });
  }
};

// @GET /api/documents
const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user._id })
      .select('-filePath')
      .sort({ createdAt: -1 });
    res.json({ success: true, documents });
  } catch (error) {
    next(error);
  }
};

// @GET /api/documents/:id
const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user._id }).select('-filePath');
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, document });
  } catch (error) {
    next(error);
  }
};

// @DELETE /api/documents/:id
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    await Chunk.deleteMany({ document: req.params.id });
    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadDocument, getDocuments, getDocument, deleteDocument };
