# Security Tools (Refactored)

**Modern scalable version** — React (TypeScript) + shadcn/ui frontend + Python FastAPI backend.

## Why this structure?

- One file HTML + big script = unmaintainable.
- Moved to proper separated frontend/backend.
- React for nice, component-based, scalable UI (full page editor, proper forms).
- FastAPI backend (more reliable WebSockets than old SocketIO on Windows).
- Core tester logic stays in Python (powerful for concurrent requests).

## Running

### 1. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (React + shadcn/ui)
```bash
cd frontend
npm install

# Initialize shadcn (first time only)
npx shadcn@latest init

# Add components as needed
npx shadcn@latest add button card input table textarea

npm run dev
```

Open http://localhost:5173

## UI Stack
- React + TypeScript + Vite
- shadcn/ui (Tailwind based, copy-paste components)
- Full page editor instead of modals
- Clean component structure for scalability

## Features
- Fully dynamic endpoints per project
- Authorization header is dynamic (Bearer or custom per endpoint)
- Random values: `{{random_string}}`, `{{random_number}}`, `{{random_phone}}`
- Extractors for refreshing tokens from responses

## Features carried over (improved):
- Fully dynamic endpoints
- Variables + {{random_string}}, {{random_number}}, {{random_phone}} etc.
- Per-endpoint Authorization (Bearer / Cookie / custom) — now properly dynamic
- Extractors for fresh tokens
- Live stats + logs

This is now much easier to extend (add history, multiple configs, auth, etc.).
