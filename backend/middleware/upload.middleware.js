const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Render free tier only allows writes to /tmp
// Use /tmp in production, ./uploads in development
const uploadDir = process.env.NODE_ENV === 'production'
  ? '/tmp/smartdoc-uploads'
  : (process.env.UPLOAD_PATH || './uploads');

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
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

module.exports = upload;
