import { embedQuestion } from "./embedder.js";
import { loadKnowledgeChunks, retrieveByKeywords, retrieveChunks } from "./retrieval.js";

const DAILY_LIMIT_MESSAGE = "Ugh, I'm done for today.";

async function prepareChatRequest(question, history = []) {
  const [questionVector, chunks] = await Promise.all([
    embedQuestion(question),
    loadKnowledgeChunks(),
  ]);
  const context = retrieveChunks(questionVector, question, chunks);
  return {
    question,
    context: context.map(({ id, category, title, text }) => ({ id, category, title, text })),
    history: history.slice(-6).map(({ role, text }) => ({ role, text })),
  };
}

function answerFromPortfolio(context) {
  if (!context.length) {
    return "I couldn’t find a matching detail in Keshvi’s portfolio. Try asking about her skills, education, or a project.";
  }
  return `Here’s what I found in Keshvi’s portfolio:\n\n${context
    .slice(0, 3)
    .map(({ title, text }) => `${title}: ${text.slice(0, 900)}`)
    .join("\n\n")}`;
}

export async function askPortfolioAssistant(question, history = [], { signal } = {}) {
  const endpoint = import.meta.env.VITE_CHAT_API_URL;
  if (!endpoint) {
    const chunks = await loadKnowledgeChunks();
    return answerFromPortfolio(retrieveByKeywords(question, chunks));
  }

  const payload = await prepareChatRequest(question, history);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const providerMessage = data.error || "Keshvi’s assistant is unavailable right now.";
    const isDailyLimit = response.status === 429 || response.status === 402;
    const error = new Error(isDailyLimit ? DAILY_LIMIT_MESSAGE : String(providerMessage));
    error.code = isDailyLimit ? "daily_limit" : undefined;
    error.retryable = response.status === 429 || response.status >= 500;
    throw error;
  }

  const answer = data.answer;
  if (typeof answer !== "string" || !answer.trim()) {
    throw new Error("The assistant returned an empty answer. Please try again.");
  }
  return answer.trim();
}