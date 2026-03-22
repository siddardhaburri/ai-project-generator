import React from 'react';
import { Link, useLocation } from 'react-router-dom';


export default function Navbar() {
  const location = useLocation();

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(10, 10, 15, 0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    height: '64px',
    display: 'flex', alignItems: 'center',
    padding: '0 24px',
  };

  const innerStyle = {
    width: '100%',
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
    boxShadow: '0 2px 12px rgba(99,102,241,0.3)',
  };

  const logoTextStyle = {
    fontWeight: '800', fontSize: '1.1rem', color: '#f0f0f5',
  };

  const navLinksStyle = {
    display: 'flex', alignItems: 'center', gap: '4px',
  };

  const linkStyle = (active) => ({
    padding: '8px 16px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: active ? '#a5b4fc' : '#9294a0',
    background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
    transition: 'all 0.2s',
  });

  return (
    <nav style={navStyle}>
      <div style={innerStyle}>
        <Link to="/" style={logoStyle}>
          <span style={logoTextStyle}>ProjectAI</span>
        </Link>
        <div style={navLinksStyle}>
          <Link to="/" style={linkStyle(location.pathname === '/')}>
            Generate
          </Link>
          <Link to="/history" style={linkStyle(location.pathname === '/history')}>
            History
          </Link>
        </div>
      </div>
    </nav>
  );
}
