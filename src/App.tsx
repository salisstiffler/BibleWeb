import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Bookmark, Settings as SettingsIcon, Home, StickyNote } from 'lucide-react';
import Reader from './components/Reader';
import Settings from './components/Settings';
import Bookmarks from './components/Bookmarks';
import Notes from './components/Notes';
import { AppProvider, useAppContext } from './context/AppContext';
import { AnimatePresence } from 'framer-motion';
import './index.css';

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Reader />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent: React.FC = () => {
  const { t } = useAppContext();

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <BookOpen size={24} />
          <span>{t('app.title')}</span>
        </div>
      </header>

      <main className="content">
        <AnimatedRoutes />
      </main>

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
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <SettingsIcon size={24} />
          <span>{t('app.nav.settings')}</span>
        </NavLink>
      </nav>
    </div>
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
