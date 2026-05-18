import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const DIFFICULTY_COLORS = {
  'Beginner': { bg: '#d1fae5', color: '#065f46' },
  'Intermediate': { bg: '#fef3c7', color: '#92400e' },
  'Advanced': { bg: '#fee2e2', color: '#991b1b' },
};

export default function Gallery() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/gallery?sortBy=${sortBy}&page=${page}&limit=12`);
      setProjects(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch { toast.error('Failed to load gallery'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGallery(); }, [sortBy, page]);

  const upvote = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/projects/${id}/upvote`);
      setProjects(prev => prev.map(p => p._id === id ? { ...p, upvotes: res.data.upvotes } : p));
      toast.success('⬆️ Upvoted!');
    } catch { toast.error('Failed to upvote'); }
  };

  const remix = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/projects/${id}/remix`);
      toast.success('🎨 Remixed! Opening your copy...');
      navigate(`/project/${res.data.data._id}`);
    } catch { toast.error('Failed to remix'); }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fef3c7', color: '#92400e', padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700', marginBottom: '16px' }}>
          🏆 Community Gallery
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>
          Project Showcase
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>Browse, upvote, and remix community-generated project ideas</p>
      </div>

      {/* Sort Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
        {[
          { key: 'popular', label: '🔥 Popular' },
          { key: 'newest', label: '✨ Newest' },
          { key: 'remixed', label: '🎨 Most Remixed' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => { setSortBy(key); setPage(1); }}
            style={{ padding: '8px 20px', borderRadius: '12px', border: '1.5px solid', borderColor: sortBy === key ? '#6366f1' : '#e2e8f0', background: sortBy === key ? '#e0e7ff' : '#fff', color: sortBy === key ? '#4f46e5' : '#475569', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: '220px', borderRadius: '16px' }} />)}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', color: '#94a3b8' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏜️</div>
          <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#64748b' }}>Gallery is empty</div>
          <p>Be the first to add a project!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {projects.map(project => (
            <div
              key={project._id}
              onClick={() => navigate(`/project/${project._id}`)}
              style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = '#6366f1'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              {/* Top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />

              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                {project.projectIdea?.difficulty && (
                  <span style={{ ...DIFFICULTY_COLORS[project.projectIdea.difficulty], padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700' }}>
                    {project.projectIdea.difficulty}
                  </span>
                )}
                {(project.domainTags || []).slice(0, 1).map(d => (
                  <span key={d} style={{ background: '#f1f5f9', color: '#475569', padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600' }}>{d}</span>
                ))}
              </div>

              <h3 style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a', marginBottom: '8px', lineHeight: '1.3', fontFamily: 'Outfit, sans-serif' }}>
                {project.projectIdea?.title}
              </h3>

              {/* Tech Stack */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {[...(project.techStack?.frontend || []), ...(project.techStack?.backend || [])].slice(0, 4).map(t => (
                  <span key={t} style={{ background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600' }}>{t}</span>
                ))}
              </div>

              {/* Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', color: '#64748b' }}>
                  <span>⬆️ {project.upvotes || 0}</span>
                  <span>🎨 {project.remixCount || 0}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={e => upvote(project._id, e)}
                    style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600', fontFamily: 'Outfit, sans-serif' }}>
                    ⬆️ Upvote
                  </button>
                  <button onClick={e => remix(project._id, e)}
                    style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid #e0e7ff', background: '#e0e7ff', color: '#4f46e5', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600', fontFamily: 'Outfit, sans-serif' }}>
                    🎨 Remix
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-secondary btn-sm">← Prev</button>
          <span style={{ padding: '6px 16px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '10px', fontWeight: '700', fontSize: '0.88rem' }}>{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-secondary btn-sm">Next →</button>
        </div>
      )}
    </div>
  );
}