import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import ProjectResult from '../components/ProjectResult';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then((res) => setProject(res.data.data))
      .catch(() => { toast.error('Project not found'); navigate('/history'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' }}>
      {[220, 280, 200].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: '16px', marginBottom: '16px' }} />)}
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')}>
          ← Back to History
        </button>
        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          Generated on {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>
      {project && <ProjectResult project={project} />}
    </div>
  );
}
