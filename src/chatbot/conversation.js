import { CHAT_HISTORY_LIMIT } from "./config.js";

const FOLLOW_UP_REFERENCE = /\b(it|its|they|them|their|this|that|these|those|there|one|ones)\b/i;

export function resolveRetrievalQuery(question, history = []) {
  if (!FOLLOW_UP_REFERENCE.test(question)) return question;
  const previousUserMessage = [...history].reverse().find((message) => message.role === "user");
  return previousUserMessage ? `${previousUserMessage.text}\n${question}` : question;
}

export function trimConversation(history = []) {
  return history
    .filter((message) => (message.role === "user" || message.role === "assistant") && typeof message.text === "string")
    .slice(-CHAT_HISTORY_LIMIT);
}
