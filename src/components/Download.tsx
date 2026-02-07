import React from 'react';
import { motion } from 'framer-motion';
import {
    Smartphone,
    Monitor,
    Apple,
    Download as DownloadIcon,
    AlertCircle,
    ArrowLeft,
    Tablet,
    Laptop,
    ExternalLink
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface PlatformCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    downloadUrl: string;
    color: string;
    delay: number;
    badge?: string;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
    icon: Icon,
    title,
    description,
    downloadUrl,
    color,
    delay,
    badge
}) => {
    const { t } = useAppContext();
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, type: 'spring' }}
            whileHover={{ y: -5, scale: 1.02 }}
            style={{
                background: 'var(--card-bg)',
                borderRadius: '32px',
                padding: '32px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background Accent */}
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    backgroundColor: `${color}15`,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px'
                }}>
                    <Icon size={32} strokeWidth={2.5} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{title}</h3>
                    {badge && (
                        <span style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            padding: '4px 10px',
                            borderRadius: '100px',
                            textTransform: 'uppercase'
                        }}>
                            {badge}
                        </span>
                    )}
                </div>

                <p style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    color: 'var(--secondary-text)',
                    marginBottom: '32px',
                    minHeight: '4.8em'
                }}>
                    {description}
                </p>

                <motion.a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.98 }}
                    style={{
                        padding: '16px 24px',
                        backgroundColor: 'var(--text-color)',
                        color: 'var(--bg-color)',
                        borderRadius: '18px',
                        textDecoration: 'none',
                        fontWeight: 800,
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'opacity 0.2s'
                    }}
                >
                    <DownloadIcon size={20} />
                    {t('download.btn_download')}
                </motion.a>
            </div>
        </motion.div>
    );
};

const Download: React.FC = () => {
    const { t, theme } = useAppContext();

    const platforms = [
        {
            icon: Smartphone,
            title: t('download.android'),
            description: t('download.android_desc'),
            downloadUrl: '#',
            color: '#34d399',
            delay: 0.1
        },
        {
            icon: Tablet,
            title: t('download.ios'),
            description: t('download.ios_desc'),
            downloadUrl: '#',
            color: '#60a5fa',
            delay: 0.2,
            badge: 'Sideload'
        },
        {
            icon: Monitor,
            title: t('download.windows'),
            description: t('download.windows_desc'),
            downloadUrl: '#',
            color: '#818cf8',
            delay: 0.3
        },
        {
            icon: Laptop,
            title: t('download.macos'),
            description: t('download.macos_desc'),
            downloadUrl: '#',
            color: '#f472b6',
            delay: 0.4
        }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            padding: '40px 24px',
            backgroundColor: 'var(--bg-color)',
            background: theme === 'dark'
                ? 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.1) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.05) 0%, transparent 40%)'
                : 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.05) 0%, transparent 40%)'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '80px', paddingTop: '40px' }}
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        style={{
                            display: 'inline-flex',
                            padding: '12px 20px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '100px',
                            color: 'var(--primary-color)',
                            fontSize: '0.9rem',
                            fontWeight: 900,
                            marginBottom: '24px',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Apple size={16} />
                        {t('download.flutter_project')}
                    </motion.div>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: 900,
                        marginBottom: '16px',
                        letterSpacing: '-2px',
                        background: 'linear-gradient(to right, var(--text-color), var(--primary-color))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {t('download.title')}
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--secondary-text)',
                        fontWeight: 500,
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        {t('download.subtitle')}
                    </p>
                </motion.header>

                {/* Platforms Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px',
                    marginBottom: '60px'
                }}>
                    {platforms.map((p, i) => (
                        <PlatformCard key={i} {...p} />
                    ))}
                </div>

                {/* iOS Note Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.05)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        borderRadius: '32px',
                        padding: '40px',
                        marginBottom: '80px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '14px',
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                color: '#f59e0b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <AlertCircle size={24} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{t('download.ios_note_title')}</h2>
                        </div>
                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            color: 'var(--text-color)',
                            opacity: 0.8,
                            maxWidth: '900px'
                        }}>
                            {t('download.ios_note_desc')}
                        </p>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap' }}>
                            <a href="https://sideloadly.io/" target="_blank" rel="noopener noreferrer" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#f59e0b',
                                fontWeight: 800,
                                textDecoration: 'none',
                                fontSize: '0.9rem'
                            }}>
                                {t('download.sideloadly_site')} <ExternalLink size={14} />
                            </a>
                            <a href="https://altstore.io/" target="_blank" rel="noopener noreferrer" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#f59e0b',
                                fontWeight: 800,
                                textDecoration: 'none',
                                fontSize: '0.9rem'
                            }}>
                                {t('download.altstore_site')} <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </motion.section>

                {/* Footer Link */}
                <div style={{ textAlign: 'center', paddingBottom: '60px' }}>
                    <motion.button
                        onClick={() => window.history.back()}
                        whileHover={{ x: -4 }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--secondary-text)',
                            fontWeight: 700,
                            fontSize: '1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={20} />
                        {t('download.back_to_reader')}
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default Download;
