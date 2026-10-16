# Keshvi Portfolio

A responsive React + Vite portfolio with a retrieval-based AI assistant.

## Run locally

```sh
npm install
npm run dev
```

## Deploy the portfolio

The static site is configured for GitHub Pages at `https://keshvii.github.io/portfolio/`:

```sh
npm run deploy
```

The deploy script builds the site and clears the `gh-pages` temporary cache before publishing, which avoids a stale local branch collision.

## Configure the assistant securely

The OpenRouter API key must stay on a server. Never put it in frontend code, a `VITE_` variable, or a committed `.env` file. Vite embeds `VITE_` values into the public JavaScript bundle.

`api/chat.js` is a serverless API function intended for a Node serverless host such as Vercel. Deploy that function and set `OPENROUTER_API_KEY` as a server-side secret in the host's project settings. The function permits the GitHub Pages origin by default; use `CHAT_ALLOWED_ORIGINS` for additional trusted origins.

Set the public (non-secret) `VITE_CHAT_API_URL` build variable to the deployed function URL, for example `https://your-api-host.example/api/chat`, then run `npm run deploy` again. The assistant remains unavailable on GitHub Pages until this API endpoint is deployed and configured.

The assistant uses `cohere/north-mini-code:free` through OpenRouter and the vectors in `public/portfolio-embeddings.json`. It embeds each question with the compatible MiniLM model in the browser, retrieves relevant portfolio chunks, and sends those chunks plus a short chat history to the API. Retrieved text is treated as reference data, not instructions.

If OpenRouter reports a usage limit, the assistant replies “Ugh, I'm done for today.” and provides a direct email link to Keshvi at `keshvi030802@gmail.com`.

## Build

```sh
npm run build
```

Update portfolio content in `src/data/portfolio.json` and the embedding index in `public/portfolio-embeddings.json` together. Replace `public/Keshvi.pdf` to update the résumé download and `public/keshvi-profile.png` to change the profile photo.