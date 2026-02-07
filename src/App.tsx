import { BrowserRouter as Router, NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Bookmark, Settings as SettingsIcon, Home, StickyNote, Menu, Maximize2, Search } from 'lucide-react';
import Reader from './components/Reader';
import Settings from './components/Settings';
import Bookmarks from './components/Bookmarks';
import Notes from './components/Notes';
import GlobalSearch from './components/GlobalSearch';
import FullscreenReader from './components/FullscreenReader';
import Download from './components/Download';
import { AppProvider, useAppContext } from './context/AppContext';
import './index.css';

const AppContent: React.FC = () => {
  const { t, setShowDrawer, setIsFullscreenReader } = useAppContext();
  const location = useLocation();
  const activePath = location.pathname;
  const isReaderPage = activePath === '/';

  return (
    <div className="app-container">
      <header className="header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '4px',
        padding: '0 16px'
      }}>
        {isReaderPage && (
          <button
            onClick={() => setShowDrawer(true)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-color)',
              cursor: 'pointer',
              opacity: 0.8
            }}
          >
            <Menu size={24} strokeWidth={2.5} />
          </button>
        )}
        <div className="logo" style={{
          fontSize: '1.2rem',
          fontWeight: 800,
          color: 'var(--text-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: isReaderPage ? 0 : '8px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px -2px rgba(var(--primary-rgb), 0.3)'
          }}>
            <BookOpen size={18} strokeWidth={2.5} />
          </div>
          <span style={{
            background: 'linear-gradient(135deg, var(--text-color) 0%, var(--primary-color) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {t('app.title')}
          </span>
        </div>
        <div style={{ flex: 1 }} />
        {isReaderPage && (
          <button
            onClick={() => setIsFullscreenReader(true)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-color)',
              cursor: 'pointer',
              opacity: 0.8
            }}
          >
            <Maximize2 size={24} />
          </button>
        )}
      </header>

      <main className="content">
        {/* Keep all tabs alive to preserve state and scroll position */}
        <div className="tab-container" style={{ display: activePath === '/' ? 'block' : 'none' }}>
          <Reader />
        </div>
        <div className="tab-container" style={{ display: activePath === '/bookmarks' ? 'block' : 'none' }}>
          <Bookmarks />
        </div>
        <div className="tab-container" style={{ display: activePath === '/notes' ? 'block' : 'none' }}>
          <Notes />
        </div>
        <div className="tab-container" style={{ display: activePath === '/search' ? 'block' : 'none' }}>
          <GlobalSearch />
        </div>
        <div className="tab-container" style={{ display: activePath === '/settings' ? 'block' : 'none' }}>
          <Settings />
        </div>
        <div className="tab-container" style={{ display: activePath === '/download' ? 'block' : 'none' }}>
          <Download />
        </div>
      </main>

      <FullscreenReader />

      <nav className="nav-bar">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={24} />
          <span>{t('app.nav.read')}</span>
        </NavLink>
        <NavLink to="/bookmarks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Bookmark size={24} />
          <span>{t('app.nav.bookmarks')}</span>
        </NavLink>
        <NavLink to="/notes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <StickyNote size={24} />
          <span>{t('app.nav.notes')}</span>
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Search size={24} />
          <span>{t('app.nav.search')}</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <SettingsIcon size={24} />
          <span>{t('app.nav.settings')}</span>
        </NavLink>
      </nav>
    </div >
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
};

export default App;
