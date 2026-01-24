import React from 'react';
import { useAppContext, type BibleBook } from '../context/AppContext';
import { Trash2, BookMarked, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Bookmarks: React.FC = () => {
    const { bookmarks, toggleBookmark, bibleData, isLoadingBible, setLastRead } = useAppContext();
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bookmarks-view"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookMarked size={24} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>我的收藏</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--secondary-text)' }}>已收藏 {bookmarks.length} 条经文</p>
                </div>
            </div>

            <div className="bookmarks-list">
                <AnimatePresence>
                    {bookmarks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ textAlign: 'center', marginTop: '60px', color: 'var(--secondary-text)', padding: '40px', backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1px dashed var(--border-color)' }}
                        >
                            <p>暂无书签，快去阅读吧</p>
                        </motion.div>
                    ) : (
                        bookmarks.map(id => (
                            <motion.div
                                key={id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => handleJump(id)}
                                style={{
                                    padding: '20px',
                                    backgroundColor: 'var(--card-bg)',
                                    borderRadius: '20px',
                                    marginBottom: '16px',
                                    border: '1px solid var(--border-color)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                }}
                                whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.9rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>{id}</span>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleBookmark(id); }}
                                            style={{ color: '#ef4444', padding: '4px' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <ChevronRight size={18} color="var(--secondary-text)" />
                                    </div>
                                </div>
                                <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--main-text)' }}>{getVerseText(id)}</p>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Bookmarks;
