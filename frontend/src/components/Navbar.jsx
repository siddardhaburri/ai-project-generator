import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: '⚡ Generate' },
    { to: '/history', label: '📚 History' },
    { to: '/gallery', label: '🏆 Gallery' },
  ];

  // Get initials for avatar fallback
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '64px',
      background: scrolled ? 'rgba(255,255,255,0.96)' : '#fff',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.07)' : 'none',
      transition: 'all 0.3s ease',
      display: 'flex', alignItems: 'center', padding: '0 24px',
    }}>
      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✨</div>
          <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
            ProjectGen <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {/* Nav links — only show when logged in */}
          {user && navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding: '6px 14px', borderRadius: '10px', textDecoration: 'none',
              fontSize: '0.88rem', fontWeight: '600', fontFamily: 'Outfit, sans-serif',
              color: location.pathname === to ? '#6366f1' : '#475569',
              background: location.pathname === to ? '#e0e7ff' : 'transparent',
              transition: 'all 0.2s',
            }}>
              {label}
            </Link>
          ))}

          {/* Auth section */}
          {user ? (
            /* User avatar + dropdown */
            <div ref={dropdownRef} style={{ position: 'relative', marginLeft: '8px' }}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px',
                  padding: '6px 12px 6px 6px', cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: 'Outfit, sans-serif',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#f0f0ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
              >
                {/* Avatar */}
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.75rem', flexShrink: 0 }}>
                    {initials}
                  </div>
                )}
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.7rem', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.12)', minWidth: '220px',
                  zIndex: 200, animation: 'fadeInUp 0.15s ease', overflow: 'hidden',
                }}>
                  {/* User info */}
                  <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.9rem', flexShrink: 0 }}>
                          {initials}
                        </div>
                      )}
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a', fontFamily: 'Outfit, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                      </div>
                    </div>
                    {user.provider !== 'local' && (
                      <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>
                        {user.provider === 'google' && '🔑'} {user.provider === 'github' && '🐙'} {user.provider === 'linkedin' && '💼'}
                        Signed in via {user.provider}
                      </div>
                    )}
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: '6px' }}>
                    {[
                      { icon: '⚡', label: 'Generate Project', to: '/' },
                      { icon: '📚', label: 'My History', to: '/history' },
                      { icon: '🏆', label: 'Gallery', to: '/gallery' },
                    ].map(item => (
                      <Link key={item.to} to={item.to} onClick={() => setDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: '#0f172a', fontSize: '0.88rem', fontWeight: '500', fontFamily: 'Outfit, sans-serif', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span>{item.icon}</span> {item.label}
                      </Link>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '6px' }}>
                    <button onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'none', border: 'none', color: '#ef4444', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      🚪 Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Guest buttons */
            <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
              <Link to="/login" style={{
                padding: '7px 16px', borderRadius: '10px', textDecoration: 'none',
                fontSize: '0.88rem', fontWeight: '600', color: '#475569',
                border: '1.5px solid #e2e8f0', background: '#fff',
                fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}>
                Sign in
              </Link>
              <Link to="/signup" style={{
                padding: '7px 16px', borderRadius: '10px', textDecoration: 'none',
                fontSize: '0.88rem', fontWeight: '700', color: '#fff',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s',
                boxShadow: '0 2px 10px rgba(99,102,241,0.3)',
              }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
