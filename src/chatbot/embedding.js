import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, EMBEDDING_MODEL_REVISION } from "./config.js";

let extractorPromise;
let modelLoaded = false;

async function loadExtractor(onModelLoading) {
  if (!extractorPromise) {
    onModelLoading?.(true);
    const transformersModule = typeof window === "undefined"
      ? "@huggingface/transformers"
      : "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1";
    extractorPromise = import(/* @vite-ignore */ transformersModule)
      .then(({ env, pipeline }) => {
        env.allowLocalModels = false;
        env.backends.onnx.wasm.numThreads = 1;
        return pipeline("feature-extraction", EMBEDDING_MODEL, {
          dtype: "q8",
          revision: EMBEDDING_MODEL_REVISION,
        });
      })
      .then((extractor) => {
        modelLoaded = true;
        return extractor;
      })
      .catch((error) => {
        extractorPromise = undefined;
        throw new Error(`The query embedding model could not be loaded: ${error.message}`);
      })
      .finally(() => onModelLoading?.(false));
  }
  return extractorPromise;
}

export async function embedQuery(query, onModelLoading) {
  const extractor = await loadExtractor(onModelLoading);
  const output = await extractor(query, { pooling: "mean", normalize: true });
  const vector = Array.from(output.data);
  if (vector.length !== EMBEDDING_DIMENSIONS || vector.some((value) => !Number.isFinite(value))) {
    throw new Error("The query embedding has an incompatible format.");
  }
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!Number.isFinite(magnitude) || Math.abs(magnitude - 1) > 0.02) throw new Error("The query embedding could not be normalized.");
  return vector;
}

export function isEmbeddingModelLoaded() {
  return modelLoaded;
}
