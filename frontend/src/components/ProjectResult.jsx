import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import AIMentorChat from './AIMentorChat';

const PRIORITY_COLORS = {
  'Must Have': 'badge-danger',
  'Should Have': 'badge-warning',
  'Nice to Have': 'badge-success',
};

// ─── File structure helpers (unchanged from original) ────────────────────────
function inferFolder(filename, folders) {
  const name = filename.toLowerCase();
  const ext = name.split('.').pop();
  const rules = [
    { match: (n, e) => ['jsx','tsx','vue'].includes(e) || n.includes('component'), folder: 'src/components' },
    { match: (n, e) => ['js','ts'].includes(e) && (n.includes('util') || n.includes('helper')), folder: 'src/utils' },
    { match: (n, e) => ['js','ts'].includes(e) && n.includes('hook'), folder: 'src/hooks' },
    { match: (n, e) => ['js','ts'].includes(e) && (n.includes('service') || n.includes('api')), folder: 'src/services' },
    { match: (n, e) => ['js','ts','jsx','tsx'].includes(e) && (n.includes('page') || n.includes('view')), folder: 'src/pages' },
    { match: (n, e) => ['css','scss','sass','less'].includes(e), folder: 'src/styles' },
    { match: (n, e) => ['png','jpg','jpeg','svg','gif'].includes(e), folder: 'public/assets' },
    { match: (n, e) => ['js','ts'].includes(e) && (n.includes('route') || n.includes('router')), folder: 'src/routes' },
    { match: (n, e) => ['js','ts'].includes(e) && (n.includes('model') || n.includes('schema')), folder: 'src/models' },
    { match: (n, e) => ['env','example'].includes(e) || n.startsWith('.env'), folder: null },
    { match: (n, e) => ['js','ts'].includes(e), folder: 'src' },
  ];
  for (const rule of rules) {
    if (rule.match(name, ext)) {
      if (rule.folder === null) return null;
      const best = folders.find(f => rule.folder.startsWith(f)) ? rule.folder : (folders.includes('src') ? 'src' : null);
      return best;
    }
  }
  return null;
}

function buildFileMap(project) {
  const files = {};
  const title = project.projectIdea?.title || 'project';
  const desc = project.projectIdea?.description || '';
  const folders = project.githubStructure?.folders || [];
  const fileNames = project.githubStructure?.files || [];
  const readme = project.githubStructure?.readme || `# ${title}\n\n${desc}`;
  const sampleCode = project.sampleCode?.code || '';
  const sampleFile = project.sampleCode?.filename || 'main.js';
  const language = (project.sampleCode?.language || 'javascript').toLowerCase();

  files['README.md'] = readme;
  files['.gitignore'] = `node_modules/\n.env\n.DS_Store\ndist/\nbuild/\n*.log\n`;
  files['.env.example'] = `PORT=3000\nNODE_ENV=development\n`;

  if (sampleCode) {
    const folder = inferFolder(sampleFile, folders);
    files[folder ? `${folder}/${sampleFile}` : sampleFile] = sampleCode;
  }

  fileNames.forEach(f => {
    if (files[f]) return;
    const folder = inferFolder(f, folders);
    const path = folder ? `${folder}/${f}` : f;
    if (!files[path]) files[path] = `// ${f}\n`;
  });

  return files;
}

async function downloadZip(project) {
  if (!window.JSZip) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  const zip = new window.JSZip();
  const title = (project.projectIdea?.title || 'project').replace(/\s+/g, '-').toLowerCase();
  const root = zip.folder(title);
  Object.entries(buildFileMap(project)).forEach(([path, content]) => root.file(path, content));
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${title}.zip`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ─── Export as Markdown ───────────────────────────────────────────────────────
function exportMarkdown(project) {
  const p = project.projectIdea || {};
  const stack = Object.entries(project.techStack || {}).map(([k, v]) => v?.length ? `**${k}:** ${v.join(', ')}` : '').filter(Boolean).join(' | ');
  const features = (project.features || []).map(f => `- **${f.name}** (${f.priority}): ${f.description}`).join('\n');
  const roadmap = (project.roadmap || []).map(m =>
    `### Milestone ${m.order}: ${m.title}\n${m.description}\n\n${(m.tasks || []).map(t => `- [ ] ${t}`).join('\n')}`
  ).join('\n\n');
  const resume = (project.resumeBullets || []).map(b => `- ${b}`).join('\n');

  const md = `# ${p.title}\n\n> ${p.description}\n\n**Difficulty:** ${p.difficulty} | **Time:** ${p.estimatedTime} | **Team:** ${p.teamSize || 1}\n\n## Tech Stack\n${stack}\n\n## Features\n${features}\n\n## Roadmap\n${roadmap}\n\n## Sample Code\n\`\`\`${project.sampleCode?.language || 'js'}\n${project.sampleCode?.code || ''}\n\`\`\`\n\n## Resume Bullets\n${resume}\n`;

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `${(p.title || 'project').replace(/\s+/g, '-').toLowerCase()}.md`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ─── Export as PDF ────────────────────────────────────────────────────────────
function exportPDF(project) {
  const p = project.projectIdea || {};
  const printContent = `
    <html><head><title>${p.title}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;color:#0f172a;max-width:800px;margin:0 auto}
    h1{color:#6366f1}h2{color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px}
    .badge{background:#e0e7ff;color:#4f46e5;padding:3px 10px;border-radius:20px;font-size:0.8em;margin-right:6px}
    .feature{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:8px 0}
    .task{margin:4px 0;padding-left:20px}pre{background:#1e293b;color:#e2e8f0;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:0.8em}
    </style></head><body>
    <h1>${p.title}</h1>
    <p>${p.description}</p>
    <span class="badge">${p.difficulty}</span><span class="badge">⏱ ${p.estimatedTime}</span>
    <h2>Features</h2>${(project.features||[]).map(f=>`<div class="feature"><strong>${f.name}</strong> (${f.priority})<br/><small>${f.description}</small></div>`).join('')}
    <h2>Tech Stack</h2><p>${Object.entries(project.techStack||{}).map(([k,v])=>`<strong>${k}:</strong> ${(v||[]).join(', ')}`).join(' | ')}</p>
    <h2>Roadmap</h2>${(project.roadmap||[]).map(m=>`<h3>Milestone ${m.order}: ${m.title}</h3><p>${m.description}</p>${(m.tasks||[]).map(t=>`<div class="task">☐ ${t}</div>`).join('')}`).join('')}
    ${project.sampleCode?.code?`<h2>Sample Code</h2><pre>${project.sampleCode.code.replace(/</g,'&lt;')}</pre>`:''}
    ${(project.resumeBullets||[]).length?`<h2>Resume Bullets</h2><ul>${project.resumeBullets.map(b=>`<li>${b}</li>`).join('')}</ul>`:''}
    </body></html>`;
  const w = window.open('', '_blank');
  w.document.write(printContent);
  w.document.close();
  w.print();
}

// ─── GitHub Push Modal ────────────────────────────────────────────────────────
function GitHubModal({ project, onClose }) {
  const [token, setToken] = useState('');
  const [repoName, setRepoName] = useState((project.projectIdea?.title || 'my-project').replace(/\s+/g, '-').toLowerCase());
  const [isPrivate, setIsPrivate] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const pushToGitHub = async () => {
    if (!token.trim()) { toast.error('Please enter your GitHub token'); return; }
    setPushing(true);
    try {
      const userRes = await fetch('https://api.github.com/user', { headers: { Authorization: `token ${token}` } });
      if (!userRes.ok) throw new Error('Invalid GitHub token.');
      const user = await userRes.json();
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: repoName, description: project.projectIdea?.description || '', private: isPrivate, auto_init: false }),
      });
      if (!createRes.ok) { const e = await createRes.json(); throw new Error(e.message); }
      const repo = await createRes.json();
      const fileMap = buildFileMap(project);
      const entries = Object.entries(fileMap);
      setProgress({ done: 0, total: entries.length });
      for (const [idx, [path, content]] of entries.entries()) {
        const encoded = btoa(unescape(encodeURIComponent(content)));
        await fetch(`https://api.github.com/repos/${user.login}/${repoName}/contents/${path}`, {
          method: 'PUT',
          headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `Add ${path}`, content: encoded }),
        });
        setProgress({ done: idx + 1, total: entries.length });
      }
      setRepoUrl(repo.html_url);
      toast.success('Pushed to GitHub!');
    } catch (err) {
      toast.error(err.message || 'Failed to push to GitHub');
    } finally { setPushing(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div><h3 style={{ margin: 0, fontWeight: '800' }}>🐙 Push to GitHub</h3><p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: '#94a3b8' }}>Create a repo and push all files</p></div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>
        {repoUrl ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
            <a href={repoUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: '#0f172a', color: '#fff', padding: '10px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700' }}>🔗 View on GitHub</a>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>GitHub Token *</label>
              <input type="password" placeholder="ghp_xxxx" value={token} onChange={e => setToken(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', boxSizing: 'border-box', fontFamily: 'monospace' }} />
              <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>🔒 Never stored. <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>Create token</a></p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Repo Name *</label>
              <input type="text" value={repoName} onChange={e => setRepoName(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', cursor: 'pointer', fontSize: '0.87rem', color: '#475569', fontWeight: '600' }}>
              <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} /> 🔒 Private repo
            </label>
            {pushing && progress.total > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '6px' }}><span>Pushing files…</span><span>{progress.done}/{progress.total}</span></div>
                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(progress.done / progress.total) * 100}%`, background: '#6366f1', borderRadius: '99px', transition: 'width 0.3s' }} />
                </div>
              </div>
            )}
            <button onClick={pushToGitHub} disabled={pushing}
              style={{ width: '100%', padding: '13px', background: pushing ? '#94a3b8' : '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: pushing ? 'not-allowed' : 'pointer' }}>
              {pushing ? '⏳ Pushing…' : '🚀 Create Repo & Push'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Roadmap Component ────────────────────────────────────────────────────────
function RoadmapView({ roadmap, projectId, onRefresh }) {
  const [regenerating, setRegenerating] = useState(false);

  const regenerate = async () => {
    setRegenerating(true);
    try {
      const res = await api.post('/generate/regenerate-card', { projectId, section: 'roadmap' });
      onRefresh(res.data.data);
      toast.success('Roadmap regenerated!');
    } catch { toast.error('Failed to regenerate'); }
    finally { setRegenerating(false); }
  };

  if (!roadmap?.length) return null;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="section-title" style={{ margin: 0 }}>🗺️ Step-by-Step Roadmap</div>
        <button onClick={regenerate} disabled={regenerating} className="btn btn-secondary btn-sm">
          {regenerating ? '⏳' : '🔄'} Regenerate
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {roadmap.map((milestone, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '0.9rem', flexShrink: 0 }}>{milestone.order}</div>
              {idx < roadmap.length - 1 && <div style={{ width: '2px', flex: 1, background: '#e2e8f0', marginTop: '8px', minHeight: '20px' }} />}
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', flex: 1, marginBottom: idx < roadmap.length - 1 ? '0' : '0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{milestone.title}</div>
                <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  ~{milestone.estimatedDays}d
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 10px' }}>{milestone.description}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(milestone.tasks || []).map((task, ti) => (
                  <div key={ti} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.83rem', color: '#475569' }}>
                    <span style={{ color: '#6366f1', flexShrink: 0 }}>◦</span> {task}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Resume Bullets Component ─────────────────────────────────────────────────
function ResumeBulletsView({ bullets, projectId, onRefresh }) {
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/generate/resume-bullets', { projectId });
      onRefresh({ resumeBullets: res.data.bullets });
      toast.success('Resume bullets generated!');
    } catch { toast.error('Failed to generate'); }
    finally { setGenerating(false); }
  };

  const copyAll = () => {
    navigator.clipboard.writeText((bullets || []).map(b => `• ${b}`).join('\n'));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  if (!bullets?.length) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📄</div>
        <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Resume Bullet Generator</div>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>Generate powerful resume bullets after completing this project</p>
        <button onClick={generate} disabled={generating} className="btn btn-primary">
          {generating ? '⏳ Generating…' : '✨ Generate Resume Bullets'}
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="section-title" style={{ margin: 0 }}>📄 Resume Bullets</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={copyAll} className="btn btn-secondary btn-sm">{copied ? '✅ Copied!' : '📋 Copy All'}</button>
          <button onClick={generate} disabled={generating} className="btn btn-secondary btn-sm">{generating ? '⏳' : '🔄'} Refresh</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {bullets.map((bullet, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
            <span style={{ color: '#6366f1', fontWeight: '800', fontSize: '1.1rem', flexShrink: 0 }}>•</span>
            <span style={{ fontSize: '0.88rem', color: '#0f172a', lineHeight: '1.6' }}>{bullet}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Starter Code Modal ───────────────────────────────────────────────────────
function StarterCodeModal({ project, onClose }) {
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/generate/starter-code', { projectId: project._id });
      setFiles(res.data.files);
    } catch { toast.error('Failed to generate starter code'); }
    finally { setLoading(false); }
  };

  const copyFile = () => {
    navigator.clipboard.writeText(files[activeFile]?.code || '');
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast.success('Copied!');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '860px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.2rem' }}>🚀 Starter Code Generator</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: '#94a3b8' }}>AI-generated boilerplate for your project</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {!files && !loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚡</div>
              <p style={{ color: '#64748b', marginBottom: '20px' }}>Generate complete boilerplate code based on your tech stack</p>
              <button onClick={generate} className="btn btn-primary btn-lg">✨ Generate Boilerplate Code</button>
            </div>
          )}
          {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#6366f1', fontWeight: '600' }}><div style={{ fontSize: '2rem', marginBottom: '12px', animation: 'float 2s infinite' }}>🤖</div>AI is writing your boilerplate...</div>}
          {files && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {files.map((f, i) => (
                  <button key={i} onClick={() => setActiveFile(i)}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: '1.5px solid', borderColor: activeFile === i ? '#6366f1' : '#e2e8f0', background: activeFile === i ? '#e0e7ff' : '#f8fafc', color: activeFile === i ? '#4f46e5' : '#475569', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'monospace' }}>
                    {f.filename}
                  </button>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 1 }}>
                  <button onClick={copyFile} className="btn btn-secondary btn-sm">{copied ? '✅' : '📋'}</button>
                </div>
                <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: '20px', borderRadius: '12px', overflow: 'auto', fontSize: '0.83rem', lineHeight: '1.7', maxHeight: '400px', fontFamily: 'JetBrains Mono, monospace' }}>
                  <code>{files[activeFile]?.code}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Folder Tree ──────────────────────────────────────────────────────────────
function FolderTree({ filePaths }) {
  const tree = {};
  filePaths.forEach(p => {
    const parts = p.split('/');
    let node = tree;
    parts.forEach((part, i) => { if (i === parts.length - 1) node[part] = null; else { node[part] = node[part] || {}; node = node[part]; } });
  });
  return (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', maxHeight: '320px', overflow: 'auto' }}>
      <TreeNode name="(root)" node={tree} depth={0} defaultOpen />
    </div>
  );
}

function TreeNode({ name, node, depth, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const isFolder = node !== null && typeof node === 'object';
  if (!isFolder) return <div style={{ paddingLeft: `${depth * 16}px`, display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', padding: `2px 0 2px ${depth * 16}px` }}><span style={{ opacity: 0.5 }}>📄</span>{name}</div>;
  const children = Object.entries(node).sort(([a, av], [b, bv]) => {
    const af = av !== null && typeof av === 'object'; const bf = bv !== null && typeof bv === 'object';
    if (af && !bf) return -1; if (!af && bf) return 1; return a.localeCompare(b);
  });
  return (
    <div>
      {depth > 0 && <div onClick={() => setOpen(o => !o)} style={{ paddingLeft: `${(depth - 1) * 16}px`, display: 'flex', alignItems: 'center', gap: '6px', color: '#6366f1', fontWeight: '700', cursor: 'pointer', padding: `2px 0 2px ${(depth - 1) * 16}px`, userSelect: 'none' }}><span>{open ? '📂' : '📁'}</span>{name}<span style={{ opacity: 0.4, fontSize: '0.7rem', fontWeight: '400' }}>{open ? '▾' : '▸'}</span></div>}
      {(open || depth === 0) && children.map(([childName, childNode]) => <TreeNode key={childName} name={childName} node={childNode} depth={depth + 1} />)}
    </div>
  );
}

// ─── Main ProjectResult ───────────────────────────────────────────────────────
export default function ProjectResult({ project: initialProject, onRegenerate }) {
  const [project, setProject] = useState(initialProject);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(initialProject.liked);
  const [saved, setSaved] = useState(initialProject.saved);
  const [zipping, setZipping] = useState(false);
  const [showGitHub, setShowGitHub] = useState(false);
  const [showStarterCode, setShowStarterCode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState(null);

  const updateProject = (partial) => setProject(prev => ({ ...prev, ...partial }));

  const copyCode = () => {
    navigator.clipboard.writeText(project.sampleCode?.code || '');
    setCopied(true); toast.success('Code copied!'); setTimeout(() => setCopied(false), 2000);
  };

  const toggleLike = async () => {
    try { const res = await api.patch(`/projects/${project._id}/like`); setLiked(res.data.liked); toast.success(res.data.liked ? '❤️ Liked!' : 'Unliked'); } catch { toast.error('Failed'); }
  };

  const toggleSave = async () => {
    try { const res = await api.patch(`/projects/${project._id}/save`); setSaved(res.data.saved); toast.success(res.data.saved ? '🔖 Saved!' : 'Removed'); } catch { toast.error('Failed'); }
  };

  const handleDownloadZip = async () => {
    setZipping(true);
    try { await downloadZip(project); toast.success('📦 ZIP downloaded!'); } catch { toast.error('Failed'); } finally { setZipping(false); }
  };

  const shareLink = () => {
    if (project.shareSlug) {
      const url = `${window.location.origin}/share/${project.shareSlug}`;
      navigator.clipboard.writeText(url);
      toast.success('🔗 Share link copied!');
    }
  };

  const regenerateSection = async (section) => {
    setRegeneratingSection(section);
    try {
      const res = await api.post('/generate/regenerate-card', { projectId: project._id, section });
      setProject(res.data.data);
      toast.success(`${section} regenerated!`);
    } catch { toast.error('Failed to regenerate'); }
    finally { setRegeneratingSection(null); }
  };

  const filePaths = Object.keys(buildFileMap(project)).sort();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {showGitHub && <GitHubModal project={project} onClose={() => setShowGitHub(false)} />}
      {showStarterCode && <StarterCodeModal project={project} onClose={() => setShowStarterCode(false)} />}

      {/* Header Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>{project.projectIdea?.difficulty}</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>⏱️ {project.projectIdea?.estimatedTime}</span>
              {project.projectIdea?.teamSize > 1 && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>👥 Team of {project.projectIdea?.teamSize}</span>}
              {project.projectIdea?.domain && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>🏷️ {project.projectIdea?.domain}</span>}
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px', lineHeight: '1.2', fontFamily: 'Outfit, sans-serif' }}>{project.projectIdea?.title}</h2>
            <p style={{ opacity: '0.9', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px' }}>{project.projectIdea?.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={toggleLike} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', fontSize: '1.2rem' }}>{liked ? '❤️' : '🤍'}</button>
            <button onClick={toggleSave} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', fontSize: '1.2rem' }}>{saved ? '🔖' : '📌'}</button>
            <button onClick={shareLink} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', fontSize: '1.2rem' }} title="Copy share link">🔗</button>
          </div>
        </div>

        {project.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            {project.tags.map(tag => <span key={tag} style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' }}>#{tag}</span>)}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button onClick={handleDownloadZip} disabled={zipping}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', color: '#6366f1', border: 'none', borderRadius: '12px', padding: '10px 18px', fontWeight: '700', fontSize: '0.88rem', cursor: zipping ? 'not-allowed' : 'pointer', opacity: zipping ? 0.7 : 1 }}>
            {zipping ? '⏳ Creating…' : '📦 Download ZIP'}
          </button>
          <button onClick={() => setShowGitHub(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 18px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}>
            🐙 Push to GitHub
          </button>
          <button onClick={() => exportMarkdown(project)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', padding: '10px 18px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}>
            📝 Export MD
          </button>
          <button onClick={() => exportPDF(project)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', padding: '10px 18px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}>
            📄 Export PDF
          </button>
          <button onClick={() => setShowStarterCode(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', padding: '10px 18px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}>
            🚀 Starter Code
          </button>
          <button onClick={() => setShowChat(c => !c)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: showChat ? '#fff' : 'rgba(255,255,255,0.15)', color: showChat ? '#6366f1' : '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', padding: '10px 18px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}>
            🤖 AI Mentor
          </button>
        </div>
      </div>

      {/* AI Mentor Chat */}
      {showChat && (
        <AIMentorChat
          projectContext={{ title: project.projectIdea?.title, difficulty: project.projectIdea?.difficulty, techStack: project.techStack }}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Features & Tech Stack */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="section-title" style={{ margin: 0 }}>🎯 Features</div>
            <button onClick={() => regenerateSection('features')} disabled={regeneratingSection === 'features'} className="btn btn-secondary btn-sm">
              {regeneratingSection === 'features' ? '⏳' : '🔄'}
            </button>
          </div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="section-title" style={{ margin: 0 }}>🛠️ Tech Stack</div>
            <button onClick={() => regenerateSection('techStack')} disabled={regeneratingSection === 'techStack'} className="btn btn-secondary btn-sm">
              {regeneratingSection === 'techStack' ? '⏳' : '🔄'}
            </button>
          </div>
          {Object.entries(project.techStack || {}).map(([category, items]) =>
            items?.length > 0 && (
              <div key={category} style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{category}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>{items.map(item => <span key={item} className="tag" style={{ fontSize: '0.8rem' }}>{item}</span>)}</div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Roadmap */}
      <RoadmapView roadmap={project.roadmap} projectId={project._id} onRefresh={setProject} />

      {/* File Structure */}
      <div className="card">
        <div className="section-title">📁 Project File Structure</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Folder Tree</div>
            <FolderTree filePaths={filePaths} />
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

      {/* Resume Bullets */}
      <ResumeBulletsView bullets={project.resumeBullets} projectId={project._id} onRefresh={updateProject} />
    </div>
  );
}