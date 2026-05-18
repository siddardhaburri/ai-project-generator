import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';

export default function AIMentorChat({ projectContext, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hey! 👋 I'm your AI mentor for **${projectContext?.title || 'this project'}**. Ask me anything — architecture questions, debugging help, feature ideas, or career advice!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const QUICK_PROMPTS = [
    'Where should I start?',
    'What are common pitfalls?',
    'How do I structure the backend?',
    'What should I add to my resume?',
  ];

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/generate/chat', {
        messages: newMessages,
        projectContext,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't connect. Try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '2px solid #6366f1' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#fff' }}>
          <div style={{ fontWeight: '800', fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>🤖 AI Mentor Mode</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>Ask anything about your project</div>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#fff', fontSize: '0.9rem' }}>✕ Close</button>
      </div>

      {/* Messages */}
      <div style={{ height: '360px', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#fafafa' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginRight: '8px', alignSelf: 'flex-end' }}>🤖</div>
            )}
            <div style={{
              maxWidth: '80%', padding: '12px 16px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: m.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#fff',
              color: m.role === 'user' ? '#fff' : '#0f172a',
              fontSize: '0.88rem', lineHeight: '1.6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: m.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
              whiteSpace: 'pre-wrap',
            }}>
              {m.content.replace(/\*\*(.*?)\*\*/g, '$1')}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🤖</div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '12px 16px', display: 'flex', gap: '4px' }}>
              {[0, 1, 2].map(i => <span key={i} style={{ width: '6px', height: '6px', background: '#6366f1', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.2s infinite', animationDelay: `${i * 0.2}s`, opacity: 0.7 }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{ padding: '12px 16px 0', background: '#fff', display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid #e2e8f0' }}>
        {QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => send(p)} disabled={loading}
            style={{ padding: '5px 12px', borderRadius: '20px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px 16px', background: '#fff', display: 'flex', gap: '10px' }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask your AI mentor anything..."
          disabled={loading}
          style={{ flex: 1, padding: '10px 16px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', outline: 'none' }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          style={{ padding: '10px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', opacity: (loading || !input.trim()) ? 0.6 : 1, whiteSpace: 'nowrap', fontFamily: 'Outfit, sans-serif' }}>
          Send ↑
        </button>
      </div>
    </div>
  );
}