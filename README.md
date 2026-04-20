# AI Career Copilot

AI Career Copilot is a full-stack web application that analyzes a user's resume or skill profile and turns it into a practical career roadmap.

## Features

- Resume analyzer for pasted text or uploaded PDF/TXT resumes
- Skill gap analysis against a target role
- AI-generated real-world project recommendations
- Mock interview question generation and answer evaluation
- Progress dashboard for completed skills and projects
- MongoDB persistence with automatic in-memory fallback
- OpenAI or OpenAI-compatible LLAMA API integration

## Project Structure

`backend/`
- Express + TypeScript REST API
- Career profile persistence with Mongoose
- AI orchestration and fallback recommendation engine

`frontend/`
- Next.js dashboard UI
- Responsive sections for resume upload, analysis, projects, interview, and progress
- Connected to backend REST APIs via Axios, with local Next.js API routes for single-deployment hosting

## Run Locally

### Backend

1. Copy `backend/.env.example` to `backend/.env`
2. Set `OPENAI_API_KEY` or `LLAMA_API_*` if you want live AI responses
3. Optionally set `MONGODB_URI` for persistent storage
4. Start the API:

```bash
cd backend
npm run dev
```

### Frontend

1. Create `frontend/.env.local` if needed:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
```

2. If you deploy only the `frontend` app to Vercel, set `OPENAI_API_KEY` or `GEMINI_API_KEY` in the frontend project environment variables. Otherwise the app will fall back to rules-based analysis.

3. Start the frontend:

```bash
cd frontend
npm run dev
```

## API Overview

- `POST /api/career/profiles/analyze`
- `GET /api/career/profiles/:id`
- `POST /api/career/profiles/:id/projects`
- `POST /api/career/profiles/:id/interview/questions`
- `POST /api/career/profiles/:id/interview/evaluate`
- `PATCH /api/career/profiles/:id/progress`
- `GET /api/health`
