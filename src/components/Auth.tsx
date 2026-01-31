import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { X, User, Lock, ArrowRight, Loader2, LogOut } from 'lucide-react';

interface AuthProps {
    onClose: () => void;
}

const Auth: React.FC<AuthProps> = ({ onClose }) => {
    const { login, register, user, logout, t } = useAppContext();
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (isLogin) {
                await login(username, password);
            } else {
                await register(username, password);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || 'Auth failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (user) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    padding: '32px', textAlign: 'center', background: 'var(--bg-color)',
                    borderRadius: '24px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '400px'
                }}
            >
                <div style={{ width: '64px', height: '64px', borderRadius: '32px', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <User size={32} />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{user.username}</h2>
                <p style={{ color: 'var(--text-color)', opacity: 0.6, marginBottom: '32px' }}>{t('auth.logged_in')}</p>
                <button
                    onClick={() => { logout(); onClose(); }}
                    style={{
                        width: '100%', padding: '16px', borderRadius: '14px', background: '#ef4444', color: 'white',
                        border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'
                    }}
                >
                    <LogOut size={20} />
                    {t('auth.logout')}
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                width: '100%', maxWidth: '400px', background: 'var(--bg-color)', padding: '32px',
                borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-color)', opacity: 0.4, cursor: 'pointer' }}>
                <X size={24} />
            </button>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>
                {isLogin ? t('auth.login_title') : t('auth.register_title')}
            </h2>
            <p style={{ color: 'var(--text-color)', opacity: 0.6, marginBottom: '32px' }}>
                {isLogin ? t('auth.login_desc') : t('auth.register_desc')}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    <input
                        type="text"
                        placeholder={t('auth.username_placeholder')}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{
                            width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', border: '1px solid var(--border-color)',
                            background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1rem', outline: 'none'
                        }}
                    />
                </div>
                <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    <input
                        type="password"
                        placeholder={t('auth.password_placeholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', border: '1px solid var(--border-color)',
                            background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1rem', outline: 'none'
                        }}
                    />
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: '100%', padding: '16px', borderRadius: '14px', background: 'var(--primary-color)', color: 'white',
                        border: 'none', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        cursor: isLoading ? 'default' : 'pointer', marginTop: '8px', boxShadow: '0 8px 20px rgba(var(--primary-rgb), 0.25)'
                    }}
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? t('auth.login_btn') : t('auth.register_btn'))}
                    {!isLoading && <ArrowRight size={20} />}
                </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-color)', opacity: 0.6 }}>
                {isLogin ? t('auth.no_account') : t('auth.has_account')}
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 800, marginLeft: '8px', cursor: 'pointer' }}
                >
                    {isLogin ? t('auth.switch_register') : t('auth.switch_login')}
                </button>
            </div>
        </motion.div>
    );
};

export default Auth;
