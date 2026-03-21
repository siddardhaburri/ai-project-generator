import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const PRIORITY_COLORS = {
  'Must Have': 'badge-danger',
  'Should Have': 'badge-warning',
  'Nice to Have': 'badge-success',
};

const DIFFICULTY_COLORS = {
  'Beginner': { bg: '#d1fae5', color: '#065f46' },
  'Intermediate': { bg: '#fef3c7', color: '#92400e' },
  'Advanced': { bg: '#fee2e2', color: '#991b1b' },
};

export default function ProjectResult({ project }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(project.liked);
  const [saved, setSaved] = useState(project.saved);

  const copyCode = () => {
    navigator.clipboard.writeText(project.sampleCode?.code || '');
    setCopied(true);
    toast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleLike = async () => {
    try {
      const res = await api.patch(`/projects/${project._id}/like`);
      setLiked(res.data.liked);
      toast.success(res.data.liked ? '❤️ Liked!' : 'Unliked');
    } catch { toast.error('Failed to update'); }
  };

  const toggleSave = async () => {
    try {
      const res = await api.patch(`/projects/${project._id}/save`);
      setSaved(res.data.saved);
      toast.success(res.data.saved ? '🔖 Saved!' : 'Removed from saved');
    } catch { toast.error('Failed to update'); }
  };

  const diff = DIFFICULTY_COLORS[project.projectIdea?.difficulty] || DIFFICULTY_COLORS['Beginner'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>
                {project.projectIdea?.difficulty}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>
                ⏱️ {project.projectIdea?.estimatedTime}
              </span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px', lineHeight: '1.2' }}>
              {project.projectIdea?.title}
            </h2>
            <p style={{ opacity: '0.9', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px' }}>
              {project.projectIdea?.description}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={toggleLike} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', fontSize: '1.2rem', transition: 'all 0.2s' }}
              title="Like">
              {liked ? '❤️' : '🤍'}
            </button>
            <button onClick={toggleSave} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', fontSize: '1.2rem', transition: 'all 0.2s' }}
              title="Save">
              {saved ? '🔖' : '📌'}
            </button>
          </div>
        </div>

        {project.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            {project.tags.map((tag) => (
              <span key={tag} style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

        {/* Features */}
        <div className="card">
          <div className="section-title">🎯 Features</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {project.features?.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{f.name}</span>
                    <span className={`badge ${PRIORITY_COLORS[f.priority] || 'badge-gray'}`} style={{ fontSize: '0.7rem' }}>
                      {f.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.83rem', color: '#64748b', margin: 0 }}>{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="card">
          <div className="section-title">🛠️ Tech Stack</div>
          {Object.entries(project.techStack || {}).map(([category, items]) => (
            items?.length > 0 && (
              <div key={category} style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  {category}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {items.map((item) => (
                    <span key={item} className="tag" style={{ fontSize: '0.8rem' }}>{item}</span>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* GitHub Structure */}
      <div className="card">
        <div className="section-title">📁 GitHub Project Structure</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Folders</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {project.githubStructure?.folders?.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: '#6366f1' }}>
                  📂 {f}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Files</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {project.githubStructure?.files?.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: '#475569' }}>
                  📄 {f}
                </div>
              ))}
            </div>
          </div>
          {project.githubStructure?.readme && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>README Preview</div>
              <pre style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', fontSize: '0.78rem', color: '#475569', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace', maxHeight: '180px', overflow: 'auto' }}>
                {project.githubStructure.readme}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Sample Code */}
      {project.sampleCode?.code && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div>
              <div className="section-title" style={{ marginBottom: '4px' }}>💻 Sample Code</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{project.sampleCode.filename} • {project.sampleCode.language}</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={copyCode}>
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
          <pre style={{
            margin: 0, padding: '20px', overflow: 'auto',
            background: '#1e293b', color: '#e2e8f0',
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem',
            lineHeight: '1.7', maxHeight: '420px',
          }}>
            <code>{project.sampleCode.code}</code>
          </pre>
          {project.sampleCode.explanation && (
            <div style={{ padding: '14px 20px', background: '#fffbeb', borderTop: '1px solid #fde68a' }}>
              <span style={{ fontWeight: '700', color: '#92400e' }}>💡 </span>
              <span style={{ fontSize: '0.88rem', color: '#78350f' }}>{project.sampleCode.explanation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
