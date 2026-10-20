import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bot, RotateCcw, Send, X } from "lucide-react";
import { sendChatMessage } from "../chatbot/chatService.js";
import { SUGGESTED_QUESTIONS } from "../chatbot/config.js";

const WELCOME = "Hi! I can help with questions about skills, education, projects, and experience.";
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)|(https?:\/\/[^\s]+|mailto:[^\s]+)/g;

function renderText(text) {
  const parts = [];
  let cursor = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    const href = match[2] || match[3];
    parts.push(<a key={`${match.index}-${href}`} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer">{match[1] || href}</a>);
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

function MessageContent({ text }) {
  return <div>{text.split(/\n\n+/).map((paragraph, index) => <p key={index}>{renderText(paragraph)}</p>)}</div>;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ role: "assistant", text: WELCOME }]);
  const [typing, setTyping] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [failedQuestion, setFailedQuestion] = useState("");
  const endRef = useRef(null);
  const requestRef = useRef(null);
  const suggestionsVisible = messages.length === 1 && !typing;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, typing, open]);
  useEffect(() => () => requestRef.current?.abort(), []);

  async function send(value = input) {
    const question = value.trim();
    if (!question || typing) return;
    const history = messages
      .filter((message) => ["user", "assistant"].includes(message.role) && !message.isError && message !== messages[0])
      .slice(-8)
      .map(({ role, text }) => ({ role, text }));
    const controller = new AbortController();
    requestRef.current = controller;
    setMessages((old) => [...old, { role: "user", text: question }]);
    setInput("");
    setFailedQuestion("");
    setTyping(true);
    try {
      const answer = await sendChatMessage(question, history, { signal: controller.signal, onModelLoading: setLoadingModel });
      setMessages((old) => [...old, { role: "assistant", text: answer }]);
    } catch (error) {
      if (!controller.signal.aborted) {
        const usageLimit = error.code === "usage_limit";
        setMessages((old) => [...old, {
          role: "assistant",
          isError: true,
          text: usageLimit
            ? "Ugh, I’m out of replies for now. Please contact Keshvi at [keshvi030802@gmail.com](mailto:keshvi030802@gmail.com)."
            : error.message || "The assistant is temporarily unavailable. Please try again.",
        }]);
        if (!usageLimit) setFailedQuestion(question);
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoadingModel(false);
        setTyping(false);
      }
    }
  }

  function clearConversation() {
    const activeRequest = requestRef.current;
    requestRef.current = null;
    activeRequest?.abort();
    setMessages([{ role: "assistant", text: WELCOME }]);
    setFailedQuestion("");
    setTyping(false);
    setLoadingModel(false);
  }

  return <>
    <AnimatePresence>{open && <motion.aside className="chat-panel" initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.2 }} aria-label="Portfolio assistant">
      <div className="chat-header"><div className="chat-avatar"><Bot size={17} /></div><div><b>Portfolio</b><span><i /> AI assistant</span></div><button type="button" aria-label="Clear conversation" title="Clear conversation" onClick={clearConversation}><RotateCcw size={15} /></button><button type="button" aria-label="Close assistant" onClick={() => setOpen(false)}><X size={17} /></button></div>
      <div className="chat-messages" aria-live="polite">
        {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`chat-message ${message.role}`}><MessageContent text={message.text} /></div>)}
        {typing && <div className="chat-message assistant"><div>{loadingModel && <span className="model-loading">Loading the question understanding model…</span>}<div className="typing-dots"><i /><i /><i /></div></div></div>}
        {failedQuestion && !typing && <div className="chat-retry"><span>Something went wrong.</span><button type="button" onClick={() => send(failedQuestion)}>Try again <ArrowRight size={13} /></button></div>}
        {suggestionsVisible && <div className="suggestions">{SUGGESTED_QUESTIONS.map((question) => <button key={question} type="button" onClick={() => send(question)}>{question}<ArrowRight size={12} /></button>)}</div>}
        <div ref={endRef} />
      </div>
      <form className="chat-compose" onSubmit={(event) => { event.preventDefault(); send(); }}><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="Ask a question…" aria-label="Ask a question" maxLength={1000} rows={1} /><button aria-label="Send question" type="submit" disabled={!input.trim() || typing}><Send size={15} /></button></form>
      <div className="chat-disclaimer">Answers are based on Keshvi’s portfolio information.</div>
    </motion.aside>}</AnimatePresence>
    <button className={`chat-launcher ${open ? "active" : ""}`} aria-label={open ? "Close portfolio assistant" : "Open portfolio assistant"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <><span>Ask me</span><span className="launcher-spark">✳</span></>}</button>
  </>;
}
