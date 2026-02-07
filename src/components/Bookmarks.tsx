import React, { useState, useEffect } from 'react';
import { useAppContext, type BibleBook, type RangeBookmark } from '../context/AppContext';
import { Trash2, BookMarked, BookOpen, Square, CheckSquare, X, AlertTriangle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Bookmarks: React.FC = () => {
    const { bookmarks, toggleBookmark, bibleData, isLoadingBible, setLastRead, t, language } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    // Batch selection state
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [truncatableIds, setTruncatableIds] = useState<Set<string>>(new Set());
    const [showConfirm, setShowConfirm] = useState(false);
    const [bookmarkToDelete, setBookmarkToDelete] = useState<RangeBookmark | null>(null);

    // Detect truncation on mount and when content changes
    useEffect(() => {
        const checkTruncation = () => {
            const newTruncatable = new Set<string>();
            bookmarks.forEach(b => {
                const el = document.getElementById(`text-${b.id}`);
                if (el) {
                    // scrollHeight is the full height of the content
                    // clientHeight is the height of the visible area (clamped to 3 lines)
                    if (el.scrollHeight > el.clientHeight + 5) {
                        newTruncatable.add(b.id);
                    }
                }
            });
            setTruncatableIds(newTruncatable);
        };

        // Use ResizeObserver for more reliable detection
        const observer = new ResizeObserver(() => {
            checkTruncation();
        });

        // Observe all bookmark text elements
        bookmarks.forEach(b => {
            const el = document.getElementById(`text-${b.id}`);
            if (el) observer.observe(el);
        });

        // Initial check with a bit of delay for rendering
        const timer = setTimeout(checkTruncation, 500);

        return () => {
            observer.disconnect();
            clearTimeout(timer);
        };
    }, [bookmarks, isLoadingBible, expandedIds, language, bibleData]);

    const getVerseInfo = (bookmark: RangeBookmark) => {
        if (isLoadingBible) return { text: '...', location: bookmark.id };
        try {
            console.log('🔍 Processing bookmark:', bookmark);
            console.log('📖 Looking for bookId:', bookmark.bookId);
            console.log('📚 Available books:', bibleData.map(b => ({ id: b.id, name: b.name })));

            const book = bibleData.find((b: BibleBook) => b.id === bookmark.bookId || b.name === bookmark.bookId);
            if (!book) {
                console.warn('❌ Book not found for bookmark:', bookmark);
                return { text: '', location: bookmark.id };
            }

            const chapter = book.chapters[bookmark.chapter - 1];
            if (!chapter) {
                console.warn('❌ Chapter not found:', bookmark.chapter);
                return { text: '', location: bookmark.id };
            }

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

            console.log('✅ Verse info:', { text: text.substring(0, 50) + '...', location: displayLocation });
            return { text, location: displayLocation };
        } catch (e) {
            console.error('❌ Error getting verse info:', e);
            return { text: '', location: bookmark.id };
        }
    };

    const filteredBookmarks = bookmarks.filter(bookmark => {
        const { text, location } = getVerseInfo(bookmark);
        return location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bookmark.id.toLowerCase().includes(searchTerm.toLowerCase());
    });

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
    };

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const handleDelete = (bookmark: RangeBookmark, e: React.MouseEvent) => {
        e.stopPropagation();
        setBookmarkToDelete(bookmark);
        setShowConfirm(true);
    };

    const confirmDelete = () => {
        if (bookmarkToDelete) {
            toggleBookmark(bookmarkToDelete);
            setBookmarkToDelete(null);
        } else if (selectedIds.size > 0) {
            bookmarks.forEach(b => {
                if (selectedIds.has(b.id)) {
                    toggleBookmark(b);
                }
            });
            setSelectedIds(new Set());
            setIsEditMode(false);
        }
        setShowConfirm(false);
    };

    const cancelDelete = () => {
        setBookmarkToDelete(null);
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
                                : t('bookmarks.count', { count: filteredBookmarks.length })}
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

            {!isEditMode && (
                <div style={{ position: 'relative', marginBottom: '32px' }}>
                    <Search size={20} style={{
                        position: 'absolute', left: '20px', top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--secondary-text)',
                        opacity: 0.6
                    }} />
                    <input
                        type="text"
                        placeholder={t('bookmarks.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '18px 20px 18px 56px',
                            borderRadius: '24px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--card-bg)',
                            fontSize: '1rem',
                            fontWeight: 500,
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                    />
                </div>
            )}

            {isEditMode && filteredBookmarks.length > 0 && (
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
                    {filteredBookmarks.length === 0 ? (
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
                        filteredBookmarks.map(bookmark => {
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
                                                    onClick={(e) => handleDelete(bookmark, e)}
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
                                        <motion.div
                                            layout="position"
                                            style={{ position: 'relative' }}
                                        >
                                            <p
                                                id={`text-${bookmark.id}`}
                                                style={{
                                                    fontSize: '1.15rem',
                                                    lineHeight: '1.7',
                                                    color: 'var(--text-color)',
                                                    fontWeight: 500,
                                                    fontFamily: 'var(--font-serif)',
                                                    display: '-webkit-box',
                                                    WebkitBoxOrient: 'vertical',
                                                    WebkitLineClamp: expandedIds.has(bookmark.id) ? 'unset' : 3,
                                                    overflow: 'hidden',
                                                    marginBottom: expandedIds.has(bookmark.id) || truncatableIds.has(bookmark.id) ? '10px' : '0',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                {text}
                                            </p>
                                            {(expandedIds.has(bookmark.id) || truncatableIds.has(bookmark.id)) && (
                                                <button
                                                    onClick={(e) => toggleExpand(bookmark.id, e)}
                                                    style={{
                                                        background: 'none', border: 'none', padding: '4px 0',
                                                        color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.9rem',
                                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                                        opacity: 0.8
                                                    }}
                                                >
                                                    {expandedIds.has(bookmark.id) ? t('common.collapse') : t('common.expand')}
                                                </button>
                                            )}
                                        </motion.div>
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

            {/* Premium Confirmation Dialog */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000,
                            padding: '24px'
                        }}
                        onClick={cancelDelete}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--bg-color)',
                                padding: '40px 32px',
                                borderRadius: '36px',
                                maxWidth: '420px',
                                width: '100%',
                                textAlign: 'center',
                                boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)',
                                border: '1px solid var(--border-color)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: '-100px', left: '-100px',
                                width: '200px', height: '200px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                filter: 'blur(60px)', borderRadius: '50%', zIndex: 0
                            }} />

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '28px',
                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)',
                                    color: '#ef4444',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 28px',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.2)'
                                }}>
                                    <AlertTriangle size={40} strokeWidth={2.5} />
                                </div>

                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 900,
                                    marginBottom: '16px',
                                    color: 'var(--text-color)',
                                    letterSpacing: '-0.5px'
                                }}>
                                    {bookmarkToDelete ? t('bookmarks.delete_confirm', { count: 1 }) : t('bookmarks.delete_confirm', { count: selectedIds.size })}
                                </h3>

                                <p style={{
                                    color: 'var(--secondary-text)',
                                    marginBottom: '36px',
                                    lineHeight: 1.6,
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}>
                                    {bookmarkToDelete ? t('bookmarks.delete_desc_single') : t('bookmarks.delete_desc_multi', { count: selectedIds.size })}
                                </p>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={cancelDelete}
                                        style={{
                                            flex: 1, padding: '16px', borderRadius: '18px',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text-color)',
                                            fontWeight: 800,
                                            fontSize: '1rem',
                                            border: '1px solid var(--border-color)',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {t('bookmarks.cancel')}
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        style={{
                                            flex: 1.2, padding: '16px', borderRadius: '18px',
                                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                            color: 'white',
                                            fontWeight: 800,
                                            fontSize: '1rem',
                                            border: 'none',
                                            boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {t('bookmarks.confirm')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Bookmarks;

