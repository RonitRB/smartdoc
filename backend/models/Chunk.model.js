const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  chunkIndex: { type: Number, required: true },
  pageNumber: { type: Number, default: null },
}, { timestamps: true });

// Index for fast retrieval by document
chunkSchema.index({ document: 1, chunkIndex: 1 });

module.exports = mongoose.model('Chunk', chunkSchema);
