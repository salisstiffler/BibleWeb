import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Bookmark, Settings as SettingsIcon, Home, StickyNote } from 'lucide-react';
import Reader from './components/Reader';
import Settings from './components/Settings';
import Bookmarks from './components/Bookmarks';
import Notes from './components/Notes';
import { AppProvider } from './context/AppContext';
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

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <header className="header">
            <div className="logo">
              <BookOpen size={24} />
              <span>圣经阅读</span>
            </div>
          </header>

          <main className="content">
            <AnimatedRoutes />
          </main>

          <nav className="nav-bar">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Home size={24} />
              <span>阅读</span>
            </NavLink>
            <NavLink to="/bookmarks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Bookmark size={24} />
              <span>书签</span>
            </NavLink>
            <NavLink to="/notes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <StickyNote size={24} />
              <span>笔记</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <SettingsIcon size={24} />
              <span>我的</span>
            </NavLink>
          </nav>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
