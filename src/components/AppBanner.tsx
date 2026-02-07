import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const AppBanner: React.FC = () => {
    const { t, lastRead } = useAppContext();
    const navigate = useNavigate();

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Check persistent closed state
    const [isVisible, setIsVisible] = useState(() => {
        const dismissed = localStorage.getItem('appBannerDismissed');
        return isMobile && dismissed !== 'true';
    });

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('appBannerDismissed', 'true');
    };

    // Only show if visible and on mobile
    if (!isVisible || !isMobile) return null;

    const handleOpenApp = () => {
        const { bookIndex = 0, chapterIndex = 0, verseNum = 1 } = lastRead || {};

        // Android Intent URI for specific package
        const intentUri = `intent://open?bookIndex=${bookIndex}&chapterIndex=${chapterIndex}${verseNum ? `&verseNum=${verseNum}` : ''}#Intent;scheme=bible-reader;package=com.berlin.bible_reader;end`;

        // iOS / Generic Deep Link fallback
        const genericDeepLink = `bible-reader://open?bookIndex=${bookIndex}&chapterIndex=${chapterIndex}${verseNum ? `&verseNum=${verseNum}` : ''}`;

        const isAndroid = /Android/i.test(navigator.userAgent);
        const deepLink = isAndroid ? intentUri : genericDeepLink;
        console.log(deepLink);

        // Try to open the app
        window.location.href = deepLink;

        // Fallback to download page if app doesn't open
        const timeout = setTimeout(() => {
            navigate('/download');
        }, 2500);

        // Clear timeout if the user leaves the page (meaning app opened)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                clearTimeout(timeout);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearTimeout(timeout);
        };
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="app-banner"
                style={{
                    position: 'sticky',
                    top: '-20px', // Adjusted to stick to the very top of tab-container
                    left: 0,
                    right: 0,
                    zIndex: 2000,
                    margin: '-20px -20px 20px -20px', // Negative margin to bleed out of tab-container padding
                    background: 'var(--primary-color)',
                    color: 'white',
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-color)'
                    }}>
                        <Smartphone size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{t('app.title')}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{t('appBanner.prompt')}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpenApp}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '12px',
                            background: 'white',
                            color: 'var(--primary-color)',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                    >
                        {t('appBanner.open')}
                        <ExternalLink size={14} />
                    </motion.button>
                    <button
                        onClick={handleDismiss}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            opacity: 0.6,
                            padding: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AppBanner;
