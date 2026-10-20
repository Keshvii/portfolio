import { EMBEDDING_DIMENSIONS, RETRIEVAL_CONFIG } from "./config.js";
import { cosineSimilarity } from "./similarity.js";

export function retrieveChunks(queryVector, chunks, config = RETRIEVAL_CONFIG) {
  if (!Array.isArray(queryVector) || queryVector.length !== EMBEDDING_DIMENSIONS || queryVector.some((value) => !Number.isFinite(value))) {
    throw new Error("The query embedding has an invalid dimension or value.");
  }

  const candidates = chunks
    .map((chunk) => ({ ...chunk, score: cosineSimilarity(queryVector, chunk.embedding) }))
    .filter((chunk) => chunk.score >= config.minSimilarity)
    .sort((left, right) => right.score - left.score)
    .slice(0, config.candidateK);
  const selected = [];
  let contextChars = 0;
  for (const chunk of candidates) {
    if (selected.length >= config.topK) break;
    if (contextChars + chunk.text.length > config.maxContextChars) continue;
    selected.push(chunk);
    contextChars += chunk.text.length;
  }
  return selected;
}
