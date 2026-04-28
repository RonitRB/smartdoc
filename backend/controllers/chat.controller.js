const Chat = require('../models/Chat.model');
const Document = require('../models/Document.model');
const { retrieveRelevantChunks } = require('../services/retrieval.service');
const { generateResponse } = require('../services/ai.service');
const { buildQAPrompt } = require('../utils/prompt.utils');

// @POST /api/chat/:documentId
const askQuestion = async (req, res, next) => {
  try {
    const { question } = req.body;
    const { documentId } = req.params;

    if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

    // Verify document exists and belongs to user
    const document = await Document.findOne({ _id: documentId, user: req.user._id });
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    if (document.status !== 'ready') {
      return res.status(400).json({ success: false, message: 'Document is still being processed' });
    }

    // 1. Retrieve relevant chunks (RAG)
    const relevantChunks = await retrieveRelevantChunks(documentId, question, 5);

    // 2. Build prompt + generate answer
    const prompt = buildQAPrompt(question, relevantChunks);
    const answer = await generateResponse(prompt);

    // 3. Build citations from chunks used
    const citations = relevantChunks.map(c => ({
      chunkIndex: c.chunkIndex,
      excerpt: c.content.slice(0, 150) + '...',
    }));

    // 4. Save to chat history
    let chat = await Chat.findOne({ user: req.user._id, document: documentId });
    if (!chat) {
      chat = await Chat.create({ user: req.user._id, document: documentId, messages: [] });
    }

    chat.messages.push({ role: 'user', content: question });
    chat.messages.push({ role: 'assistant', content: answer, citations });
    await chat.save();

    res.json({
      success: true,
      answer,
      citations,
      chatId: chat._id,
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/chat/:documentId/history
const getChatHistory = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ user: req.user._id, document: req.params.documentId });
    res.json({ success: true, messages: chat ? chat.messages : [] });
  } catch (error) {
    next(error);
  }
};

// @DELETE /api/chat/:documentId/history
const clearChatHistory = async (req, res, next) => {
  try {
    await Chat.findOneAndDelete({ user: req.user._id, document: req.params.documentId });
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = { askQuestion, getChatHistory, clearChatHistory };
