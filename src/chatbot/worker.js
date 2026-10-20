const WORKER_URL = import.meta.env.VITE_CHAT_WORKER_URL ||
  "https://portfolio-chat-api.keshvisingh7.workers.dev/chat";

export async function generateChatResponse(messages, { signal } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  const abortRequest = () => controller.abort();
  signal?.addEventListener("abort", abortRequest, { once: true });
  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const error = new Error(response.status === 402 || response.status === 429
        ? "The assistant has reached its usage limit."
        : `Chat request failed: ${response.status}`);
      if (response.status === 402 || response.status === 429) error.code = "usage_limit";
      throw error;
    }

    const data = await response.json();
    if (typeof data?.reply !== "string" || !data.reply.trim()) {
      throw new Error("Empty response from chatbot.");
    }
    return data.reply.trim();
  } catch (error) {
    if (signal?.aborted) throw new Error("Request cancelled.");
    if (controller.signal.aborted) throw new Error("The request timed out. Please try again.");
    if (error instanceof TypeError) throw new Error("Could not connect to the chat service. Check your connection and try again.");
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortRequest);
  }
}
