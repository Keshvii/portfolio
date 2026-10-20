import { embedQuery } from "./embedding.js";
import { loadKnowledge } from "./knowledge.js";
import { resolveRetrievalQuery, trimConversation } from "./conversation.js";
import { retrieveChunks } from "./retrieval.js";
import { buildPromptMessages } from "./prompt.js";
import { generateChatResponse } from "./worker.js";

export async function sendChatMessage(question, history = [], { signal, onModelLoading } = {}) {
  const recentHistory = trimConversation(history);
  const resolvedQuery = resolveRetrievalQuery(question, recentHistory);
  const [knowledge, queryVector] = await Promise.all([
    loadKnowledge(),
    embedQuery(resolvedQuery, onModelLoading),
  ]);
  const context = retrieveChunks(queryVector, knowledge);

  if (import.meta.env.DEV && import.meta.env.VITE_CHATBOT_DEBUG === "true") {
    console.debug("Chat retrieval", context.map(({ id, score }) => ({ id, score })));
  }

  const messages = buildPromptMessages({
    question,
    resolvedQuery,
    history: recentHistory.map(({ role, text }) => ({ role, content: text })),
    context,
  });
  return generateChatResponse(messages, { signal });
}
