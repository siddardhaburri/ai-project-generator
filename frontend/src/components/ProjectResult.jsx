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

function buildFileMap(project) {
  const files = {};
  const title = project.projectIdea?.title || 'project';
  const description = project.projectIdea?.description || '';
  const folders = project.githubStructure?.folders || [];
  const fileNames = project.githubStructure?.files || [];
  const readme = project.githubStructure?.readme || `# ${title}\n\n${description}`;
  const sampleCode = project.sampleCode?.code || '';
  const sampleFilename = project.sampleCode?.filename || 'main.js';

  files['README.md'] = readme;
  files['.gitignore'] = `node_modules/\n.env\n.DS_Store\ndist/\nbuild/\n*.log\n`;

  const codePath = folders.includes('src') ? `src/${sampleFilename}` : sampleFilename;
  if (sampleCode) files[codePath] = sampleCode;

  fileNames.forEach((f) => {
    if (!files[f]) files[f] = `// ${f} - generated for ${title}\n`;
  });

  folders.forEach((folder) => {
    if (!Object.keys(files).some((k) => k.startsWith(folder + '/'))) {
      files[`${folder}/.gitkeep`] = '';
    }
  });

  return files;
}

async function downloadZip(project) {
  if (!window.JSZip) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  const zip = new window.JSZip();
  const title = (project.projectIdea?.title || 'project').replace(/\s+/g, '-').toLowerCase();
  const root = zip.folder(title);
  const fileMap = buildFileMap(project);
  Object.entries(fileMap).forEach(([path, content]) => root.file(path, content));
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function GitHubModal({ project, onClose }) {
  const [token, setToken] = useState('');
  const [repoName, setRepoName] = useState(
    (project.projectIdea?.title || 'my-project').replace(/\s+/g, '-').toLowerCase()
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');

  const pushToGitHub = async () => {
    if (!token.trim()) { toast.error('Please enter your GitHub token'); return; }
    if (!repoName.trim()) { toast.error('Please enter a repo name'); return; }
    setPushing(true);
    try {
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${token}` },
      });
      if (!userRes.ok) throw new Error('Invalid GitHub token. Please check and try again.');
      const user = await userRes.json();

      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: repoName,
          description: project.projectIdea?.description || '',
          private: isPrivate,
          auto_init: false,
        }),
      });
      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.message || 'Failed to create repository');
      }
      const repo = await createRes.json();

      const fileMap = buildFileMap(project);
      for (const [path, content] of Object.entries(fileMap)) {
        const encoded = btoa(unescape(encodeURIComponent(content)));
        await fetch(`https://api.github.com/repos/${user.login}/${repoName}/contents/${path}`, {
          method: 'PUT',
          headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `Add ${path}`, content: encoded }),
        });
      }
      setRepoUrl(repo.html_url);
      toast.success('Pushed to GitHub successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to push to GitHub');
    } finally {
      setPushing(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>🐙 Push to GitHub</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: '#94a3b8' }}>Create a new repo and push all project files</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        {repoUrl ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
            <p style={{ fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Repository created successfully!</p>
            <a href={repoUrl} target="_blank" rel="noreferrer"
              style={{ display: 'inline-block', background: '#0f172a', color: '#fff', padding: '10px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }}>
              🔗 View on GitHub
            </a>
            <br />
            <button onClick={onClose} style={{ marginTop: '12px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>GitHub Personal Access Token *</label>
              <input type="password" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" value={token} onChange={(e) => setToken(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', fontFamily: 'monospace' }} />
              <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                🔒 Your token is never stored. &nbsp;
                <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>Create token here</a>
              </p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Repository Name *</label>
              <input type="text" value={repoName} onChange={(e) => setRepoName(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <input type="checkbox" id="private-toggle" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              <label htmlFor="private-toggle" style={{ fontSize: '0.87rem', color: '#475569', cursor: 'pointer', fontWeight: '600' }}>🔒 Make repository private</label>
            </div>
            <button onClick={pushToGitHub} disabled={pushing}
              style={{ width: '100%', padding: '13px', background: pushing ? '#94a3b8' : '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '700', cursor: pushing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {pushing ? (<><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Pushing to GitHub...</>) : '🚀 Create Repo & Push Files'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProjectResult({ project }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(project.liked);
  const [saved, setSaved] = useState(project.saved);
  const [zipping, setZipping] = useState(false);
  const [showGitHub, setShowGitHub] = useState(false);

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

  const handleDownloadZip = async () => {
    setZipping(true);
    try {
      await downloadZip(project);
      toast.success('📦 ZIP downloaded successfully!');
    } catch (err) {
      toast.error('Failed to generate ZIP');
    } finally {
      setZipping(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {showGitHub && <GitHubModal project={project} onClose={() => setShowGitHub(false)} />}

      {/* Header Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>{project.projectIdea?.difficulty}</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>⏱️ {project.projectIdea?.estimatedTime}</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px', lineHeight: '1.2' }}>{project.projectIdea?.title}</h2>
            <p style={{ opacity: '0.9', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px' }}>{project.projectIdea?.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={toggleLike} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', fontSize: '1.2rem' }} title="Like">{liked ? '❤️' : '🤍'}</button>
            <button onClick={toggleSave} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', fontSize: '1.2rem' }} title="Save">{saved ? '🔖' : '📌'}</button>
          </div>
        </div>

        {project.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            {project.tags.map((tag) => (
              <span key={tag} style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* ── Download ZIP & Push to GitHub Buttons ── */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button onClick={handleDownloadZip} disabled={zipping}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', color: '#6366f1', border: 'none', borderRadius: '12px', padding: '10px 20px', fontWeight: '700', fontSize: '0.9rem', cursor: zipping ? 'not-allowed' : 'pointer', opacity: zipping ? 0.7 : 1, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            {zipping ? (<><span style={{ width: '14px', height: '14px', border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Creating ZIP...</>) : '📦 Download ZIP'}
          </button>
          <button onClick={() => setShowGitHub(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 20px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
            🐙 Push to GitHub
          </button>
        </div>
      </div>

      {/* Features & Tech Stack */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="card">
          <div className="section-title">🎯 Features</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {project.features?.map((f, i) => (
              <div key={i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{f.name}</span>
                  <span className={`badge ${PRIORITY_COLORS[f.priority] || 'badge-gray'}`} style={{ fontSize: '0.7rem' }}>{f.priority}</span>
                </div>
                <p style={{ fontSize: '0.83rem', color: '#64748b', margin: 0 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">🛠️ Tech Stack</div>
          {Object.entries(project.techStack || {}).map(([category, items]) =>
            items?.length > 0 && (
              <div key={category} style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{category}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {items.map((item) => <span key={item} className="tag" style={{ fontSize: '0.8rem' }}>{item}</span>)}
                </div>
              </div>
            )
          )}
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
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: '#6366f1' }}>📂 {f}</div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Files</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {project.githubStructure?.files?.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: '#475569' }}>📄 {f}</div>
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
            <button className="btn btn-secondary btn-sm" onClick={copyCode}>{copied ? '✅ Copied!' : '📋 Copy'}</button>
          </div>
          <pre style={{ margin: 0, padding: '20px', overflow: 'auto', background: '#1e293b', color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', lineHeight: '1.7', maxHeight: '420px' }}>
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
