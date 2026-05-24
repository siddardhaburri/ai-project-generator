import React, { useEffect, useState } from 'react';
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
      .then(res => setProject(res.data.data))
      .catch(() => toast.error('Project not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
      {[200, 300, 200].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: '16px', marginBottom: '20px' }} />)}
    </div>
  );

  if (!project) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</div>
      <h2 style={{ fontFamily: 'Outfit, sans-serif' }}>Project not found</h2>
      <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '16px' }}>Go Home</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '24px' }}>
        ← Back
      </button>
      {project.remixedFrom && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.88rem', color: '#92400e' }}>
          This is a remix of another project
        </div>
      )}
      <ProjectResult project={project} />
    </div>
  );
}