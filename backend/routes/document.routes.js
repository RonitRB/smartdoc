const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, getDocument, deleteDocument } = require('../controllers/document.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect); // all document routes require auth

router.post('/upload', upload.single('pdf'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
