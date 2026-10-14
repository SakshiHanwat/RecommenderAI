# AI Product Recommender

React (Vite) frontend + Vercel serverless function calling OpenAI.

## Run locally
```bash
npm install
npm i -g vercel
cp .env.example .env      # put your OPENAI_API_KEY inside
vercel dev                # serves frontend + /api together
```

## Deploy
1. Push this folder to GitHub.
2. Import the repo on vercel.com (Framework: Vite).
3. Settings > Environment Variables > add `OPENAI_API_KEY`.
4. Deploy, then share the link.

## How it works
1. User types preferences.
2. Frontend POSTs `{ query, products }` to `/api/recommend`.
3. The function asks GPT to return matching product IDs as JSON.
4. IDs are validated server-side, then the frontend filters the list.
