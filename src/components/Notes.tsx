import React, { useState, useEffect } from 'react';
import { useAppContext, type BibleBook, type RangeNote } from '../context/AppContext';
import { Edit2, Trash2, Search, BookOpen, PenTool, X, Square, CheckSquare, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Notes: React.FC = () => {
    const { notes, saveNote, bibleData, isLoadingBible, setLastRead, t, language } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempText, setTempText] = useState("");

    // Batch selection state
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [truncatableIds, setTruncatableIds] = useState<Set<string>>(new Set());
    const [showConfirm, setShowConfirm] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<RangeNote | null>(null);

    const navigate = useNavigate();


    const getVerseInfo = (note: RangeNote) => {
        if (isLoadingBible) return { text: '...', location: note.id };
        try {
            const book = bibleData.find((b: BibleBook) => b.id === note.bookId || b.name === note.bookId);
            if (!book) return { text: '', location: note.id };

            const chapter = book.chapters[note.chapter - 1];
            if (!chapter) return { text: '', location: note.id };

            // Get text for the range
            let text = '';
            if (note.startVerse === note.endVerse) {
                text = chapter[note.startVerse - 1] || '';
            } else {
                const verses = [];
                for (let i = note.startVerse; i <= note.endVerse; i++) {
                    if (chapter[i - 1]) verses.push(chapter[i - 1]);
                }
                text = verses.join(' ');
            }

            // Display localized name
            const displayLocation = note.startVerse === note.endVerse
                ? `${book.name} ${note.chapter}:${note.startVerse}`
                : `${book.name} ${note.chapter}:${note.startVerse}-${note.endVerse}`;

            return { text, location: displayLocation };
        } catch (e) {
            return { text: '', location: note.id };
        }
    };

    const handleJump = (note: RangeNote) => {
        if (isEditMode) {
            toggleSelect(note.id);
            return;
        }
        const bookIndex = bibleData.findIndex(b => b.id === note.bookId || b.name === note.bookId);
        const chapterIndex = note.chapter - 1;
        const verseNum = note.startVerse;

        if (bookIndex !== -1) {
            setLastRead({ bookIndex, chapterIndex, verseNum });
            navigate('/');
        }
    };

    const filteredNotes = notes.filter(note => {
        const { location } = getVerseInfo(note);
        return location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.id.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Detect truncation on mount and when content changes
    useEffect(() => {
        const checkTruncation = () => {
            const newTruncatable = new Set<string>();
            filteredNotes.forEach(n => {
                const el = document.getElementById(`note-text-${n.id}`);
                if (el) {
                    // scrollHeight is the full height of the content
                    // clientHeight is the height of the visible area (clamped to 3 lines)
                    if (el.scrollHeight > el.clientHeight + 5) {
                        newTruncatable.add(n.id);
                    }
                }
            });
            setTruncatableIds(newTruncatable);
        };

        // Use ResizeObserver for more reliable detection
        const observer = new ResizeObserver(() => {
            checkTruncation();
        });

        // Observe all note text elements
        filteredNotes.forEach(n => {
            const el = document.getElementById(`note-text-${n.id}`);
            if (el) observer.observe(el);
        });

        // Initial check with a bit of delay for rendering
        const timer = setTimeout(checkTruncation, 500);

        return () => {
            observer.disconnect();
            clearTimeout(timer);
        };
    }, [filteredNotes, isLoadingBible, expandedIds, language, bibleData]);

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
        if (selectedIds.size === filteredNotes.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredNotes.map(n => n.id)));
        }
    };

    const handleReverseSelect = () => {
        const newSelected = new Set<string>();
        filteredNotes.forEach(n => {
            if (!selectedIds.has(n.id)) {
                newSelected.add(n.id);
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

    const startEditing = (note: RangeNote) => {
        setEditingId(note.id);
        setTempText(note.text);
    };

    const handleSave = (note: RangeNote) => {
        saveNote(note, tempText);
        setEditingId(null);
    };

    const handleDelete = (note: RangeNote, e: React.MouseEvent) => {
        e.stopPropagation();
        setNoteToDelete(note);
        setShowConfirm(true);
    };

    const confirmDelete = () => {
        if (noteToDelete) {
            saveNote(noteToDelete, "");
            setNoteToDelete(null);
        } else if (selectedIds.size > 0) {
            notes.forEach(note => {
                if (selectedIds.has(note.id)) {
                    saveNote(note, "");
                }
            });
            setSelectedIds(new Set());
            setIsEditMode(false);
        }
        setShowConfirm(false);
    };

    const cancelDelete = () => {
        setNoteToDelete(null);
        setShowConfirm(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="notes-view"
            style={{ paddingBottom: '120px' }}
        >
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '56px', height: '56px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 8px 20px -5px rgba(16, 185, 129, 0.4)'
                    }}>
                        <PenTool size={28} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
                            {t('notes.title')}
                        </h2>
                        <p style={{ color: 'var(--secondary-text)', fontWeight: 600 }}>
                            {isEditMode
                                ? t('notes.selected_count', { count: selectedIds.size })
                                : t('notes.count', { count: filteredNotes.length })}
                        </p>
                    </div>
                </div>

                {filteredNotes.length > 0 && (
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
                                <X size={18} /> {t('notes.cancel')}
                            </button>
                        ) : (
                            <button
                                onClick={() => { setIsEditMode(true); setEditingId(null); }}
                                style={{
                                    padding: '10px 16px', borderRadius: '14px',
                                    background: 'var(--card-bg)', color: '#10b981',
                                    fontWeight: 700, fontSize: '0.9rem'
                                }}
                            >
                                {t('notes.edit')}
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
                        placeholder={t('notes.search_placeholder')}
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

            {isEditMode && filteredNotes.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: 'flex', gap: '12px', marginBottom: '24px',
                        padding: '12px', background: 'var(--card-bg)', borderRadius: '16px'
                    }}
                >
                    <button onClick={handleSelectAll} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: 'var(--bg-color)', fontWeight: 700, fontSize: '0.85rem' }}>
                        {t('notes.select_all')}
                    </button>
                    <button onClick={handleReverseSelect} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: 'var(--bg-color)', fontWeight: 700, fontSize: '0.85rem' }}>
                        {t('notes.reverse_select')}
                    </button>
                </motion.div>
            )}

            <div className="notes-list">
                <AnimatePresence>
                    {filteredNotes.length === 0 ? (
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
                                {t('notes.empty')}
                            </p>
                        </motion.div>
                    ) : (
                        filteredNotes.map(note => {
                            const { text: verseText, location } = getVerseInfo(note);
                            const isSelected = selectedIds.has(note.id);
                            return (
                                <motion.div
                                    layout
                                    key={note.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    whileHover={!isEditMode ? { y: -4, boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)' } : {}}
                                    onClick={() => handleJump(note)}
                                    style={{
                                        padding: '28px',
                                        backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.05)' : 'var(--card-bg)',
                                        borderRadius: '32px',
                                        marginBottom: '24px',
                                        border: isSelected ? '2px solid #10b981' : '1px solid var(--border-color)',
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
                                                ? <CheckSquare size={24} color="#10b981" fill="rgba(16, 185, 129, 0.1)" />
                                                : <Square size={24} color="var(--border-color)" />
                                            }
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                                            <div style={{
                                                fontSize: '0.85rem', fontWeight: 800,
                                                color: '#059669', background: 'rgba(16, 185, 129, 0.1)',
                                                padding: '6px 14px', borderRadius: '12px',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {location}
                                            </div>
                                            {!isEditMode && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); editingId === note.id ? handleSave(note) : startEditing(note); }}
                                                        style={{
                                                            width: '36px', height: '36px', borderRadius: '12px',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: editingId === note.id ? '#10b981' : 'var(--secondary-text)',
                                                            background: editingId === note.id ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-color)',
                                                            border: '1px solid var(--border-color)'
                                                        }}
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(note, e)}
                                                        style={{
                                                            width: '36px', height: '36px', borderRadius: '12px',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)'
                                                        }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{
                                            padding: '16px',
                                            borderLeft: '4px solid #10b981',
                                            backgroundColor: 'var(--bg-color)',
                                            marginBottom: '20px',
                                            borderRadius: '0 16px 16px 0',
                                            fontSize: '1rem',
                                            fontStyle: 'italic',
                                            color: 'var(--secondary-text)',
                                            fontFamily: 'var(--font-serif)',
                                            lineHeight: 1.6
                                        }}>
                                            {verseText}
                                        </div>

                                        {editingId === note.id ? (
                                            <textarea
                                                className="note-textarea"
                                                value={tempText}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => setTempText(e.target.value)}
                                                autoFocus
                                                style={{
                                                    width: '100%',
                                                    minHeight: '140px',
                                                    padding: '20px',
                                                    borderRadius: '20px',
                                                    border: '2px solid #10b981',
                                                    backgroundColor: 'var(--bg-color)',
                                                    fontSize: '1.1rem',
                                                    fontFamily: 'inherit',
                                                    resize: 'vertical',
                                                    color: 'var(--text-color)',
                                                    outline: 'none',
                                                    boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.1)'
                                                }}
                                            />
                                        ) : (
                                            <motion.div layout="position" style={{ position: 'relative' }}>
                                                <p
                                                    id={`note-text-${note.id}`}
                                                    style={{
                                                        fontSize: '1.15rem', lineHeight: 1.7,
                                                        color: 'var(--text-color)',
                                                        whiteSpace: 'pre-wrap',
                                                        fontWeight: 500,
                                                        display: '-webkit-box',
                                                        WebkitBoxOrient: 'vertical',
                                                        WebkitLineClamp: expandedIds.has(note.id) ? 'unset' : 3,
                                                        overflow: 'hidden',
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                    {note.text}
                                                </p>
                                                {(expandedIds.has(note.id) || truncatableIds.has(note.id)) && (
                                                    <button
                                                        onClick={(e) => toggleExpand(note.id, e)}
                                                        style={{
                                                            background: 'none', border: 'none', padding: '4px 0',
                                                            color: '#10b981', fontWeight: 800, fontSize: '0.9rem',
                                                            cursor: 'pointer', marginTop: '8px',
                                                            opacity: 0.8
                                                        }}
                                                    >
                                                        {expandedIds.has(note.id) ? t('common.collapse') : t('common.expand')}
                                                    </button>
                                                )}
                                            </motion.div>
                                        )}
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
                            {t('notes.selected_count', { count: selectedIds.size })}
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
                            <Trash2 size={16} /> {t('notes.confirm')}
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
                            {/* Decorative background glass effect */}
                            <div style={{
                                position: 'absolute', top: '-100px', left: '-100px',
                                width: '200px', height: '200px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                filter: 'blur(60px)', borderRadius: '50%', zIndex: 0
                            }} />

                            <div style={{
                                position: 'relative', zIndex: 1
                            }}>
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
                                    {noteToDelete ? t('notes.delete_confirm', { count: 1 }) : t('notes.delete_confirm', { count: selectedIds.size })}
                                </h3>

                                <p style={{
                                    color: 'var(--secondary-text)',
                                    marginBottom: '36px',
                                    lineHeight: 1.6,
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}>
                                    {noteToDelete ? '这条笔记将被永久删除，无法恢复。' : `这 ${selectedIds.size} 条笔记及其包含的灵修感悟将被永久移除。`}
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
                                        {t('common.cancel')}
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
                                        {t('notes.confirm')}
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

export default Notes;

