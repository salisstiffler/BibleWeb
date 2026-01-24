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
        pauseOnManualSwitch, setPauseOnManualSwitch
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
                    background: 'linear-gradient(135deg, var(--primary-color) 0%, #818cf8 100%)',
                    borderRadius: '20px', margin: '0 auto 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)'
                }}>
                    <SettingsIcon size={30} />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '4px', letterSpacing: '-0.5px' }}>
                    {language === 'en' ? 'Preferences' : '个性化设置'}
                </h2>
                <p style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>
                    {language === 'en' ? 'Configure your perfect reading environment' : '打造最适合您的灵修阅读环境'}
                </p>
            </motion.div>

            {/* Language Selection */}
            <motion.section
                whileHover={{ y: -2 }}
                style={glassStyle}
            >
                <div style={sectionTitleStyle}>
                    <Globe size={14} />
                    {language === 'en' ? 'Localization' : '语言预设'}
                </div>
                <div style={{
                    display: 'flex',
                    background: 'var(--bg-color)',
                    padding: '6px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)'
                }}>
                    {[
                        { id: 'zh-Hans', label: '简体' },
                        { id: 'zh-Hant', label: '繁體' },
                        { id: 'en', label: 'English' }
                    ].map(lang => (
                        <button
                            key={lang.id}
                            onClick={() => setLanguage(lang.id as any)}
                            style={{
                                flex: 1,
                                padding: '12px 10px',
                                borderRadius: '15px',
                                background: language === lang.id ? 'linear-gradient(135deg, var(--primary-color) 0%, #818cf8 100%)' : 'transparent',
                                color: language === lang.id ? 'white' : 'var(--text-color)',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: language === lang.id ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none'
                            }}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </motion.section>

            {/* Appearance Section */}
            <motion.section
                whileHover={{ y: -2 }}
                style={glassStyle}
            >
                <div style={sectionTitleStyle}>
                    <Sparkles size={14} />
                    {language === 'en' ? 'Visual Style' : '视觉风格'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {[
                        { id: 'light', label: '明亮', icon: <Sun size={20} />, activeColor: '#6366f1' },
                        { id: 'dark', label: '深色', icon: <Moon size={20} />, activeColor: '#818cf8' },
                        { id: 'sepia', label: '舒耳', icon: <TreePine size={20} />, activeColor: '#795548' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setTheme(item.id as any)}
                            style={{
                                padding: '20px 10px',
                                borderRadius: '24px',
                                background: theme === item.id ? 'var(--bg-color)' : 'transparent',
                                border: '2px solid',
                                borderColor: theme === item.id ? 'var(--primary-color)' : 'transparent',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                color: theme === item.id ? 'var(--primary-color)' : 'var(--secondary-text)',
                                transform: theme === item.id ? 'scale(1.1)' : 'scale(1)',
                                transition: 'transform 0.2s'
                            }}>
                                {item.icon}
                            </div>
                            <span style={{
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                color: theme === item.id ? 'var(--text-color)' : 'var(--secondary-text)'
                            }}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </motion.section>

            {/* Typography & Performance */}
            <motion.section
                whileHover={{ y: -2 }}
                style={glassStyle}
            >
                <div style={sectionTitleStyle}>
                    <Activity size={14} />
                    {language === 'en' ? 'Reading Controls' : '阅读及朗读'}
                </div>

                {/* Font Size Selector */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700 }}>{language === 'en' ? 'Typography Size' : '字体缩放'}</span>
                        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 }}>
                            {fontSize}px
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                            style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
                        >
                            <Minus size={18} />
                        </button>
                        <div style={{ flex: 1, position: 'relative', height: '40px', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                            <input
                                type="range" min="12" max="32" step="1"
                                value={fontSize}
                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                            />
                        </div>
                        <button
                            onClick={() => setFontSize(Math.min(32, fontSize + 1))}
                            style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>

                {/* Playback Rate Slider */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700 }}>{language === 'en' ? 'Speech Rate' : '朗读速率'}</span>
                        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 }}>
                            {playbackRate.toFixed(1)}x
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input
                            type="range" min="0.5" max="2.0" step="0.1"
                            value={playbackRate}
                            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer', height: '6px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--secondary-text)', fontWeight: 700 }}>
                            <span>0.5x</span>
                            <span>1.0x (Normal)</span>
                            <span>2.0x</span>
                        </div>
                    </div>
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
                            {language === 'en' ? 'Continuous Reading' : '沉浸式连续播放'}
                        </h4>
                        <p style={{ color: 'var(--secondary-text)', fontSize: '0.85rem', lineHeight: 1.4, paddingRight: '20px' }}>
                            {language === 'en' ? 'Auto-play subsequent verses for hands-free study.' : '朗读完当前经文后自动进入下一节，适合闭目灵修。'}
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
                            {language === 'en' ? 'Pause on Chapter Switch' : '切换章节时暂停'}
                        </h4>
                        <p style={{ color: 'var(--secondary-text)', fontSize: '0.85rem', lineHeight: 1.4, paddingRight: '20px' }}>
                            {language === 'en' ? 'Automatically pause playback when manually switching chapters.' : '手动切换章节时自动暂停播放，包括点击上/下一章按钮。'}
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
