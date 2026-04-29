const multer = require('multer');
const path = require('path');
const fs = require('fs');

// /tmp is the only writable directory on Render free tier
const uploadDir = '/tmp/smartdoc-uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

console.log(`[SmartDoc] Upload directory: ${uploadDir}`);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') return cb(null, true);
  cb(new Error('Only PDF files are allowed'), false);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
