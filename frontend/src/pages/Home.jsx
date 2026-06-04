import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import ProjectResult from '../components/ProjectResult';

const EXAMPLE_TOPICS = [
  '🤖 AI Chatbot', '🌦️ Weather App', '📝 Smart Todo', '🎵 Music Recommender',
  '📊 Data Dashboard', ' Password Manager', '🛒 E-commerce Site', '📸 Image Classifier',
];

const TECH_OPTIONS = ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'Django', 'FastAPI', 'MongoDB', 'PostgreSQL', 'AI/ML', 'TypeScript'];
const DOMAIN_OPTIONS = ['Web Dev', 'AI/ML', 'Cybersecurity', 'IoT', 'Mobile', 'Data Science', 'Blockchain', 'Game Dev', 'DevOps', 'AR/VR'];
const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];

export default function Home() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  // Filters
  const [difficulty, setDifficulty] = useState('Beginner');
  const [selectedStack, setSelectedStack] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const toggleStack = (tech) => {
    setSelectedStack(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]);
  };

  const handleGenerate = async (inputTopic) => {
    const finalTopic = inputTopic || topic;
    if (!finalTopic.trim()) { toast.error('Please enter a project topic!'); return; }
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/generate', {
        topic: finalTopic,
        difficulty,
        techStackFilter: selectedStack,
        teamSize,
        domain: selectedDomain,
      });
      setResult(res.data.data);
      toast.success('🎉 Project generated!');
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#e0e7ff', color: '#4f46e5', padding: '6px 16px',
          borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700',
          marginBottom: '20px', letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: '800', color: '#0f172a',
          lineHeight: '1.15', marginBottom: '16px', fontFamily: 'Outfit, sans-serif',
        }}>
          Turn Any Idea Into a{' '}
          <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Complete Project
          </span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '560px', margin: '0 auto 32px' }}>
          AI-powered project ideas with roadmaps, tech stacks, GitHub starter code, and resume bullets.
        </p>

        {/* Search Box */}
        <div style={{
          background: '#fff', border: '2px solid #e2e8f0', borderRadius: '20px',
          padding: '8px 8px 8px 20px', display: 'flex', alignItems: 'center', gap: '12px',
          maxWidth: '680px', margin: '0 auto 16px',
          boxShadow: '0 10px 40px rgba(99,102,241,0.12)',
        }}>
          <span style={{ fontSize: '1.3rem' }}>💡</span>
          <input
            className="input"
            style={{ border: 'none', padding: '10px 0', fontSize: '1rem', flex: 1, boxShadow: 'none' }}
            placeholder="e.g. AI chatbot, weather app, e-commerce..."
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
              <><span style={{ width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Generating...</>
            ) : '⚡ Generate'}
          </button>
        </div>

        {/* Filters Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <button
            onClick={() => setShowFilters(f => !f)}
            style={{
              background: showFilters ? '#e0e7ff' : '#f8fafc',
              border: '1.5px solid #e2e8f0', borderRadius: '12px',
              padding: '8px 18px', fontSize: '0.85rem', fontWeight: '600',
              color: showFilters ? '#6366f1' : '#475569', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit, sans-serif',
            }}
          >
            ⚙️ Customize {showFilters ? '▲' : '▼'}
            {(selectedStack.length > 0 || selectedDomain || teamSize > 1) && (
              <span style={{ background: '#6366f1', color: '#fff', borderRadius: '20px', padding: '1px 8px', fontSize: '0.72rem' }}>
                {selectedStack.length + (selectedDomain ? 1 : 0) + (teamSize > 1 ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div style={{
            background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '20px',
            padding: '24px', maxWidth: '680px', margin: '0 auto 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', animation: 'fadeInUp 0.3s ease',
            textAlign: 'left',
          }}>
            {/* Difficulty */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                🎯 Difficulty
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {DIFFICULTY_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    style={{
                      padding: '6px 16px', borderRadius: '20px', border: '1.5px solid',
                      borderColor: difficulty === d ? '#6366f1' : '#e2e8f0',
                      background: difficulty === d ? '#e0e7ff' : '#f8fafc',
                      color: difficulty === d ? '#4f46e5' : '#475569',
                      fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >{d}</button>
                ))}
              </div>
            </div>

            {/* Domain */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                🏷️ Domain / Subject
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {DOMAIN_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDomain(prev => prev === d ? '' : d)}
                    style={{
                      padding: '5px 14px', borderRadius: '20px', border: '1.5px solid',
                      borderColor: selectedDomain === d ? '#6366f1' : '#e2e8f0',
                      background: selectedDomain === d ? '#e0e7ff' : '#f8fafc',
                      color: selectedDomain === d ? '#4f46e5' : '#475569',
                      fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >{d}</button>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                🛠️ Tech Stack Preference
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {TECH_OPTIONS.map(t => (
                  <button
                    key={t}
                    onClick={() => toggleStack(t)}
                    style={{
                      padding: '5px 14px', borderRadius: '20px', border: '1.5px solid',
                      borderColor: selectedStack.includes(t) ? '#6366f1' : '#e2e8f0',
                      background: selectedStack.includes(t) ? '#e0e7ff' : '#f8fafc',
                      color: selectedStack.includes(t) ? '#4f46e5' : '#475569',
                      fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >{t}</button>
                ))}
              </div>
            </div>

            {/* Team Size */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                👥 Team Size: <span style={{ color: '#6366f1' }}>{teamSize === 1 ? 'Solo' : `${teamSize} people`}</span>
              </div>
              <input
                type="range" min="1" max="6" value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                {[1,2,3,4,5,6].map(n => <span key={n}>{n}</span>)}
              </div>
            </div>
          </div>
        )}

        {/* Example chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {EXAMPLE_TOPICS.map(t => (
            <button
              key={t}
              onClick={() => { const clean = t.replace(/^[^ ]+ /, ''); setTopic(clean); handleGenerate(clean); }}
              disabled={loading}
              style={{
                background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '20px',
                padding: '6px 14px', fontSize: '0.82rem', fontWeight: '600', color: '#475569',
                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Outfit, sans-serif',
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.color = '#6366f1'; e.target.style.background = '#e0e7ff'; }}
              onMouseLeave={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.color = '#475569'; e.target.style.background = '#f8fafc'; }}
            >{t}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {!result && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', maxWidth: '680px', margin: '0 auto 48px' }}>
          {[
            { icon: '🎯', label: 'Project Ideas', value: '1000+' },
            { icon: '⚡', label: 'Gen Time', value: '< 5s' },
            { icon: '🛠️', label: 'Tech Stacks', value: '50+' },
            { icon: '🏆', label: 'Features', value: '18' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px',
              padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>{stat.value}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
          <div style={{ textAlign: 'center', padding: '24px', color: '#6366f1', fontWeight: '600', fontFamily: 'Outfit, sans-serif' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px', animation: 'float 2s ease-in-out infinite' }}>🤖</div>
             AI is crafting your perfect project...
          </div>
          {[180, 280, 200, 240].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: '16px' }} />)}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ animation: 'fadeInUp 0.5s ease' }}>
          <ProjectResult project={result} onRegenerate={handleGenerate} />
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