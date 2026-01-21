import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import LandingPage from './components/LandingPage';
import AppLayout from './components/AppLayout';
import FlashcardPage from './components/FlashcardPage';
import TemplatePage from './components/TemplatePage';
import ExportPage from './components/ExportPage';
import './index.css';

function AppContent() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.5rem',
        color: 'var(--color-text-secondary)',
        backgroundColor: 'var(--color-bg-primary)'
      }}>
        <div className="animate-pulse">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* App Routes */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="/app/flashcards" replace />} />
        <Route path="flashcards" element={<FlashcardPage />} />
        <Route path="templates" element={<TemplatePage />} />
        <Route path="export" element={<ExportPage />} />
      </Route>
      
      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
