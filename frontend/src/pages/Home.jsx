import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, Zap, Cpu, RefreshCw, Clock, SendHorizonal, Target, Layers } from 'lucide-react';
import ProjectResult from '../components/ProjectResult';

const EXAMPLE_TOPICS = [
  'Machine Learning Model',
  'AI Chatbot',
  'E-Commerce Website',
  'Task Management App',
  'Portfolio Website',
  'Weather App',
  'Pathfinding Visualizer',
  'Fitness Tracker',
  'Blogging Platform',
  'Blockchain Smart Contract'
];

export default function Home() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGenerate = async (inputTopic) => {
    const finalTopic = inputTopic || topic;
    setError('');

    if (!finalTopic.trim()) {
      setError('Please enter a project topic');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post('/generate', { topic: finalTopic });
      setResult(res.data.data);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: '800',
          color: '#f0f0f5',
          lineHeight: '1.15',
          marginBottom: '16px',
        }}>
          Turn Any Idea Into a{' '}
          <span className="gradient-text">
            Complete Project
          </span>
        </h1>

        <p style={{
          fontSize: '1.15rem', color: '#9294a0',
          maxWidth: '560px', margin: '0 auto 40px',
        }}>
          Never wonder "what to build" again. Get instant project ideas, features, tech stack, GitHub structure & sample code.
        </p>

        {/* Search Box */}
        <div className="search-bar" style={{
          maxWidth: '640px', margin: '0 auto 24px',
        }}>
          <Search size={20} className="search-icon" />
          <input
            className="input"
            placeholder="e.g. Mini project on machine learning, AI chatbot..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={loading}
          />
          <button
            onClick={() => handleGenerate()}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6366f1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.color = '#8b5cf6')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.color = '#6366f1')}
          >
            {loading ? (
              <span style={{
                width: '18px', height: '18px',
                border: '2.5px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff', borderRadius: '50%',
                display: 'inline-block', animation: 'spin 0.8s linear infinite'
              }} />
            ) : (
              <SendHorizonal size={20} />
            )}
          </button>
        </div>

        {error && (
          <div style={{
            color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)',
            padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'inline-block', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {/* Example Topics */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {EXAMPLE_TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => { setTopic(t); handleGenerate(t); }}
              disabled={loading}
              className="chip"
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
            { icon: <Target size={22} />, label: 'Project Ideas', value: '1000+' },
            { icon: <Zap size={22} />, label: 'Avg. Gen Time', value: '< 5 sec' },
            { icon: <Layers size={22} />, label: 'Tech Stacks', value: '50+' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
          <div className="loading-indicator">
            <div className="loading-icon" style={{ display: 'flex', justifyContent: 'center' }}>
              <Cpu size={48} />
            </div>
            <div className="loading-text">Gemini AI is crafting your perfect project</div>
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
              <RefreshCw size={16} /> Generate New
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/history')}>
              <Clock size={16} /> View History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
