import React, { useState } from 'react';
import { useAppContext, type BibleBook, type RangeBookmark } from '../context/AppContext';
import { Trash2, BookMarked, BookOpen, Square, CheckSquare, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Bookmarks: React.FC = () => {
    const { bookmarks, toggleBookmark, bibleData, isLoadingBible, setLastRead, t } = useAppContext();
    const navigate = useNavigate();

    // Batch selection state
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showConfirm, setShowConfirm] = useState(false);

    const getVerseInfo = (bookmark: RangeBookmark) => {
        if (isLoadingBible) return { text: '...', location: bookmark.id };
        try {
            const book = bibleData.find((b: BibleBook) => b.id === bookmark.bookId || b.name === bookmark.bookId);
            if (!book) return { text: '', location: bookmark.id };

            const chapter = book.chapters[bookmark.chapter - 1];
            if (!chapter) return { text: '', location: bookmark.id };

            // Get text for the range
            let text = '';
            if (bookmark.startVerse === bookmark.endVerse) {
                text = chapter[bookmark.startVerse - 1] || '';
            } else {
                const verses = [];
                for (let i = bookmark.startVerse; i <= bookmark.endVerse; i++) {
                    if (chapter[i - 1]) verses.push(chapter[i - 1]);
                }
                text = verses.join(' ');
            }

            // Display localized name
            const displayLocation = bookmark.startVerse === bookmark.endVerse
                ? `${book.name} ${bookmark.chapter}:${bookmark.startVerse}`
                : `${book.name} ${bookmark.chapter}:${bookmark.startVerse}-${bookmark.endVerse}`;

            return { text, location: displayLocation };
        } catch (e) {
            return { text: '', location: bookmark.id };
        }
    };

    const handleJump = (bookmark: RangeBookmark) => {
        if (isEditMode) {
            toggleSelect(bookmark.id);
            return;
        }
        const bookIndex = bibleData.findIndex(b => b.id === bookmark.bookId || b.name === bookmark.bookId);
        const chapterIndex = bookmark.chapter - 1;
        const verseNum = bookmark.startVerse;

        if (bookIndex !== -1) {
            setLastRead({ bookIndex, chapterIndex, verseNum });
            navigate('/');
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === bookmarks.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(bookmarks.map(b => b.id)));
        }
    };

    const handleReverseSelect = () => {
        const newSelected = new Set<string>();
        bookmarks.forEach(b => {
            if (!selectedIds.has(b.id)) {
                newSelected.add(b.id);
            }
        });
        setSelectedIds(newSelected);
    };

    const handleBatchDelete = () => {
        bookmarks.forEach(b => {
            if (selectedIds.has(b.id)) {
                toggleBookmark(b);
            }
        });
        setSelectedIds(new Set());
        setIsEditMode(false);
        setShowConfirm(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bookmarks-view"
            style={{ paddingBottom: '120px' }}
        >
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                            {t('bookmarks.title')}
                        </h2>
                        <p style={{ color: 'var(--secondary-text)', fontWeight: 600 }}>
                            {isEditMode
                                ? t('bookmarks.selected_count', { count: selectedIds.size })
                                : t('bookmarks.count', { count: bookmarks.length })}
                        </p>
                    </div>
                </div>

                {bookmarks.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {isEditMode ? (
                            <button
                                onClick={() => { setIsEditMode(false); setSelectedIds(new Set()); }}
                                style={{
                                    padding: '10px 16px', borderRadius: '14px',
                                    background: 'var(--card-bg)', color: 'var(--text-color)',
                                    fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                <X size={18} /> {t('bookmarks.cancel')}
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditMode(true)}
                                style={{
                                    padding: '10px 16px', borderRadius: '14px',
                                    background: 'var(--card-bg)', color: 'var(--primary-color)',
                                    fontWeight: 700, fontSize: '0.9rem'
                                }}
                            >
                                {t('bookmarks.edit')}
                            </button>
                        )}
                    </div>
                )}
            </header>

            {isEditMode && bookmarks.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: 'flex', gap: '12px', marginBottom: '24px',
                        padding: '12px', background: 'var(--card-bg)', borderRadius: '16px'
                    }}
                >
                    <button onClick={handleSelectAll} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: 'var(--bg-color)', fontWeight: 700, fontSize: '0.85rem' }}>
                        {t('bookmarks.select_all')}
                    </button>
                    <button onClick={handleReverseSelect} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: 'var(--bg-color)', fontWeight: 700, fontSize: '0.85rem' }}>
                        {t('bookmarks.reverse_select')}
                    </button>
                </motion.div>
            )}

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
                                {t('bookmarks.empty')}
                            </p>
                        </motion.div>
                    ) : (
                        bookmarks.map(bookmark => {
                            const { text, location } = getVerseInfo(bookmark);
                            const isSelected = selectedIds.has(bookmark.id);
                            return (
                                <motion.div
                                    key={bookmark.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    whileHover={!isEditMode ? { y: -4, boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)' } : {}}
                                    onClick={() => handleJump(bookmark)}
                                    style={{
                                        padding: '24px',
                                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'var(--card-bg)',
                                        borderRadius: '28px',
                                        marginBottom: '20px',
                                        border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        display: 'flex',
                                        gap: '16px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    {isEditMode && (
                                        <div style={{ alignSelf: 'center' }}>
                                            {isSelected
                                                ? <CheckSquare size={24} color="var(--primary-color)" fill="rgba(99, 102, 241, 0.1)" />
                                                : <Square size={24} color="var(--border-color)" />
                                            }
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
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
                                            {!isEditMode && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleBookmark(bookmark); }}
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
                                            )}
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
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* Batch Action Bar */}
            <AnimatePresence>
                {isEditMode && selectedIds.size > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        style={{
                            position: 'fixed',
                            bottom: '100px',
                            left: '5%',
                            right: '5%',
                            maxWidth: '600px',
                            margin: '0 auto',
                            background: 'var(--bg-color)',
                            border: '1px solid var(--border-color)',
                            padding: '12px 20px',
                            borderRadius: '24px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            zIndex: 1000,
                            gap: '12px'
                        }}
                    >
                        <span style={{ fontWeight: 800, color: 'var(--text-color)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                            {t('bookmarks.selected_count', { count: selectedIds.size })}
                        </span>
                        <button
                            onClick={() => setShowConfirm(true)}
                            style={{
                                padding: '10px 16px', borderRadius: '16px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white', fontWeight: 800, fontSize: '0.85rem',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                border: 'none', boxShadow: '0 8px 16px rgba(239, 68, 68, 0.2)',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <Trash2 size={16} /> {t('bookmarks.confirm')}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Dialog */}
            <AnimatePresence>
                {showConfirm && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
                        padding: '24px'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                background: 'var(--bg-color)',
                                padding: '32px',
                                borderRadius: '32px',
                                maxWidth: '400px',
                                width: '100%',
                                textAlign: 'center',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                            }}
                        >
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '22px',
                                background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 24px'
                            }}>
                                <AlertTriangle size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px' }}>
                                {t('bookmarks.delete_confirm', { count: selectedIds.size })}
                            </h3>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    style={{
                                        flex: 1, padding: '14px', borderRadius: '16px',
                                        background: 'var(--card-bg)', fontWeight: 700
                                    }}
                                >
                                    {t('bookmarks.cancel')}
                                </button>
                                <button
                                    onClick={handleBatchDelete}
                                    style={{
                                        flex: 1, padding: '14px', borderRadius: '16px',
                                        background: '#ef4444', color: 'white', fontWeight: 700
                                    }}
                                >
                                    {t('bookmarks.confirm')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Bookmarks;

