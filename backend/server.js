const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/error.middleware');

dotenv.config();
connectDB();

const app = express();

// CORS — allow Vercel frontend and local dev
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.endsWith('.vercel.app') || origin === process.env.CLIENT_URL ||
        origin === 'http://localhost:5173' || origin === 'http://localhost:3000') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    if (req.path.startsWith('/api/') && req.path !== '/api/health') {
      console.log(`[${req.method}] ${req.path} — ${res.statusCode} (${ms}ms)`);
    }
  });
  next();
});

// Routes
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/documents', require('./routes/document.routes'));
app.use('/api/chat',      require('./routes/chat.routes'));
app.use('/api/generate',  require('./routes/generate.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'SmartDoc API is running',
    timestamp: new Date(),
    version: '3.0',
    features: ['RAG Chat', 'Content Generation', 'TF-IDF Retrieval', 'Multi-Language'],
  });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`\n🚀 SmartDoc v3 server running on port ${PORT}\n`));
