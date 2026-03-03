# AIStock

AIStock is an open-source stock market platform. Track real-time US stock prices, set personalized alerts, and explore detailed company insights.

## Features

- Real-time US stock market data (Finnhub)
- Watchlist management
- Price alerts & email notifications
- TradingView charts & market heatmaps
- AI-powered daily news summaries (Gemini)
- Dark mode UI

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: MongoDB, Better Auth, Inngest
- **Data**: Finnhub API, TradingView widgets
- **AI**: Google Gemini API

## Quick Start

```bash
git clone https://github.com/zhcodingzh/aistock.git
cd aistock
npm install
cp .env.example .env.local
# Fill in environment variables
npm run dev
```

## Docker

```bash
docker compose up -d
```

Required environment variables:
```
MONGODB_URI=mongodb://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_FINNHUB_API_KEY=...
GEMINI_API_KEY=...
NODEMAILER_EMAIL=...
NODEMAILER_PASSWORD=...
```

## License

MIT
