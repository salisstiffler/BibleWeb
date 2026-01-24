import React, { useState } from 'react';
import { useAppContext, type BibleBook } from '../context/AppContext';
import { Edit2, Trash2, Search, BookOpen, ChevronRight, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Notes: React.FC = () => {
    const { notes, saveNote, bibleData, isLoadingBible, setLastRead, language } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempText, setTempText] = useState("");
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

    const filteredNotes = Object.entries(notes).filter(([id, text]) => {
        const { location } = getVerseInfo(id);
        return location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            id.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const startEditing = (id: string, text: string) => {
        setEditingId(id);
        setTempText(text);
    };

    const handleSave = (id: string) => {
        saveNote(id, tempText);
        setEditingId(null);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(language === 'en' ? "Delete this note?" : "确定删除这条笔记吗？")) {
            saveNote(id, "");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="notes-view"
            style={{ paddingBottom: '40px' }}
        >
            <header style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
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
                            {language === 'en' ? 'Spiritual Notes' : '灵修笔记'}
                        </h2>
                        <p style={{ color: 'var(--secondary-text)', fontWeight: 600 }}>
                            {language === 'en' ? `Reflecting on ${filteredNotes.length} insights` : `已记录 ${filteredNotes.length} 段感悟`}
                        </p>
                    </div>
                </div>
            </header>

            <div style={{ position: 'relative', marginBottom: '32px' }}>
                <Search size={20} style={{
                    position: 'absolute', left: '20px', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--secondary-text)',
                    opacity: 0.6
                }} />
                <input
                    type="text"
                    placeholder={language === 'en' ? "Search notes..." : "搜索您的笔记或感悟..."}
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
                                {language === 'en' ? 'No notes found.' : '笔尖未动，感悟从读经开始'}
                            </p>
                        </motion.div>
                    ) : (
                        filteredNotes.map(([id, text]) => {
                            const { text: verseText, location } = getVerseInfo(id);
                            return (
                                <motion.div
                                    layout
                                    key={id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    whileHover={{ y: -4, boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)' }}
                                    onClick={() => handleJump(id)}
                                    style={{
                                        padding: '28px',
                                        backgroundColor: 'var(--card-bg)',
                                        borderRadius: '32px',
                                        marginBottom: '24px',
                                        border: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                                        <div style={{
                                            fontSize: '0.85rem', fontWeight: 800,
                                            color: '#059669', background: 'rgba(16, 185, 129, 0.1)',
                                            padding: '6px 14px', borderRadius: '12px',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {location}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); editingId === id ? handleSave(id) : startEditing(id, text); }}
                                                style={{
                                                    width: '36px', height: '36px', borderRadius: '12px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: editingId === id ? '#10b981' : 'var(--secondary-text)',
                                                    background: editingId === id ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-color)',
                                                    border: '1px solid var(--border-color)'
                                                }}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(id, e)}
                                                style={{
                                                    width: '36px', height: '36px', borderRadius: '12px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)'
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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

                                    {editingId === id ? (
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
                                        <p style={{
                                            fontSize: '1.15rem', lineHeight: 1.7,
                                            color: 'var(--text-color)',
                                            whiteSpace: 'pre-wrap',
                                            fontWeight: 500
                                        }}>
                                            {text}
                                        </p>
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Notes;
