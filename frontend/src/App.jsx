import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import History from './pages/History';
import ProjectDetail from './pages/ProjectDetail';

export default function App() {
  return (
    <Router>

      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 64px)', paddingTop: '64px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
        </Routes>
      </main>
    </Router>
  );
}
