import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import ProjectResult from '../components/ProjectResult';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then((res) => setProject(res.data.data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' }}>
      {[220, 280, 200].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: '16px', marginBottom: '16px' }} />)}
    </div>
  );

  if (!project) return (
    <div style={{ maxWidth: '1000px', margin: '100px auto', textAlign: 'center', padding: '0 24px' }}>
      <h2 style={{ fontSize: '2rem', color: '#f0f0f5', marginBottom: '12px', fontWeight: '800' }}>Project Not Found</h2>
      <p style={{ color: '#9294a0', marginBottom: '32px', fontSize: '1.1rem' }}>The project you're looking for was deleted or never existed.</p>
      <button className="btn btn-primary" onClick={() => navigate('/history')} style={{ display: 'inline-flex', gap: '8px' }}>
        <ArrowLeft size={16} /> Back to History
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')} style={{ gap: '6px' }}>
          <ArrowLeft size={16} /> Back to History
        </button>
        <span style={{ color: '#5c5e6a', fontSize: '0.85rem' }}>
          Generated on {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>
      {project && <ProjectResult project={project} />}
    </div>
  );
}
