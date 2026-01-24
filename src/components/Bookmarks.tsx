import React from 'react';
import { useAppContext, type BibleBook } from '../context/AppContext';
import { Trash2, BookMarked, ChevronRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Bookmarks: React.FC = () => {
    const { bookmarks, toggleBookmark, bibleData, isLoadingBible, setLastRead, language } = useAppContext();
    const navigate = useNavigate();

    const getVerseInfo = (verseId: string) => {
        if (isLoadingBible) return { text: '...', location: verseId };
        try {
            const spaceIdx = verseId.lastIndexOf(' ');
            const bookId = verseId.substring(0, spaceIdx);
            const position = verseId.substring(spaceIdx + 1);
            const [chapterPart, versePart] = position.split(':');
            const chapterNum = parseInt(chapterPart);
            const verseNum = parseInt(versePart);

            const book = bibleData.find((b: BibleBook) => b.id === bookId || b.name === bookId);
            if (!book) return { text: '', location: verseId };

            const chapter = book.chapters[chapterNum - 1];
            const text = chapter ? (chapter[verseNum - 1] || '') : '';

            // Display localized name
            const displayLocation = `${book.name} ${position}`;

            return { text, location: displayLocation };
        } catch (e) {
            return { text: '', location: verseId };
        }
    };

    const handleJump = (verseId: string) => {
        const spaceIdx = verseId.lastIndexOf(' ');
        const bookId = verseId.substring(0, spaceIdx);
        const position = verseId.substring(spaceIdx + 1);
        const [chapterPart, versePart] = position.split(':');

        const bookIndex = bibleData.findIndex(b => b.id === bookId || b.name === bookId);
        const chapterIndex = parseInt(chapterPart) - 1;
        const verseNum = parseInt(versePart);

        if (bookIndex !== -1) {
            setLastRead({ bookIndex, chapterIndex, verseNum });
            navigate('/');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bookmarks-view"
            style={{ paddingBottom: '40px' }}
        >
            <header style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <div style={{
                        width: '56px', height: '56px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, var(--primary-color) 0%, #818cf8 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 8px 20px -5px rgba(99, 102, 241, 0.4)'
                    }}>
                        <BookMarked size={28} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
                            {language === 'en' ? 'Bookmarks' : '经文收藏'}
                        </h2>
                        <p style={{ color: 'var(--secondary-text)', fontWeight: 600 }}>
                            {language === 'en' ? `You have ${bookmarks.length} saved verses` : `已珍藏 ${bookmarks.length} 条灵粮`}
                        </p>
                    </div>
                </div>
            </header>

            <div className="bookmarks-list">
                <AnimatePresence>
                    {bookmarks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                textAlign: 'center',
                                padding: '80px 40px',
                                background: 'var(--card-bg)',
                                borderRadius: '32px',
                                border: '1px dashed var(--border-color)',
                                color: 'var(--secondary-text)'
                            }}
                        >
                            <BookOpen size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
                            <p style={{ fontWeight: 600 }}>
                                {language === 'en' ? 'No bookmarks yet.' : '书签栏空空的，开启您的读经之旅吧'}
                            </p>
                        </motion.div>
                    ) : (
                        bookmarks.map(id => {
                            const { text, location } = getVerseInfo(id);
                            return (
                                <motion.div
                                    key={id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    whileHover={{ y: -4, boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)' }}
                                    onClick={() => handleJump(id)}
                                    style={{
                                        padding: '24px',
                                        backgroundColor: 'var(--card-bg)',
                                        borderRadius: '28px',
                                        marginBottom: '20px',
                                        border: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                                        <span style={{
                                            fontWeight: 800,
                                            color: 'var(--primary-color)',
                                            fontSize: '0.85rem',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            padding: '6px 14px',
                                            borderRadius: '12px',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {location}
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleBookmark(id); }}
                                                style={{
                                                    width: '36px', height: '36px',
                                                    borderRadius: '12px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#ef4444',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <div style={{
                                                width: '36px', height: '36px',
                                                borderRadius: '12px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--secondary-text)',
                                                background: 'var(--bg-color)',
                                                border: '1px solid var(--border-color)'
                                            }}>
                                                <ChevronRight size={18} />
                                            </div>
                                        </div>
                                    </div>
                                    <p style={{
                                        fontSize: '1.15rem',
                                        lineHeight: '1.7',
                                        color: 'var(--text-color)',
                                        fontWeight: 500,
                                        fontFamily: 'var(--font-serif)'
                                    }}>
                                        {text}
                                    </p>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Bookmarks;
