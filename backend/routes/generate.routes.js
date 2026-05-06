const express = require('express');
const router = express.Router();
const { generateContent } = require('../controllers/generate.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/:documentId', generateContent);

module.exports = router;
