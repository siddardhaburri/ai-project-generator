import React, { useState } from 'react';

import {
  Clock, Heart, Bookmark, Target, Wrench, FolderTree,
  Folder, FileText, Code, Copy, Check, Lightbulb
} from 'lucide-react';
import api from '../services/api';

const PRIORITY_COLORS = {
  'Must Have': 'badge-danger',
  'Should Have': 'badge-warning',
  'Nice to Have': 'badge-success',
};

export default function ProjectResult({ project }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(project.liked);
  const [saved, setSaved] = useState(project.saved);

  const copyCode = () => {
    navigator.clipboard.writeText(project.sampleCode?.code || '');
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  const toggleLike = async () => {
    try {
      const res = await api.patch(`/projects/${project._id}/like`);
      setLiked(res.data.liked);
    } catch (err) { console.error('Failed to update like status'); }
  };

  const toggleSave = async () => {
    try {
      const res = await api.patch(`/projects/${project._id}/save`);
      setSaved(res.data.saved);
    } catch (err) { console.error('Failed to update save status'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header Card */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.78rem', fontWeight: '700' }}>
                {project.projectIdea?.difficulty}
              </span>
              <span className="badge badge-primary" style={{
                fontSize: '0.78rem', fontWeight: '700',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <Clock size={12} /> {project.projectIdea?.estimatedTime}
              </span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px', lineHeight: '1.2', color: '#f0f0f5' }}>
              {project.projectIdea?.title}
            </h2>
            <p style={{ color: '#9294a0', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px' }}>
              {project.projectIdea?.description}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={toggleLike} className={`icon-btn ${liked ? 'active' : ''}`} title="Like">
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button onClick={toggleSave} className={`icon-btn ${saved ? 'active' : ''}`} title="Save">
              <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {project.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            {project.tags.map((tag) => (
              <span key={tag} className="tag">
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
          <div className="section-title"><Target size={20} /> Features</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {project.features?.map((f, i) => (
              <div key={i} style={{
                display: 'flex', gap: '12px', padding: '12px',
                background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#f0f0f5' }}>{f.name}</span>
                    <span className={`badge ${PRIORITY_COLORS[f.priority] || 'badge-gray'}`} style={{ fontSize: '0.7rem' }}>
                      {f.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.83rem', color: '#9294a0', margin: 0 }}>{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="card">
          <div className="section-title"><Wrench size={20} /> Tech Stack</div>
          {Object.entries(project.techStack || {}).map(([category, items]) => (
            items?.length > 0 && (
              <div key={category} style={{ marginBottom: '14px' }}>
                <div style={{
                  fontSize: '0.75rem', fontWeight: '700', color: '#5c5e6a',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
                }}>
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
        <div className="section-title"><FolderTree size={20} /> GitHub Project Structure</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{
              fontSize: '0.8rem', fontWeight: '700', color: '#5c5e6a',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px',
            }}>Folders</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {project.githubStructure?.folders?.map((f) => (
                <div key={f} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px', fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.85rem', color: '#a5b4fc',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <Folder size={16} /> {f}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '0.8rem', fontWeight: '700', color: '#5c5e6a',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px',
            }}>Files</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {project.githubStructure?.files?.map((f) => (
                <div key={f} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px', fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.85rem', color: '#9294a0',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <FileText size={16} /> {f}
                </div>
              ))}
            </div>
          </div>
          {project.githubStructure?.readme && (
            <div>
              <div style={{
                fontSize: '0.8rem', fontWeight: '700', color: '#5c5e6a',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px',
              }}>README Preview</div>
              <pre style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '10px', padding: '12px',
                fontSize: '0.78rem', color: '#9294a0',
                whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace',
                maxHeight: '180px', overflow: 'auto',
              }}>
                {project.githubStructure.readme}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Sample Code */}
      {project.sampleCode?.code && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div>
              <div className="section-title" style={{ marginBottom: '4px' }}><Code size={20} /> Sample Code</div>
              <div style={{ fontSize: '0.82rem', color: '#5c5e6a' }}>
                {project.sampleCode.filename} &bull; {project.sampleCode.language}
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={copyCode} style={{ gap: '6px' }}>
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
          <pre style={{
            margin: 0, padding: '20px', overflow: 'auto',
            background: '#0d0d14', color: '#d1d5db',
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem',
            lineHeight: '1.7', maxHeight: '420px',
          }}>
            <code>{project.sampleCode.code}</code>
          </pre>
          {project.sampleCode.explanation && (
            <div style={{
              padding: '14px 20px',
              background: 'rgba(245,158,11,0.06)',
              borderTop: '1px solid rgba(245,158,11,0.15)',
              display: 'flex', alignItems: 'flex-start', gap: '8px',
            }}>
              <Lightbulb size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.88rem', color: '#fcd34d' }}>{project.sampleCode.explanation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
