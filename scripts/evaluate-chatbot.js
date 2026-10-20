import { readFile } from "node:fs/promises";
import { embedQuery } from "../src/chatbot/embedding.js";
import { retrieveChunks } from "../src/chatbot/retrieval.js";

const knowledge = JSON.parse(await readFile(new URL("../public/portfolio-embeddings.json", import.meta.url), "utf8"));
const cases = [
  { query: "What programming languages does Keshvi know?", expected: "skills_languages" },
  { query: "Tell me about the EduSync project", expected: "project_edusync" },
  { query: "What is Talk2Doc?", expected: "project_talk2doc" },
  { query: "Did she earn an engineering degree?", expected: "education_overview" },
  { query: "How can I contact Keshvi?", expected: "contact" },
  { query: "Where did Keshvi complete her master's degree?", expected: "education_pg" },
];

let misses = 0;
for (const testCase of cases) {
  const vector = await embedQuery(testCase.query, (loading) => {
    if (loading) console.log("Loading MiniLM for retrieval evaluation…");
  });
  const results = retrieveChunks(vector, knowledge.chunks);
  const found = results.some(({ id }) => id === testCase.expected);
  if (!found) misses += 1;
  console.log(`${found ? "PASS" : "MISS"} ${testCase.query}`);
  console.log(`  expected: ${testCase.expected}`);
  console.log(`  retrieved: ${results.map(({ id, score }) => `${id} (${score.toFixed(3)})`).join(", ") || "none"}`);
}

console.log(`\nRetrieval evaluation: ${cases.length - misses}/${cases.length} expected chunks retrieved in top results.`);
if (misses) process.exitCode = 1;
