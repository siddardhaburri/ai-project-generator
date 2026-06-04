import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// ─── OAuth helpers ────────────────────────────────────────────────────────────

function getGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    redirect_uri: `${window.location.origin}/oauth/google`,
    response_type: 'token',
    scope: 'openid email profile',
    prompt: 'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

function getGitHubAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.REACT_APP_GITHUB_CLIENT_ID || '',
    redirect_uri: `${window.location.origin}/oauth/github`,
    scope: 'user:email',
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

function getLinkedInAuthUrl() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.REACT_APP_LINKEDIN_CLIENT_ID || '',
    redirect_uri: `${window.location.origin}/oauth/linkedin`,
    scope: 'openid profile email',
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle = {
  width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0',
  borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'Outfit, sans-serif',
  color: '#0f172a', background: '#fff', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle = {
  display: 'block', fontSize: '0.82rem', fontWeight: '700',
  color: '#475569', marginBottom: '6px', fontFamily: 'Outfit, sans-serif',
};

// ─── Social Button ────────────────────────────────────────────────────────────

function SocialBtn({ icon, label, onClick, loading, color }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        width: '100%', padding: '11px 16px',
        background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px',
        fontSize: '0.88rem', fontWeight: '600', color: '#0f172a', cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 0 3px ${color}22`; } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {icon}
      <span>Continue with {label}</span>
    </button>
  );
}

// ─── Left panel decorations ───────────────────────────────────────────────────

function LeftPanel() {
  const features = [
    { icon: '⚡', text: 'Generate complete project blueprints in seconds' },
    { icon: '🗺️', text: 'Step-by-step roadmaps with milestones & tasks' },
    { icon: '🐙', text: 'One-click GitHub repo creation with starter code' },
    { icon: '🤖', text: 'AI Mentor Mode for guidance during development' },
    { icon: '📄', text: 'Auto-generate resume bullets after completion' },
  ];
  return (
    <div style={{
      flex: 1, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)',
      padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', top: '40%', left: '-30px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
        <div
  style={{
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    overflow: "hidden"
  }}
>
  <img
    src="/favicon.jpeg"
    alt="Logo"
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }}
  />
</div>
        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.3rem', color: '#fff' }}>ProjectGen AI</span>
      </div>

      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#fff', lineHeight: '1.2', marginBottom: '16px' }}>
        Build better projects,<br />faster than ever.
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '40px', maxWidth: '380px' }}>
        AI-powered project ideas with full roadmaps, tech stacks, code scaffolding, and career-ready resume bullets.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', animation: `fadeInUp 0.4s ease ${i * 0.08}s both` }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{f.icon}</div>
            <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', fontWeight: '500' }}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* Testimonial */}
      <div style={{ marginTop: '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.88rem', fontStyle: 'italic', lineHeight: '1.6', marginBottom: '12px', fontFamily: 'Outfit, sans-serif' }}>
          "ProjectGen AI helped me build 3 portfolio projects in a month. The roadmaps are incredibly detailed!"
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>R</div>
          <div>
            <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.82rem', fontFamily: 'Outfit, sans-serif' }}>Rahul Verma</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>CS Student, IIT Delhi</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Already logged in? redirect
  useEffect(() => { if (user) navigate(from, { replace: true }); }, [user, navigate, from]);

  // Handle OAuth callback tokens in URL (for implicit flow / redirect handling)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const accessToken = params.get('access_token');
      if (accessToken) handleGoogleToken(accessToken);
    }
  }, []);

  const handleGoogleToken = async (accessToken) => {
    setOauthLoading('google');
    try {
      const res = await api.post('/auth/google', { accessToken });
      login(res.data.token, res.data.user);
      toast.success(`Welcome, ${res.data.user.name}! 🎉`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally { setOauthLoading(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}! 👋`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const handleGitHub = () => {
    setOauthLoading('github');
    window.location.href = getGitHubAuthUrl();
  };

  const handleLinkedIn = () => {
    setOauthLoading('linkedin');
    window.location.href = getLinkedInAuthUrl();
  };

  const handleGoogle = () => {
    setOauthLoading('google');
    console.log("GOOGLE CLIENT ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log("URL:", getGoogleAuthUrl());
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Outfit, sans-serif' }}>
      {/* Left panel - hidden on mobile */}
      <div style={{ display: 'none', '@media(min-width:900px)': { display: 'block' } }} className="auth-left-panel">
        <LeftPanel />
      </div>

      {/* Right panel - form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', background: '#f8fafc', minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeInUp 0.4s ease' }}>
          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }} className="mobile-logo">
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✨</div>
              <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#0f172a' }}>ProjectGen <span style={{ color: '#6366f1' }}>AI</span></span>
            </Link>
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px', textAlign: 'center' }}>Welcome back</h1>
          <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '32px', fontSize: '0.95rem' }}>
            Sign in to continue building amazing projects
          </p>

          {/* Social Login Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            <SocialBtn
              icon={<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
              label="Google"
              onClick={handleGoogle}
              loading={oauthLoading === 'google'}
              color="#4285F4"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <SocialBtn
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="#333"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>}
                label="GitHub"
                onClick={handleGitHub}
                loading={oauthLoading === 'github'}
                color="#333"
              />
              <SocialBtn
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>}
                label="LinkedIn"
                onClick={handleLinkedIn}
                loading={oauthLoading === 'linkedin'}
                color="#0A66C2"
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', whiteSpace: 'nowrap' }}>or sign in with email</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ ...labelStyle, margin: 0 }}>Password</label>
                <button type="button" style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password" required
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.1rem', padding: '0' }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontWeight: '700', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
                transition: 'all 0.2s',
              }}>
              {loading ? (
                <><span style={{ width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Signing in…</>
              ) : '→ Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#6366f1', fontWeight: '700', textDecoration: 'none' }}>
              Create one free →
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 900px) {
          .auth-left-panel { display: flex !important; min-width: 440px; max-width: 480px; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
