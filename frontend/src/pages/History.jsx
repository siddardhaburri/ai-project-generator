import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function History() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchProjects = async (searchTerm = '', pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNum, limit: 9 });
      if (searchTerm) params.append('search', searchTerm);
      const res = await api.get(`/projects?${params}`);
      setProjects(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProjects(search, 1);
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects(search, page);
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>📚 Project History</h1>
        <p style={{ color: '#64748b' }}>All your generated projects in one place</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '32px', maxWidth: '500px' }}>
        <input className="input" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-primary" type="submit">🔍 Search</button>
      </form>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '180px', borderRadius: '16px' }} />)}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📭</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px' }}>No projects yet</h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Generate your first project to see it here</p>
          <Link to="/" className="btn btn-primary">⚡ Generate Now</Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/project/${project._id}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(99,102,241,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {project.liked && <span title="Liked">❤️</span>}
                      {project.saved && <span title="Saved">🔖</span>}
                    </div>
                    <button onClick={(e) => handleDelete(project._id, e)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', opacity: '0.5', transition: 'opacity 0.2s' }}
                      onMouseEnter={(e) => e.target.style.opacity = '1'}
                      onMouseLeave={(e) => e.target.style.opacity = '0.5'}>
                      🗑️
                    </button>
                  </div>

                  <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '8px', color: '#0f172a' }}>
                    {project.projectIdea?.title || project.userInput}
                  </h3>

                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '14px' }}>
                    💬 "{project.userInput}"
                  </p>

                  {project.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {project.tags.slice(0, 3).map((t) => (
                        <span key={t} className="tag" style={{ fontSize: '0.72rem' }}>#{t}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: '14px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                    {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
              {[...Array(pagination.pages)].map((_, i) => (
                <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setPage(i + 1); fetchProjects(search, i + 1); }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
