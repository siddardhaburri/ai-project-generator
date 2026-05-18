import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const DIFFICULTY_COLORS = {
  'Beginner': { bg: '#d1fae5', color: '#065f46' },
  'Intermediate': { bg: '#fef3c7', color: '#92400e' },
  'Advanced': { bg: '#fee2e2', color: '#991b1b' },
};

const DOMAIN_OPTIONS = ['', 'Web Dev', 'AI/ML', 'Cybersecurity', 'IoT', 'Mobile', 'Data Science', 'Blockchain', 'Game Dev'];
const DIFFICULTY_OPTIONS = ['', 'Beginner', 'Intermediate', 'Advanced'];

export default function History() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [domain, setDomain] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [likedOnly, setLikedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: 12, search, sortBy,
        ...(difficulty && { difficulty }),
        ...(domain && { domain }),
        ...(savedOnly && { saved: 'true' }),
        ...(likedOnly && { liked: 'true' }),
      });
      const res = await api.get(`/projects?${params}`);
      setProjects(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page, search, difficulty, domain, savedOnly, likedOnly, sortBy]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => { setPage(1); }, [search, difficulty, domain, savedOnly, likedOnly, sortBy]);

  const deleteProject = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const shareProject = (project, e) => {
    e.stopPropagation();
    if (project.shareSlug) {
      const url = `${window.location.origin}/share/${project.shareSlug}`;
      navigator.clipboard.writeText(url);
      toast.success('🔗 Share link copied!');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>📚 Project History</h1>
        <p style={{ color: '#64748b' }}>All your generated projects in one place</p>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input"
          style={{ flex: '1', minWidth: '200px', padding: '9px 14px', fontSize: '0.9rem' }}
          placeholder="🔍 Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input" style={{ padding: '9px 14px', fontSize: '0.88rem', minWidth: '140px', cursor: 'pointer' }} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d || 'All Difficulties'}</option>)}
        </select>
        <select className="input" style={{ padding: '9px 14px', fontSize: '0.88rem', minWidth: '140px', cursor: 'pointer' }} value={domain} onChange={e => setDomain(e.target.value)}>
          {DOMAIN_OPTIONS.map(d => <option key={d} value={d}>{d || 'All Domains'}</option>)}
        </select>
        <select className="input" style={{ padding: '9px 14px', fontSize: '0.88rem', minWidth: '140px', cursor: 'pointer' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Most Upvoted</option>
          <option value="title">Title A-Z</option>
        </select>
        <button onClick={() => setSavedOnly(s => !s)}
          style={{ padding: '9px 16px', borderRadius: '10px', border: '1.5px solid', borderColor: savedOnly ? '#6366f1' : '#e2e8f0', background: savedOnly ? '#e0e7ff' : '#f8fafc', color: savedOnly ? '#4f46e5' : '#475569', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
          🔖 Saved
        </button>
        <button onClick={() => setLikedOnly(l => !l)}
          style={{ padding: '9px 16px', borderRadius: '10px', border: '1.5px solid', borderColor: likedOnly ? '#6366f1' : '#e2e8f0', background: likedOnly ? '#e0e7ff' : '#f8fafc', color: likedOnly ? '#4f46e5' : '#475569', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
          ❤️ Liked
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '180px', borderRadius: '16px' }} />)}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: '#94a3b8' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
          <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px', color: '#64748b' }}>No projects found</div>
          <p>Try changing your filters or generate a new project!</p>
          <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '16px' }}>⚡ Generate Project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {projects.map(project => (
            <div
              key={project._id}
              onClick={() => navigate(`/project/${project._id}`)}
              style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor = '#6366f1'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    {project.projectIdea?.difficulty && (
                      <span style={{ ...DIFFICULTY_COLORS[project.projectIdea.difficulty], padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700' }}>
                        {project.projectIdea.difficulty}
                      </span>
                    )}
                    {project.projectIdea?.estimatedTime && (
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600' }}>
                        ⏱ {project.projectIdea.estimatedTime}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a', marginBottom: '6px', lineHeight: '1.3', fontFamily: 'Outfit, sans-serif' }}>
                    {project.projectIdea?.title || project.userInput}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                  {project.liked && <span title="Liked">❤️</span>}
                  {project.saved && <span title="Saved">🔖</span>}
                </div>
              </div>

              {/* Tech tags */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {[...(project.techStack?.frontend || []), ...(project.techStack?.backend || [])].slice(0, 4).map(t => (
                  <span key={t} style={{ background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600' }}>{t}</span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={e => shareProject(project, e)}
                    style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}>
                    🔗
                  </button>
                  <button onClick={e => deleteProject(project._id, e)}
                    style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fff5f5', color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}>
                    🗑️
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
          <span style={{ padding: '6px 16px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '10px', fontWeight: '700', fontSize: '0.88rem' }}>
            {page} / {totalPages}
          </span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-secondary btn-sm">Next →</button>
        </div>
      )}
    </div>
  );
}