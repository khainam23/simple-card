import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../AppContext';
import { 
  Brain, 
  FilePlus, 
  LayoutTemplate, 
  Download, 
  Home,
  Search,
  Menu,
  X,
  Zap
} from 'lucide-react';
import Sidebar from './Sidebar';
import './MainApp.css';

const AppLayout = () => {
  const { currentFolder } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const tabs = [
    { id: 'flashcards', label: 'Flashcards', path: '/app/flashcards', icon: <FilePlus size={18} /> },
    { id: 'rsvp', label: 'RSVP Speed Reading', path: '/app/rsvp', icon: <Zap size={18} /> },
    { id: 'templates', label: 'Templates', path: '/app/templates', icon: <LayoutTemplate size={18} /> },
    { id: 'export', label: 'Export/Import', path: '/app/export', icon: <Download size={18} /> },
  ];

  const activeTab = tabs.find(tab => location.pathname.startsWith(tab.path))?.id || 'flashcards';

  return (
    <div className="main-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <button className="btn btn-ghost btn-icon mobile-only" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="app-logo" onClick={() => navigate('/')}>
            <Brain size={28} />
            <span>FlashCard App</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm flashcard..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="header-right">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            <Home size={18} />
            Trang chủ
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="app-content">
        {/* Sidebar */}
        <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
          <Sidebar />
        </div>

        {/* Main Area */}
        <main className="main-area">
          {/* Tabs Navigation */}
          <div className="tabs">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => navigate(tab.path)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            <Outlet context={{ searchQuery }} />
          </div>
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default AppLayout;
