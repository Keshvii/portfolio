import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, EMBEDDING_MODEL_REVISION } from "./config.js";

let modelPromise;
let modelReady = false;

export const isEmbedderReady = () => modelReady;

export function loadEmbedder() {
  if (!modelPromise) {
    modelPromise = import("@huggingface/transformers")
      .then(({ pipeline, env }) => {
        env.allowLocalModels = false;
        return pipeline("feature-extraction", EMBEDDING_MODEL, {
          dtype: "q8",
          revision: EMBEDDING_MODEL_REVISION,
        });
      })
      .then((embed) => { modelReady = true; return embed; })
      .catch((error) => { modelPromise = undefined; modelReady = false; throw error; });
  }
  return modelPromise;
}

export async function embedQuestion(question) {
  const embed = await loadEmbedder();
  const output = await embed(question, { pooling: "mean", normalize: true });
  const vector = Array.from(output.data);
  if (vector.length !== EMBEDDING_DIMENSIONS || vector.some((value) => !Number.isFinite(value))) {
    throw new Error("The question embedding has an unexpected format.");
  }
  return vector;
}
