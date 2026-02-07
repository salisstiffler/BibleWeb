import React from 'react';
import { useAppContext } from '../context/AppContext';
import { NavLink } from 'react-router-dom';
import {
    Sun, Moon, TreePine, Minus, Plus, BookOpen, Settings as SettingsIcon,
    Globe, Sparkles, Activity, User as UserIcon, CloudSync, LogOut,
    Smartphone, Download as DownloadIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Auth from './Auth';

const Settings: React.FC = () => {
    const {
        theme, setTheme,
        fontSize, setFontSize,
        language, setLanguage,
        continuousReading, setContinuousReading,
        playbackRate, setPlaybackRate,
        pauseOnManualSwitch, setPauseOnManualSwitch,
        lineHeight, setLineHeight,
        fontFamily, setFontFamily,
        customTheme, setCustomTheme,
        accentColor, setAccentColor,
        pageTurnEffect, setPageTurnEffect,
        parallelLanguage, setParallelLanguage,
        user, logout,
        t
    } = useAppContext();

    const [showAuth, setShowAuth] = React.useState(false);

    const glassStyle: React.CSSProperties = {
        background: `rgba(var(--bg-rgb), 0.7)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '30px',
        padding: '24px',
        marginBottom: '20px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden'
    };

    const sectionTitleStyle: React.CSSProperties = {
        fontSize: '0.8rem',
        fontWeight: 800,
        color: 'var(--primary-color)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        textTransform: 'uppercase',
        letterSpacing: '1.2px',
        opacity: 0.8
    };

    const customBackgrounds = [
        null, // Default
        '#fdf2f8', // Soft pink
        '#f0fdf4', // Soft green
        '#eff6ff', // Soft blue
        '#fffbeb', // soft yellow
        '#fafaf9', // warm gray
        '#1e1b4b', // deep indigo
    ];

    const accentColors = [
        '#6366f1', // Indigo
        '#8b5cf6', // Violet
        '#ec4899', // Pink
        '#ef4444', // Red
        '#f59e0b', // Amber
        '#10b981', // Emerald
        '#3b82f6', // Blue
        '#06b6d4', // Cyan
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="settings-view"
            style={{ paddingBottom: '100px', maxWidth: '600px', margin: '0 auto' }}
        >
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ marginBottom: '40px', textAlign: 'center' }}
            >
                <div style={{
                    width: '60px', height: '60px',
                    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color) 100%)',
                    borderRadius: '20px', margin: '0 auto 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', boxShadow: '0 10px 20px -5px rgba(var(--bg-rgb), 0.4)',
                    filter: 'brightness(1.1)'
                }}>
                    <SettingsIcon size={30} />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '4px', letterSpacing: '-0.5px' }}>
                    {t('settings.title')}
                </h2>
                <p style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>
                    {t('settings.subtitle')}
                </p>
            </motion.div>

            {/* User Account Section */}
            <motion.section whileHover={{ y: -2 }} style={{ ...glassStyle, background: 'linear-gradient(135deg, var(--primary-color) 0%, rgba(var(--primary-rgb), 0.8) 100%)', color: 'white', border: 'none' }}>
                <div style={{ ...sectionTitleStyle, color: 'white', opacity: 0.9 }}>
                    <CloudSync size={14} />
                    {user ? t('auth.logged_in') : t('settings.subtitle')}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '30px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserIcon size={28} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{user ? user.username : t('auth.guest_user')}</h3>
                        <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{user ? t('auth.sync_active') : t('auth.sync_prompt')}</p>
                    </div>
                    <button
                        onClick={() => user ? logout() : setShowAuth(true)}
                        style={{
                            padding: '12px 24px', borderRadius: '15px', background: 'white', color: 'var(--primary-color)',
                            border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        {user ? <LogOut size={18} /> : null}
                        {user ? t('auth.logout') : t('auth.login_btn')}
                    </button>
                </div>
            </motion.section>

            {/* Auth Modal */}
            <AnimatePresence>
                {showAuth && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000,
                        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', padding: '20px'
                    }} onClick={() => setShowAuth(false)}>
                        <Auth onClose={() => setShowAuth(false)} />
                    </div>
                )}
            </AnimatePresence>

            {/* Multi-platform Download Section */}
            <motion.section
                whileHover={{ y: -2 }}
                style={{
                    ...glassStyle,
                    border: '1px solid rgba(var(--primary-rgb), 0.2)',
                    background: 'var(--card-bg)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.1) 0%, transparent 70%)',
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ ...sectionTitleStyle, color: 'var(--primary-color)' }}>
                        <Smartphone size={14} />
                        {t('settings.multi_platform')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>
                                {t('download.title')}
                            </h3>
                            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                {t('download.subtitle')}
                            </p>
                        </div>
                        <NavLink
                            to="/download"
                            style={{
                                padding: '10px 20px',
                                borderRadius: '15px',
                                background: 'var(--primary-color)',
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.2)'
                            }}
                        >
                            <DownloadIcon size={18} />
                            {t('download.btn_download')}
                        </NavLink>
                    </div>
                </div>
            </motion.section>

            {/* Language Selection */}
            <motion.section whileHover={{ y: -2 }} style={glassStyle}>
                <div style={sectionTitleStyle}>
                    <Globe size={14} />
                    {t('settings.ui_language')}
                </div>
                <div style={{
                    display: 'flex', background: 'var(--bg-color)', padding: '6px', borderRadius: '20px', border: '1px solid var(--border-color)'
                }}>
                    {[{ id: 'zh-Hans', label: '简体' }, { id: 'zh-Hant', label: '繁體' }, { id: 'en', label: 'English' }].map(lang => (
                        <button
                            key={lang.id}
                            onClick={() => setLanguage(lang.id as any)}
                            style={{
                                flex: 1, padding: '12px 10px', borderRadius: '15px',
                                background: language === lang.id ? 'var(--primary-color)' : 'transparent',
                                color: language === lang.id ? 'white' : 'var(--text-color)',
                                fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </motion.section>

            {/* Parallel Reading Selection */}
            <motion.section whileHover={{ y: -2 }} style={glassStyle}>
                <div style={sectionTitleStyle}>
                    <BookOpen size={14} />
                    {t('settings.parallel_translation')}
                </div>
                <div style={{
                    display: 'flex', background: 'var(--bg-color)', padding: '6px', borderRadius: '20px', border: '1px solid var(--border-color)'
                }}>
                    {[{ id: null, label: t('settings.none') }, { id: 'zh-Hans', label: '简体' }, { id: 'zh-Hant', label: '繁體' }, { id: 'en', label: 'English' }].map(lang => (
                        <button
                            key={lang.id || 'none'}
                            onClick={() => setParallelLanguage(lang.id as any)}
                            style={{
                                flex: 2, padding: '12px 10px', borderRadius: '15px',
                                background: parallelLanguage === lang.id ? 'var(--primary-color)' : 'transparent',
                                color: parallelLanguage === lang.id ? 'white' : 'var(--text-color)',
                                fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </motion.section>

            {/* Appearance Section */}
            <motion.section whileHover={{ y: -2 }} style={glassStyle}>
                <div style={sectionTitleStyle}>
                    <Sparkles size={14} />
                    {t('settings.visual_style')}
                </div>

                {/* Theme row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { id: 'light', label: t('settings.theme.light'), icon: <Sun size={20} /> },
                        { id: 'dark', label: t('settings.theme.dark'), icon: <Moon size={20} /> },
                        { id: 'sepia', label: t('settings.theme.sepia'), icon: <TreePine size={20} /> }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setTheme(item.id as any)}
                            style={{
                                padding: '16px 8px', borderRadius: '20px',
                                background: theme === item.id ? 'var(--bg-color)' : 'transparent',
                                border: '2px solid', borderColor: theme === item.id ? 'var(--primary-color)' : 'transparent',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <div style={{ color: theme === item.id ? 'var(--primary-color)' : 'var(--secondary-text)' }}>{item.icon}</div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Custom Backgrounds */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>{t('settings.custom_bg')}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {customBackgrounds.map((bg, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCustomTheme(bg)}
                                className={`custom-bg-dot ${customTheme === bg ? 'active' : ''}`}
                                style={{
                                    backgroundColor: bg || 'var(--bg-color)',
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    border: customTheme === bg ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Accent Colors */}
                <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>{t('settings.accent_color')}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {accentColors.map((color, idx) => (
                            <button
                                key={idx}
                                onClick={() => setAccentColor(color)}
                                style={{
                                    backgroundColor: color,
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    border: accentColor === color ? '4px solid white' : 'none',
                                    outline: accentColor === color ? '2px solid var(--primary-color)' : 'none',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                    transition: 'all 0.2s'
                                }}
                            />
                        ))}
                    </div>
                </div>

            </motion.section>

            {/* Typography & Controls */}
            <motion.section whileHover={{ y: -2 }} style={glassStyle}>
                <div style={sectionTitleStyle}>
                    <Activity size={14} />
                    {t('settings.reading_controls')}
                </div>

                {/* Font Family */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>{t('settings.font_family')}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {[
                            { id: 'sans', label: t('settings.fonts.sans'), font: 'sans-serif' },
                            { id: 'serif', label: t('settings.fonts.serif'), font: 'serif' },
                            { id: 'kai', label: t('settings.fonts.kai'), font: 'kai' },
                            { id: 'rounded', label: t('settings.fonts.rounded'), font: 'rounded' }
                        ].map(font => (
                            <button
                                key={font.id}
                                onClick={() => setFontFamily(font.id as any)}
                                style={{
                                    padding: '16px 12px', borderRadius: '14px',
                                    background: fontFamily === font.id ? 'var(--primary-color)' : 'var(--bg-color)',
                                    color: fontFamily === font.id ? 'white' : 'var(--text-color)',
                                    border: '1px solid var(--border-color)',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease',
                                    boxShadow: fontFamily === font.id ? '0 4px 12px rgba(var(--primary-rgb), 0.2)' : 'none'
                                }}
                            >
                                {font.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Font Size Selector */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{t('settings.font_size')}</span>
                        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                            {fontSize}px
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => setFontSize(Math.max(12, fontSize - 1))} className="icon-btn"><Minus size={16} /></button>
                        <input
                            type="range" min="12" max="32" step="1"
                            value={fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                            style={{ flex: 1, accentColor: 'var(--primary-color)' }}
                        />
                        <button onClick={() => setFontSize(Math.min(32, fontSize + 1))} className="icon-btn"><Plus size={16} /></button>
                    </div>
                </div>
                {/* Line Height Selector */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{t('settings.line_height')}</span>
                        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                            {lineHeight}
                        </div>
                    </div>
                    <input
                        type="range" min="1.0" max="2.5" step="0.1"
                        value={lineHeight}
                        onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--primary-color)' }}
                    />
                </div>

                {/* Page Turn Effect Selector */}
                <div style={{ marginTop: '24px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>{t('settings.animation_effect')}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {[
                            { id: 'none', label: t('settings.animations.none') },
                            { id: 'fade', label: t('settings.animations.fade') },
                            { id: 'slide', label: t('settings.animations.slide') },
                            { id: 'curl', label: t('settings.animations.curl') }
                        ].map(effect => (
                            <button
                                key={effect.id}
                                onClick={() => (setPageTurnEffect as any)(effect.id)}
                                style={{
                                    padding: '16px 12px', borderRadius: '14px',
                                    background: pageTurnEffect === effect.id ? 'var(--primary-color)' : 'var(--bg-color)',
                                    color: pageTurnEffect === effect.id ? 'white' : 'var(--text-color)',
                                    border: '1px solid var(--border-color)',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease',
                                    boxShadow: pageTurnEffect === effect.id ? '0 4px 12px rgba(var(--primary-rgb), 0.2)' : 'none'
                                }}
                            >
                                {effect.label}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Toggles */}
            <motion.section
                whileHover={{ y: -2 }}
                style={glassStyle}
            >
                {/* Playback Rate Slider */}
                <div style={{ marginBottom: '28px', paddingBottom: '28px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                        <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                            {t('settings.speech_rate')}
                        </h4>
                        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                            {playbackRate.toFixed(1)}x
                        </div>
                    </div>
                    <input
                        type="range" min="0.5" max="2.0" step="0.1"
                        value={playbackRate}
                        onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--primary-color)', height: '6px' }}
                    />
                </div>

                <div
                    onClick={() => setContinuousReading(!continuousReading)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>
                            {t('settings.continuous_reading')}
                        </h4>
                        <p style={{ color: 'var(--secondary-text)', fontSize: '0.85rem', lineHeight: 1.4, paddingRight: '20px' }}>
                            {t('settings.continuous_reading_desc')}
                        </p>
                    </div>
                    <div style={{
                        width: '56px',
                        height: '30px',
                        backgroundColor: continuousReading ? 'var(--primary-color)' : '#cbd5e1',
                        borderRadius: '20px',
                        position: 'relative',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            width: '24px', height: '24px',
                            backgroundColor: 'white', borderRadius: '50%',
                            position: 'absolute', top: '3px',
                            left: continuousReading ? '29px' : '3px',
                            transition: 'left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }} />
                    </div>
                </div>

                {/* Pause on Manual Switch */}
                <div
                    onClick={() => setPauseOnManualSwitch(!pauseOnManualSwitch)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        marginTop: '28px',
                        paddingTop: '28px',
                        borderTop: '1px solid var(--border-color)'
                    }}
                >
                    <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>
                            {t('settings.pause_on_switch')}
                        </h4>
                        <p style={{ color: 'var(--secondary-text)', fontSize: '0.85rem', lineHeight: 1.4, paddingRight: '20px' }}>
                            {t('settings.pause_on_switch_desc')}
                        </p>
                    </div>
                    <div style={{
                        width: '56px',
                        height: '30px',
                        backgroundColor: pauseOnManualSwitch ? 'var(--primary-color)' : '#cbd5e1',
                        borderRadius: '20px',
                        position: 'relative',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            width: '24px', height: '24px',
                            backgroundColor: 'white', borderRadius: '50%',
                            position: 'absolute', top: '3px',
                            left: pauseOnManualSwitch ? '29px' : '3px',
                            transition: 'left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }} />
                    </div>
                </div>
            </motion.section>

            {/* Premium Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ marginTop: '60px', textAlign: 'center' }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                }}>
                    <BookOpen size={24} color="var(--primary-color)" />
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Holy Read <span style={{ color: 'var(--primary-color)' }}>Pro</span></span>
                </div>
                <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    borderRadius: '50px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--secondary-text)'
                }}>
                    v 1.2.5 • Designed in Digital Sanctuary
                </div>
                <p style={{ marginTop: '24px', fontSize: '0.75rem', opacity: 0.5, letterSpacing: '0.5px' }}>
                    &copy; 2024 ANTIGRAVITY. ALL RIGHTS RESERVED.
                </p>
            </motion.footer>
        </motion.div >
    );
};

export default Settings;
