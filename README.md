# SigInt

**Semiconductor Signal Intelligence Platform**

A zero-cost, fully automated research platform that monitors public sources, extracts market-relevant signals, and helps you make informed investment decisions.

## Architecture (Zero-Cost Serverless)

| Layer | Technology | Cost |
|---|---|---|
| Frontend | Next.js on Vercel | Free |
| API | FastAPI (Vercel serverless or local) | Free |
| Database | Supabase (PostgreSQL) | Free |
| Background Jobs | GitHub Actions cron | Free |
| Market Data | yfinance | Free |

## Project Structure

```
aant/
├── apps/
│   ├── api/          # FastAPI backend
│   └── web/          # Next.js frontend
├── infra/            # Docker Compose (local dev)
└── .github/
    └── workflows/    # Scheduled GitHub Actions jobs
```

## Getting Started

### 1. Set up the database
- Create a free [Supabase](https://supabase.com) project
- Copy the connection string

### 2. Configure environment variables
```bash
cd apps/api
cp .env.example .env
# Fill in DATABASE_URL with your Supabase connection string
```

### 3. Run the API locally
```bash
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload
```
Open [http://localhost:8000/docs](http://localhost:8000/docs) to see the API.

### 4. Run the frontend locally
```bash
cd apps/web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy
- Push to GitHub
- Connect `apps/web` to Vercel
- Add `DATABASE_URL` to GitHub Secrets for the Actions cron jobs
