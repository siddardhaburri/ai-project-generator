import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Auth pages (public)
import Login from './pages/Login';
import Signup from './pages/Signup';
import OAuthCallback from './pages/OAuthCallback';

// App pages (protected)
import Home from './pages/Home';
import History from './pages/History';
import Gallery from './pages/Gallery';
import ProjectDetail from './pages/ProjectDetail';
import SharedProject from './pages/SharedProject';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.9rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* ── Public auth routes (no Navbar) ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth/:provider" element={<OAuthCallback />} />

          {/* ── Shared project link (public, with Navbar) ── */}
          <Route path="/share/:slug" element={
            <>
              <Navbar />
              <main style={{ minHeight: 'calc(100vh - 64px)', paddingTop: '64px' }}>
                <SharedProject />
              </main>
            </>
          } />

          {/* ── Protected routes (require login) ── */}
          <Route path="/*" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main style={{ minHeight: 'calc(100vh - 64px)', paddingTop: '64px' }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/project/:id" element={<ProjectDetail />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
