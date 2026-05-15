import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import ProjectResult from '../components/ProjectResult';

const EXAMPLE_TOPICS = [
  '🤖 AI Chatbot', '🌦️ Weather App', '📝 Todo App with AI',
  '🎵 Music Recommender', '📊 Data Dashboard', '🔐 Password Manager',
  '🛒 E-commerce Site', '📸 Image Classifier', '💬 Real-time Chat',
];

export default function Home() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleGenerate = async (inputTopic) => {
    const finalTopic = inputTopic || topic;
    if (!finalTopic.trim()) {
      toast.error('Please enter a project topic!');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post('/generate', { topic: finalTopic });
      setResult(res.data.data);
      toast.success('🎉 Project generated successfully!');
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#e0e7ff', color: '#4f46e5', padding: '6px 16px',
          borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700',
          marginBottom: '20px', letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          ✨ Powered by Google Gemini AI
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: '800',
          color: '#0f172a',
          lineHeight: '1.15',
          marginBottom: '16px',
        }}>
          Turn Any Idea Into a{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Complete Project
          </span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '560px', margin: '0 auto 40px' }}>
          Students: Never wonder "what to build" again. Get instant project ideas, features, tech stack, GitHub structure & sample code.
        </p>

        {/* Search Box */}
        <div style={{
          background: '#fff',
          border: '2px solid #e2e8f0',
          borderRadius: '20px',
          padding: '8px 8px 8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '640px',
          margin: '0 auto 20px',
          boxShadow: '0 10px 40px rgba(99,102,241,0.12)',
          transition: 'border-color 0.2s',
        }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <span style={{ fontSize: '1.3rem' }}>💡</span>
          <input
            className="input"
            style={{ border: 'none', padding: '10px 0', fontSize: '1rem', flex: 1, boxShadow: 'none' }}
            placeholder="e.g. Mini project on machine learning, AI chatbot..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={loading}
          />
          <button
            className="btn btn-primary btn-lg"
            onClick={() => handleGenerate()}
            disabled={loading}
            style={{ borderRadius: '14px', minWidth: '140px', whiteSpace: 'nowrap' }}
          >
            {loading ? (
              <>
                <span style={{ width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Generating...
              </>
            ) : (
              <>⚡ Generate</>
            )}
          </button>
        </div>

        {/* Example Topics */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {EXAMPLE_TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => { setTopic(t.replace(/^[^ ]+ /, '')); handleGenerate(t.replace(/^[^ ]+ /, '')); }}
              disabled={loading}
              style={{
                background: '#f8fafc', border: '1.5px solid #e2e8f0',
                borderRadius: '20px', padding: '6px 14px',
                fontSize: '0.82rem', fontWeight: '600', color: '#475569',
                cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.color = '#6366f1'; e.target.style.background = '#e0e7ff'; }}
              onMouseLeave={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.color = '#475569'; e.target.style.background = '#f8fafc'; }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {!result && !loading && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
          maxWidth: '680px', margin: '0 auto 48px',
        }}>
          {[
            { icon: '🎯', label: 'Project Ideas', value: '1000+' },
            { icon: '⚡', label: 'Avg. Gen Time', value: '< 5 sec' },
            { icon: '🎓', label: 'Tech Stacks', value: '50+' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: '16px', padding: '20px', textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
          <div style={{ textAlign: 'center', padding: '24px', color: '#6366f1', fontWeight: '600' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px', animation: 'float 2s ease-in-out infinite' }}>🤖</div>
            Gemini AI is crafting your perfect project...
          </div>
          {[180, 280, 200, 240].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: '16px' }} />
          ))}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ animation: 'fadeInUp 0.5s ease' }}>
          <ProjectResult project={result} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '32px' }}>
            <button className="btn btn-secondary" onClick={() => { setResult(null); setTopic(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              🔄 Generate New
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/history')}>
              📚 View History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
