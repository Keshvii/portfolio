export const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";
export const EMBEDDING_MODEL_REVISION = "751bff37182d3f1213fa05d7196b954e230abad9";
export const EMBEDDING_DIMENSIONS = 384;
export const EMBEDDINGS_URL = `${import.meta.env.BASE_URL}portfolio-embeddings.json`;
export const RETRIEVAL = Object.freeze({ topK: 4, minScore: 0.2, maxContextChars: 7200 });

export const SUGGESTED_QUESTIONS = [
  "What technologies does Keshvi work with?",
  "Tell me about EduSync.",
  "What is Talk2Doc?",
  "What did Keshvi study?",
];

