import { EMBEDDING_DIMENSIONS, EMBEDDINGS_URL, RETRIEVAL } from "./config.js";

let chunksPromise;

export function cosineSimilarity(left, right) {
  if (!left || !right || left.length !== right.length || left.length !== EMBEDDING_DIMENSIONS) return -1;
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] ** 2;
    rightNorm += right[index] ** 2;
  }
  if (!leftNorm || !rightNorm) return -1;
  return dot / Math.sqrt(leftNorm * rightNorm);
}

function keywordBoost(question, chunk) {
  const queryTerms = new Set(question.toLowerCase().match(/[a-z0-9]+/g) || []);
  const keywords = [chunk.title, ...(Array.isArray(chunk.keywords) ? chunk.keywords : [])]
    .join(" ").toLowerCase().match(/[a-z0-9]+/g) || [];
  const matches = keywords.filter((term) => term.length > 2 && queryTerms.has(term));
  return Math.min(matches.length * 0.025, 0.1);
}

export function retrieveChunks(questionVector, question, chunks, options = {}) {
  const { topK, minScore, maxContextChars } = { ...RETRIEVAL, ...options };
  if (!Array.isArray(questionVector) || questionVector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error("Invalid question vector.");
  }
  const ranked = chunks
    .filter((chunk) => Array.isArray(chunk.embedding) && chunk.embedding.length === questionVector.length)
    .map((chunk) => ({ ...chunk, score: cosineSimilarity(questionVector, chunk.embedding) + keywordBoost(question, chunk) }))
    .filter((chunk) => chunk.score >= minScore)
    .sort((a, b) => b.score - a.score);

  const selected = [];
  let contextChars = 0;
  for (const chunk of ranked) {
    if (selected.length >= topK) break;
    if (contextChars + chunk.text.length > maxContextChars) continue;
    selected.push(chunk);
    contextChars += chunk.text.length;
  }
  return selected;
}

export async function loadKnowledgeChunks() {
  if (!chunksPromise) {
    chunksPromise = fetch(EMBEDDINGS_URL)
      .then((response) => {
        if (!response.ok) throw new Error("Portfolio knowledge could not be loaded.");
        return response.json();
      })
      .then((data) => {
        const dimensions = data.dimensions ?? data.embeddingDimensions;
        if (dimensions !== EMBEDDING_DIMENSIONS || !Array.isArray(data.chunks) || !data.chunks.length || data.chunks.some((chunk) =>
          typeof chunk.id !== "string" || typeof chunk.category !== "string" || typeof chunk.title !== "string" ||
          typeof chunk.text !== "string" || !Array.isArray(chunk.embedding) || chunk.embedding.length !== EMBEDDING_DIMENSIONS ||
          chunk.embedding.some((value) => !Number.isFinite(value)))) {
          throw new Error("Portfolio knowledge is incompatible with this chatbot.");
        }
        return data.chunks;
      })
      .catch((error) => { chunksPromise = undefined; throw error; });
  }
  return chunksPromise;
}

const STOP_WORDS = new Set([
  "about", "after", "and", "are", "can", "does", "for", "from", "her",
  "his", "how", "in", "into", "is", "keshvi", "me", "of", "please",
  "tell", "that", "the", "their", "there", "these", "they", "this",
  "those", "to", "what", "when", "where", "which", "who", "with",
  "work", "would", "you",
]);

export function retrieveByKeywords(question, chunks, topK = 3) {
  const terms = new Set(
    (question.toLowerCase().match(/[a-z0-9]+/g) || [])
      .filter((term) => term.length > 2 && !STOP_WORDS.has(term)),
  );
  if (/tech|stack|tool|language|skill/i.test(question)) {
    ["skills", "technology", "technologies", "stack", "language"].forEach((term) => terms.add(term));
  }
  if (/study|degree|college|university|education/i.test(question)) {
    ["education", "degree", "master", "bachelor", "school"].forEach((term) => terms.add(term));
  }

  return chunks
    .map((chunk) => {
      const title = `${chunk.title} ${chunk.category}`.toLowerCase();
      const keywords = (Array.isArray(chunk.keywords) ? chunk.keywords : []).join(" ").toLowerCase();
      const text = chunk.text.toLowerCase();
      const score = [...terms].reduce((total, term) => total +
        (title.includes(term) ? 4 : 0) +
        (keywords.includes(term) ? 3 : 0) +
        (text.includes(term) ? 1 : 0), 0);
      return { ...chunk, score };
    })
    .filter((chunk) => chunk.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, topK);
}