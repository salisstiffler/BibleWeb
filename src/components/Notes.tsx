import React, { useState } from 'react';
import { useAppContext, type BibleBook } from '../context/AppContext';
import { Edit2, Trash2, Search, BookOpen, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Notes: React.FC = () => {
    const { notes, saveNote, bibleData, isLoadingBible, setLastRead } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempText, setTempText] = useState("");
    const navigate = useNavigate();

    const getVerseText = (verseId: string) => {
        if (isLoadingBible) return '...';
        try {
            const spaceIdx = verseId.lastIndexOf(' ');
            const bookName = verseId.substring(0, spaceIdx);
            const [chapterPart, versePart] = verseId.substring(spaceIdx + 1).split(':');
            const chapterNum = parseInt(chapterPart);
            const verseNum = parseInt(versePart);

            const book = bibleData.find((b: BibleBook) => b.name === bookName);
            if (!book) return '';

            const chapter = book.chapters[chapterNum - 1];
            if (!chapter) return '';

            return chapter[verseNum - 1] || '';
        } catch (e) {
            return '';
        }
    };

    const handleJump = (verseId: string) => {
        const spaceIdx = verseId.lastIndexOf(' ');
        const bookName = verseId.substring(0, spaceIdx);
        const [chapterPart, versePart] = verseId.substring(spaceIdx + 1).split(':');

        const bookIndex = bibleData.findIndex(b => b.name === bookName);
        const chapterIndex = parseInt(chapterPart) - 1;
        const verseNum = parseInt(versePart);

        if (bookIndex !== -1) {
            setLastRead({ bookIndex, chapterIndex, verseNum });
            navigate('/');
        }
    };

    const filteredNotes = Object.entries(notes).filter(([id, text]) =>
        id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startEditing = (id: string, text: string) => {
        setEditingId(id);
        setTempText(text);
    };

    const handleSave = (id: string) => {
        saveNote(id, tempText);
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("确定删除这条笔记吗？")) {
            saveNote(id, "");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="notes-view"
        >
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>我的笔记 / Notes</h2>
                <p style={{ color: 'var(--secondary-text)' }}>回顾您的感悟与学习心得</p>
            </div>

            <div style={{ position: 'relative', marginBottom: '24px' }}>
                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-text)' }} />
                <input
                    type="text"
                    placeholder="搜索笔记..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--card-bg)',
                        fontSize: '1rem'
                    }}
                />
            </div>

            <div className="notes-list">
                {filteredNotes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1px dashed var(--border-color)' }}>
                        <BookOpen size={48} style={{ color: 'var(--border-color)', marginBottom: '16px' }} />
                        <p style={{ color: 'var(--secondary-text)' }}>暂无相关笔记</p>
                    </div>
                ) : (
                    filteredNotes.map(([id, text]) => (
                        <motion.div
                            layout
                            key={id}
                            style={{
                                padding: '24px',
                                backgroundColor: 'var(--card-bg)',
                                borderRadius: '20px',
                                marginBottom: '20px',
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleJump(id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-color)', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '6px 12px', borderRadius: '8px' }}>
                                    {id}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={(e) => { e.stopPropagation(); editingId === id ? handleSave(id) : startEditing(id, text); }} className="icon-btn" style={{ padding: '8px', color: editingId === id ? '#10b981' : 'var(--secondary-text)' }}>
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(id); }} className="icon-btn" style={{ padding: '8px', color: '#ef4444' }}>
                                        <Trash2 size={18} />
                                    </button>
                                    <ChevronRight size={18} color="var(--secondary-text)" style={{ marginLeft: '4px' }} />
                                </div>
                            </div>

                            <div style={{
                                padding: '12px',
                                borderLeft: '3px solid var(--primary-color)',
                                backgroundColor: 'var(--bg-color)',
                                marginBottom: '16px',
                                borderRadius: '0 8px 8px 0',
                                fontSize: '0.95rem',
                                fontStyle: 'italic',
                                color: 'var(--secondary-text)'
                            }}>
                                {getVerseText(id)}
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
                                        minHeight: '120px',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--primary-color)',
                                        backgroundColor: 'var(--bg-color)',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            ) : (
                                <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--main-text)', whiteSpace: 'pre-wrap' }}>
                                    {text}
                                </p>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

export default Notes;
