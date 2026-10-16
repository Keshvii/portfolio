import { buildPromptMessages } from "../src/rag/prompt.js";

const MODEL = "cohere/north-mini-code:free";
const DEFAULT_ORIGINS = ["https://keshvii.github.io"];

function allowedOrigins() {
  const configured = (process.env.CHAT_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_ORIGINS, ...configured]);
}

function cleanPayload(body) {
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question || question.length > 1000) return null;
  if (!Array.isArray(body?.context) || body.context.length > 8) return null;
  if (!Array.isArray(body?.history) || body.history.length > 6) return null;

  const context = body.context.map((chunk) => ({
    id: String(chunk?.id || "").slice(0, 100),
    category: String(chunk?.category || "").slice(0, 100),
    title: String(chunk?.title || "").slice(0, 200),
    text: String(chunk?.text || "").slice(0, 5000),
  }));
  const history = body.history
    .filter((item) => item?.role === "user" || item?.role === "assistant")
    .map(({ role, text }) => ({ role, text: String(text || "").slice(0, 1000) }));
  return { question, context, history };
}

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  const origins = allowedOrigins();
  if (origins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  if (!origins.has(origin)) return res.status(403).json({ error: "Origin not allowed." });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "The assistant is not configured." });

  const payload = cleanPayload(req.body);
  if (!payload) return res.status(400).json({ error: "Invalid chat request." });

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": origin,
        "X-Title": "Keshvi Portfolio Assistant",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: buildPromptMessages(payload),
        max_tokens: 320,
        temperature: 0.35,
      }),
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const status = upstream.status === 429 || upstream.status === 402 ? upstream.status : 502;
      return res.status(status).json({ error: "Keshvi’s assistant is temporarily unavailable." });
    }
    const answer = data.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return res.status(502).json({ error: "The assistant returned an empty answer." });
    }
    return res.status(200).json({ answer: answer.trim() });
  } catch {
    return res.status(502).json({ error: "Keshvi’s assistant is temporarily unavailable." });
  }
}