import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #e2e8f0',
    height: '64px',
    display: 'flex', alignItems: 'center',
    padding: '0 24px',
  };

  const innerStyle = {
    maxWidth: '1200px', margin: '0 auto', width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  };

  const logoStyle = {
    display: 'flex', alignItems: 'center', gap: '10px',
    textDecoration: 'none',
  };

  const logoIconStyle = {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px',
  };

  const logoTextStyle = {
    fontWeight: '800', fontSize: '1.1rem', color: '#0f172a',
  };

  const navLinksStyle = {
    display: 'flex', alignItems: 'center', gap: '8px',
  };

  const linkStyle = (active) => ({
    padding: '7px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: active ? '#6366f1' : '#64748b',
    background: active ? '#e0e7ff' : 'transparent',
    transition: 'all 0.2s',
  });

  return (
    <nav style={navStyle}>
      <div style={innerStyle}>
        <Link to="/" style={logoStyle}>
          <div style={logoIconStyle}>⚡</div>
          <span style={logoTextStyle}>ProjectAI</span>
        </Link>
        <div style={navLinksStyle}>
          <Link to="/" style={linkStyle(location.pathname === '/')}>🏠 Generate</Link>
          <Link to="/history" style={linkStyle(location.pathname === '/history')}>📚 History</Link>
        </div>
      </div>
    </nav>
  );
}
