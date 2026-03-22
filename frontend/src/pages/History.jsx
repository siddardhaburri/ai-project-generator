import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Search, Zap, Heart, Bookmark, Trash2, MessageSquare, Inbox } from 'lucide-react';
import api from '../services/api';

export default function History() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState(null);

  const fetchProjects = async (searchTerm = '', pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: pageNum, limit: 9 });
      if (searchTerm) params.append('search', searchTerm);
      const res = await api.get(`/projects?${params}`);
      setProjects(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError('Failed to load projects. Please try again later.');
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
      fetchProjects(search, page);
    } catch {
      alert('Failed to delete project. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', color: '#f0f0f5' }}>
          Project History
        </h1>
        <p style={{ color: '#9294a0' }}>All your generated projects in one place</p>
      </div>

      <form onSubmit={handleSearch} className="search-bar" style={{ marginBottom: '32px', maxWidth: '500px' }}>
        <input 
          className="input" 
          placeholder="Search projects" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <button type="submit" style={{ 
          background: 'transparent', border: 'none', color: '#6366f1', 
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '40px', height: '40px', transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#8b5cf6'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#6366f1'}>
          <Search size={18} />
        </button>
      </form>

      {error && (
        <div style={{
          color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', 
          padding: '12px 20px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)',
          marginBottom: '24px', fontSize: '0.95rem', fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '16px' }} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <Inbox size={64} className="empty-icon" />
          <h3>No projects yet</h3>
          <p>Generate your first project to see it here</p>
          <Link to="/" style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'transparent', border: 'none', color: '#6366f1',
            textDecoration: 'none', fontWeight: '600', transition: 'color 0.2s',
            marginTop: '8px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#8b5cf6'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6366f1'}>
            Generate Now
          </Link>
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
                <div className="card" style={{
                  cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', position: 'relative',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.boxShadow = '';
                  }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {project.liked && <Heart size={14} style={{ color: '#a5b4fc' }} fill="currentColor" />}
                      {project.saved && <Bookmark size={14} style={{ color: '#a5b4fc' }} fill="currentColor" />}
                    </div>
                    <button onClick={(e) => handleDelete(project._id, e)}
                      className="icon-btn danger"
                      style={{
                        width: '28px', height: '28px',
                        opacity: '0.4', transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '8px', color: '#f0f0f5' }}>
                    {project.projectIdea?.title || project.userInput}
                  </h3>

                  <p style={{
                    fontSize: '0.82rem', color: '#5c5e6a', marginBottom: '14px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <MessageSquare size={12} /> "{project.userInput}"
                  </p>

                  {project.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {project.tags.slice(0, 3).map((t) => (
                        <span key={t} className="tag" style={{ fontSize: '0.72rem' }}>#{t}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: '14px', fontSize: '0.75rem', color: '#3f4150' }}>
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
