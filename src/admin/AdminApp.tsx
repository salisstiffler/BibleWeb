import React, { useState } from 'react';
import axios from 'axios';
import { Users, Smartphone, LogOut, Activity, Lock, User } from 'lucide-react';
import UserSection from './components/UserSection';
import VersionSection from './components/VersionSection';
import './admin.css';

// Configure Axios
axios.defaults.baseURL = 'https://api.berlin2025.dpdns.org'; // Default base for dev
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/admin/login', { username, password });
            localStorage.setItem('adminToken', res.data.token);
            onLogin();
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="login-container glass" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100vh', width: '100%', background: 'var(--bg)'
        }}>
            <form className="card glass" onSubmit={handleSubmit} style={{ width: '350px', padding: '2.5rem' }}>
                <h1 className="gradient-text" style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Access</h1>
                <div className="form-group">
                    <label>Username</label>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                </div>
                {error && <p style={{ color: 'var(--error)', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Sign In
                </button>
            </form>
        </div>
    );
}

const AdminApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-root">
                <Login onLogin={() => setIsAuthenticated(true)} />
            </div>
        );
    }

    return (
        <div className="admin-root">
            <div className="sidebar">
                <div style={{ paddingBottom: '2rem' }}>
                    <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Bible Admin</h1>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div
                        className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={20} />
                        <span>User Management</span>
                    </div>

                    <div
                        className={`nav-item ${activeTab === 'versions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('versions')}
                    >
                        <Smartphone size={20} />
                        <span>Version Control</span>
                    </div>
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <div className="nav-item" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </div>
                </div>
            </div>

            <main className="content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.8rem' }}>
                        {activeTab === 'users' ? 'User Management' : 'Version Control'}
                    </h2>
                    <div style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={16} />
                        <span>Server Live</span>
                    </div>
                </header>

                {activeTab === 'users' ? <UserSection /> : <VersionSection />}
            </main >
        </div>
    );
}

export default AdminApp;

