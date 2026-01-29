import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Sun, Moon, TreePine, Minus, Plus, BookOpen, Settings as SettingsIcon, Globe, Sparkles, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
    const {
        theme, setTheme,
        fontSize, setFontSize,
        language, setLanguage,
        continuousReading, setContinuousReading,
        playbackRate, setPlaybackRate,
        pauseOnManualSwitch, setPauseOnManualSwitch,
        readingEffect, setReadingEffect,
        lineHeight, setLineHeight,
        fontFamily, setFontFamily,
        customTheme, setCustomTheme,
        t
    } = useAppContext();

    const glassStyle: React.CSSProperties = {
        background: theme === 'dark' ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.7)',
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="settings-view"
            style={{ paddingBottom: '100px', maxWidth: '600px', margin: '0 auto' }}
        >
            {/* Header omitted for brevity in replace, but should stay */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ marginBottom: '40px', textAlign: 'center' }}
            >
                <div style={{
                    width: '60px', height: '60px',
                    background: 'linear-gradient(135deg, var(--primary-color) 0%, #818cf8 100%)',
                    borderRadius: '20px', margin: '0 auto 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)'
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
                                background: language === lang.id ? 'linear-gradient(135deg, var(--primary-color) 0%, #818cf8 100%)' : 'transparent',
                                color: language === lang.id ? 'white' : 'var(--text-color)',
                                fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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

                {/* Reading Effect */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>{t('settings.reading_effect')}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {[
                            { id: 'scroll', label: t('settings.effects.scroll') },
                            { id: 'horizontal', label: t('settings.effects.horizontal') },
                            { id: 'pageFlip', label: t('settings.effects.pageFlip') }
                        ].map(effect => (
                            <button
                                key={effect.id}
                                onClick={() => setReadingEffect(effect.id as any)}
                                style={{
                                    padding: '12px 5px', borderRadius: '12px',
                                    background: readingEffect === effect.id ? 'var(--primary-color)' : 'var(--bg-color)',
                                    color: readingEffect === effect.id ? 'white' : 'var(--text-color)',
                                    border: '1px solid var(--border-color)',
                                    fontSize: '0.8rem', fontWeight: 700
                                }}
                            >
                                {effect.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Animation Effect (Only if readingEffect is pageFlip or paginated) */}
                <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>{t('settings.animation_effect')}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        {[
                            { id: 'none', label: t('settings.animations.none') },
                            { id: 'fade', label: t('settings.animations.fade') },
                            { id: 'slide', label: t('settings.animations.slide') },
                            { id: 'curl', label: t('settings.animations.curl') }
                        ].map(anim => {
                            const { pageTurnEffect, setPageTurnEffect } = useAppContext();
                            return (
                                <button
                                    key={anim.id}
                                    onClick={() => setPageTurnEffect(anim.id as any)}
                                    style={{
                                        padding: '12px 5px', borderRadius: '12px',
                                        background: pageTurnEffect === anim.id ? 'var(--primary-color)' : 'var(--bg-color)',
                                        color: pageTurnEffect === anim.id ? 'white' : 'var(--text-color)',
                                        border: '1px solid var(--border-color)',
                                        fontSize: '0.8rem', fontWeight: 700
                                    }}
                                >
                                    {anim.label}
                                </button>
                            );
                        })}
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
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {[
                            { id: 'serif', label: t('settings.fonts.serif') },
                            { id: 'sans-serif', label: t('settings.fonts.sans') }
                        ].map(font => (
                            <button
                                key={font.id}
                                onClick={() => setFontFamily(font.id as any)}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '14px',
                                    background: fontFamily === font.id ? 'var(--primary-color)' : 'var(--bg-color)',
                                    color: fontFamily === font.id ? 'white' : 'var(--text-color)',
                                    border: '1px solid var(--border-color)',
                                    fontWeight: 700, fontFamily: font.id === 'serif' ? 'serif' : 'sans-serif'
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

                {/* Playback Rate Slider */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{t('settings.speech_rate')}</span>
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
            </motion.section>

            {/* Toggles */}
            <motion.section
                whileHover={{ y: -2 }}
                style={glassStyle}
            >
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
        </motion.div>
    );
};

export default Settings;
