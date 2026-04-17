'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, User, Sparkles, RotateCcw } from 'lucide-react';
import api from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS = [
  { label: '📅 Plan my day', prompt: 'Create an optimized plan for my day based on my current goals and tasks.' },
  { label: '🎯 What to focus on?', prompt: 'What should I focus on right now to make the most progress on my goals?' },
  { label: '📊 Review my progress', prompt: 'Give me a brief review of how I\'m doing across all my goals and habits.' },
  { label: '✨ Set a new goal', prompt: 'Help me define and structure a new goal. Ask me questions to make it actionable.' },
];

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1' }}
        />
      ))}
    </div>
  );
}

const SESSION_ID = `session_${Date.now()}`;

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "👋 Hi! I'm your personal AI productivity coach. I can help you plan your day, review your progress, set goals, and keep you on track. What would you like to work on?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  async function sendMessage(text: string) {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.post('/api/ai/chat', { message: text, sessionId: SESSION_ID });
      const reply = res.data.data.reply;
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Could not reach the AI service. Please check that the backend is running.',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearChat() {
    setMessages([{
      id: '0', role: 'assistant',
      content: "Chat cleared! Ready to help you again. What would you like to work on?",
    }]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Topbar */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(10,14,28,0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>AI Coach</div>
            <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} /> Online
            </div>
          </div>
        </div>
        <button className="btn-ghost" onClick={clearChat} style={{ padding: '7px 14px', fontSize: 13 }}>
          <RotateCcw size={13} /> Clear
        </button>
      </div>

      {/* Suggested prompts */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SUGGESTED_PROMPTS.map((p) => (
            <button key={p.label}
              onClick={() => sendMessage(p.prompt)}
              disabled={isTyping}
              style={{
                padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: 'rgba(99,102,241,0.08)', color: '#94a3b8',
                border: '1px solid rgba(99,102,241,0.15)',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'assistant' && (
                <div style={{
                  width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                }}>
                  <Sparkles size={14} color="white" />
                </div>
              )}
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
                style={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div style={{
                  width: 30, height: 30, borderRadius: 8, background: 'rgba(99,102,241,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                }}>
                  <User size={14} color="#6366f1" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Sparkles size={14} color="white" />
            </div>
            <div className="chat-bubble-ai">
              <TypingIndicator />
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(10,14,28,0.6)',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          background: 'rgba(15,23,42,0.8)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 14, padding: '12px 14px',
          maxWidth: 900, margin: '0 auto',
        }}>
          <textarea ref={inputRef} rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder="Message your AI coach... (Enter to send, Shift+Enter for new line)"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit',
              resize: 'none', lineHeight: 1.5, maxHeight: 120,
            }}
          />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping}
            style={{
              width: 36, height: 36, borderRadius: 9, border: 'none', cursor: 'pointer',
              background: input.trim() && !isTyping ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease', flexShrink: 0,
            }}>
            {isTyping
              ? <Loader2 size={15} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
              : <Send size={15} color={input.trim() ? 'white' : '#475569'} />}
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
          AI responses are generated by GPT-4o and may not always be accurate.
        </p>
      </div>
    </div>
  );
}
