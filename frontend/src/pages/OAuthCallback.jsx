import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

/**
 * OAuthCallback — handles redirect from OAuth providers.
 * Route: /oauth/:provider
 *
 * Google (implicit flow): access_token in URL hash
 * GitHub (auth code flow): code in URL query params
 * LinkedIn (auth code flow): code in URL query params
 */
export default function OAuthCallback() {
  const { provider } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('Processing…');
  const [error, setError] = useState('');

  useEffect(() => {
    handleCallback();
  }, [provider]);

  const handleCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));

      let res;

      if (provider === 'google') {
        const accessToken = hashParams.get('access_token');
        if (!accessToken) throw new Error('No access token from Google');
        setStatus('Verifying with Google…');
        res = await api.post('/auth/google', { accessToken });

      } else if (provider === 'github') {
        const code = urlParams.get('code');
        if (!code) throw new Error('No authorization code from GitHub');
        setStatus('Verifying with GitHub…');
        res = await api.post('/auth/github', { code });

      } else if (provider === 'linkedin') {
        const code = urlParams.get('code');
        if (!code) throw new Error('No authorization code from LinkedIn');
        setStatus('Verifying with LinkedIn…');
        res = await api.post('/auth/linkedin', {
          code,
          redirectUri: `${window.location.origin}/oauth/linkedin`,
        });

      } else {
        throw new Error('Unknown OAuth provider');
      }

      login(res.data.token, res.data.user);
      toast.success(`Welcome, ${res.data.user.name}! 🎉`);
      navigate('/', { replace: true });

    } catch (err) {
      console.error('OAuth callback error:', err);
      setError(err.message || 'Authentication failed');
      toast.error(err.message || 'OAuth login failed');
    }
  };

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', gap: '16px', padding: '24px', fontFamily: 'Outfit, sans-serif' }}>
        <div style={{ fontSize: '3rem' }}>❌</div>
        <h2 style={{ fontWeight: '800', color: '#0f172a' }}>Authentication Failed</h2>
        <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '400px' }}>{error}</p>
        <button onClick={() => navigate('/login')}
          style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
          ← Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', gap: '20px', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ width: '56px', height: '56px', border: '4px solid #e0e7ff', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.1rem', marginBottom: '6px' }}>{status}</p>
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Please wait, you'll be redirected shortly</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
