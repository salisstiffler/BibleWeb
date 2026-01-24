import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Sun, Moon, TreePine, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
    const {
        theme, setTheme,
        fontSize, setFontSize,
        language, setLanguage,
        continuousReading, setContinuousReading
    } = useAppContext();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="settings-view"
        >
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>设置 / Settings</h2>
                <p style={{ color: 'var(--secondary-text)' }}>个性化您的阅读体验</p>
            </div>

            <div className="settings-group">
                <label className="settings-label">语言 / Language</label>
                <div className="lang-switcher">
                    <button
                        className={`lang-btn ${language === 'zh-Hans' ? 'active' : ''}`}
                        onClick={() => setLanguage('zh-Hans')}
                    >
                        简体中文
                    </button>
                    <button
                        className={`lang-btn ${language === 'zh-Hant' ? 'active' : ''}`}
                        onClick={() => setLanguage('zh-Hant')}
                    >
                        繁體中文
                    </button>
                    <button
                        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                        onClick={() => setLanguage('en')}
                    >
                        English
                    </button>
                </div>
            </div>

            <div className="settings-group" style={{ marginTop: '32px' }}>
                <label className="settings-label">主题模式 / Appearance</label>
                <div className="theme-options">
                    <button
                        className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                        onClick={() => setTheme('light')}
                    >
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                            <Sun size={20} />
                        </div>
                        <span>明亮</span>
                    </button>
                    <button
                        className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                        onClick={() => setTheme('dark')}
                    >
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#111827', border: '1px solid #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                            <Moon size={20} />
                        </div>
                        <span>深色</span>
                    </button>
                    <button
                        className={`theme-btn ${theme === 'sepia' ? 'active' : ''}`}
                        onClick={() => setTheme('sepia')}
                    >
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f4ecd8', border: '1px solid #d7ccc8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#795548' }}>
                            <TreePine size={20} />
                        </div>
                        <span>护眼</span>
                    </button>
                </div>
            </div>

            <div className="settings-group" style={{ marginTop: '32px' }}>
                <label className="settings-label">字体大小 / Font Size ({fontSize}px)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <button onClick={() => setFontSize(Math.max(12, fontSize - 1))} className="icon-btn">
                        <Minus size={18} />
                    </button>
                    <input
                        type="range"
                        min="12"
                        max="32"
                        step="1"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="font-size-slider"
                        style={{ accentColor: 'var(--primary-color)' }}
                    />
                    <button onClick={() => setFontSize(Math.min(32, fontSize + 1))} className="icon-btn">
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            <div className="settings-group" style={{ marginTop: '32px' }}>
                <label className="settings-label">朗读设置 / Reading</label>
                <div
                    onClick={() => setContinuousReading(!continuousReading)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer'
                    }}
                >
                    <span style={{ fontWeight: 600 }}>连续朗读模式</span>
                    <div
                        style={{
                            width: '44px',
                            height: '24px',
                            backgroundColor: continuousReading ? 'var(--primary-color)' : '#d1d5db',
                            borderRadius: '12px',
                            position: 'relative',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: continuousReading ? '22px' : '2px',
                            transition: 'left 0.3s'
                        }} />
                    </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', marginTop: '8px', paddingLeft: '4px' }}>
                    开启后，点击单节播放将自动持续朗读后续内容
                </p>
            </div>

            <div style={{ marginTop: '60px', padding: '32px', backgroundColor: 'var(--card-bg)', borderRadius: '20px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '4px' }}>Holy Read</div>
                <p style={{ color: 'var(--secondary-text)', fontSize: '0.875rem' }}>版本 1.1.0 (Multi-Lang)</p>
                <p style={{ color: 'var(--secondary-text)', fontSize: '0.75rem', marginTop: '12px' }}>由 Antigravity 设计开发</p>
            </div>
        </motion.div>
    );
};

export default Settings;
