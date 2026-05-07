# SmartDoc - AI Content Generator Website

> SuprMentr Bootcamp & Internship Program 2026 | Project #73
> **Team:** 
> - **Ronit Bongale:** Team Lead & AI Architect (Full-Stack Backend)
> - **Sachin Kumar:** Backend Developer (Systems & Database)
> - **Subhash MP:** Frontend & UX Specialist (Interactive UI & Analytics)

A full-stack MERN application that lets users upload PDF documents and interact with them using AI-powered Q&A and summarization (RAG architecture).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| AI | Groq AI (Llama 3.3) |
| File Handling | Multer, pdf-parse |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGO_URI and GROQ_API_KEY in .env
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/documents/upload | Upload PDF |
| GET | /api/documents | List documents |
| GET | /api/documents/:id | Get document |
| DELETE | /api/documents/:id | Delete document |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat/:documentId | Ask a question |
| GET | /api/chat/:documentId/history | Get chat history |
| DELETE | /api/chat/:documentId/history | Clear history |

---

## Project Structure

```
smartdoc/
├── backend/
│   ├── server.js
│   ├── config/         # DB connection
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── controllers/    # Business logic
│   ├── services/       # PDF, AI, RAG
│   ├── middleware/     # Auth, upload, error
│   └── utils/          # Prompt builder, token
└── frontend/
    └── src/
        ├── pages/      # Login, Register, Dashboard, Chat
        ├── components/ # PDFUploader, MessageBubble, etc.
        ├── context/    # AuthContext
        └── services/   # API calls
```
