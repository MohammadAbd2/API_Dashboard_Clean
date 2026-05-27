# Product Dashboard

A small product catalog dashboard. FastAPI backend, vanilla JS frontend, SQLite database.

## Prerequisites

- Python 3.11+
- `sqlite3` CLI (preinstalled on macOS and most Linux distros)
- A modern browser

## Setup

### 1. Database

```bash
mkdir -p data
sqlite3 data/products.db < sql/setup.sql
sqlite3 data/products.db < sql/seed.sql
```

### 2. Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

The API runs on `http://localhost:8000`. OpenAPI docs at `http://localhost:8000/docs`.

### 3. Frontend

In a separate terminal, from the project root:

```bash
cd frontend
python -m http.server 8800
```

Open `http://localhost:8800` in your browser.

## Configuration

Config lives in `.env`:

- `DB_PATH`
- `API_PORT`
- `FRONTEND_ORIGIN`

## Project layout

```
sql/         schema + seed data
backend/     FastAPI app
  routes/    products, categories, reviews
frontend/    static HTML/JS/CSS
data/        SQLite database file (gitignored)
```
