import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import MethodologyPage from './pages/MethodologyPage';
import ContactPage from './pages/ContactPage';

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Top Header Navigation Bar */}
      <Header />

      {/* Main View Router */}
      <main style={{ flex: 1, position: 'relative', width: '100%', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<Dashboard />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
