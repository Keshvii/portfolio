import { EMBEDDING_DIMENSIONS, KNOWLEDGE_URL } from "./config.js";

const STORED_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
let knowledgePromise;

function validateKnowledge(data) {
  if (data?.model !== STORED_MODEL) throw new Error(`Expected knowledge embeddings from ${STORED_MODEL}.`);
  if (data.dimensions !== EMBEDDING_DIMENSIONS || data.normalized !== true || !Array.isArray(data.chunks) || !data.chunks.length) {
    throw new Error("The portfolio knowledge file has incompatible embedding metadata.");
  }

  const ids = new Set();
  for (const chunk of data.chunks) {
    if (!chunk || typeof chunk.id !== "string" || !chunk.id.trim() || ids.has(chunk.id)) {
      throw new Error("The portfolio knowledge file contains a missing or duplicate chunk ID.");
    }
    ids.add(chunk.id);
    if (typeof chunk.category !== "string" || typeof chunk.title !== "string" || typeof chunk.text !== "string" || !chunk.text.trim()) {
      throw new Error(`Knowledge chunk “${chunk.id}” is missing factual text or labels.`);
    }
    if (!Array.isArray(chunk.embedding) || chunk.embedding.length !== EMBEDDING_DIMENSIONS || chunk.embedding.some((value) => !Number.isFinite(value))) {
      throw new Error(`Knowledge chunk “${chunk.id}” has an invalid embedding.`);
    }
    const magnitude = Math.sqrt(chunk.embedding.reduce((sum, value) => sum + value * value, 0));
    if (!Number.isFinite(magnitude) || magnitude === 0 || Math.abs(magnitude - 1) > 0.02) {
      throw new Error(`Knowledge chunk “${chunk.id}” is not normalized.`);
    }
  }
  return data.chunks;
}

export function loadKnowledge() {
  if (!knowledgePromise) {
    knowledgePromise = fetch(KNOWLEDGE_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load portfolio knowledge (HTTP ${response.status}).`);
        return response.json();
      })
      .then(validateKnowledge)
      .catch((error) => {
        knowledgePromise = undefined;
        throw error;
      });
  }
  return knowledgePromise;
}
