import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import ProjectResult from '../components/ProjectResult';

export default function SharedProject() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/projects/share/${slug}`)
      .then(res => setProject(res.data.data))
      .catch(() => toast.error('Shared project not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
      {[200, 300, 200].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: '16px', marginBottom: '20px' }} />)}
    </div>
  );

  if (!project) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔗</div>
      <h2 style={{ fontFamily: 'Outfit, sans-serif' }}>Shared project not found</h2>
      <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '16px' }}>Generate Your Own</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)', border: '1px solid #c7d2fe', borderRadius: '12px', padding: '12px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: '#4f46e5', fontWeight: '600' }}>🔗 Shared Project — view only mode</span>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>⚡ Generate My Own</button>
      </div>
      <ProjectResult project={project} />
    </div>
  );
}