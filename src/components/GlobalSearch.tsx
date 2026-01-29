import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, BookOpen, ChevronRight, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
    bookIndex: number;
    chapterIndex: number;
    verseIndex: number;
    bookName: string;
    chapterNum: number;
    verseNum: number;
    text: string;
}

const GlobalSearch: React.FC = () => {
    const { bibleData, isLoadingBible, setLastRead, t, accentColor } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

    const handleSearch = useCallback(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term || term.length < 1) {
            setResults([]);
            return;
        }

        setIsSearching(true);

        // Use setTimeout to allow UI to show searching state
        setTimeout(() => {
            const searchResults: SearchResult[] = [];
            bibleData.forEach((book, bookIndex) => {
                book.chapters.forEach((chapter, chapterIndex) => {
                    chapter.forEach((verse, verseIndex) => {
                        if (verse.toLowerCase().includes(term)) {
                            searchResults.push({
                                bookIndex,
                                chapterIndex,
                                verseIndex,
                                bookName: book.name,
                                chapterNum: chapterIndex + 1,
                                verseNum: verseIndex + 1,
                                text: verse
                            });
                        }
                    });
                });
            });
            setResults(searchResults);
            setIsSearching(false);
        }, 100);
    }, [searchTerm, bibleData]);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, handleSearch]);

    const handleJump = (result: SearchResult) => {
        setLastRead({
            bookIndex: result.bookIndex,
            chapterIndex: result.chapterIndex,
            verseNum: result.verseNum
        });
        navigate('/');
    };

    const highlightText = (text: string, term: string) => {
        if (!term.trim()) return text;
        const parts = text.split(new RegExp(`(${term})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === term.toLowerCase() ? (
                        <span key={i} style={{ color: accentColor, fontWeight: 800, backgroundColor: `${accentColor}15`, padding: '0 2px', borderRadius: '4px' }}>
                            {part}
                        </span>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </span>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="search-view"
            style={{ paddingBottom: '120px' }}
        >
            <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                    width: '56px', height: '56px',
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${accentColor} 0%, #818cf8 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 8px 20px -5px rgba(99, 102, 241, 0.4)'
                }}>
                    <Search size={28} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
                        {t('globalSearch.title')}
                    </h2>
                    <p style={{ color: 'var(--secondary-text)', fontWeight: 600 }}>
                        {t('globalSearch.subtitle')}
                    </p>
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
                    placeholder={t('globalSearch.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '18px 56px 18px 56px',
                        borderRadius: '24px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--card-bg)',
                        fontSize: '1rem',
                        fontWeight: 500,
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        style={{
                            position: 'absolute', right: '16px', top: '50%',
                            transform: 'translateY(-50%)',
                            width: '32px', height: '32px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--bg-color)', color: 'var(--secondary-text)',
                            border: 'none', opacity: 0.6
                        }}
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="search-results">
                <AnimatePresence mode="wait">
                    {isLoadingBible || isSearching ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ textAlign: 'center', padding: '60px' }}
                        >
                            <Loader2 size={40} className="animate-spin" style={{ color: accentColor, margin: '0 auto 16px', opacity: 0.5 }} />
                            <p style={{ color: 'var(--secondary-text)', fontWeight: 600 }}>{t('globalSearch.searching')}</p>
                        </motion.div>
                    ) : searchTerm && results.length === 0 ? (
                        <motion.div
                            key="empty"
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
                            <p style={{ fontWeight: 600 }}>{t('globalSearch.empty')}</p>
                        </motion.div>
                    ) : results.length > 0 ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div style={{ marginBottom: '20px', padding: '0 8px' }}>
                                <span style={{
                                    fontSize: '0.9rem', fontWeight: 700,
                                    color: accentColor, background: `${accentColor}15`,
                                    padding: '6px 14px', borderRadius: '12px'
                                }}>
                                    {t('globalSearch.count', { count: results.length })}
                                </span>
                            </div>
                            {results.map((result, idx) => (
                                <motion.div
                                    key={`${result.bookIndex}-${result.chapterIndex}-${result.verseIndex}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                                    onClick={() => handleJump(result)}
                                    style={{
                                        padding: '24px',
                                        backgroundColor: 'var(--card-bg)',
                                        borderRadius: '24px',
                                        marginBottom: '16px',
                                        border: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        transition: 'all 0.2s'
                                    }}
                                    whileHover={{ y: -4, boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)', borderColor: accentColor }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{
                                            fontWeight: 800, fontSize: '0.9rem', color: accentColor,
                                            letterSpacing: '0.5px'
                                        }}>
                                            {t('globalSearch.result_format', {
                                                book: result.bookName,
                                                chapter: result.chapterNum,
                                                verse: result.verseNum
                                            })}
                                        </span>
                                        <ChevronRight size={18} style={{ color: 'var(--border-color)' }} />
                                    </div>
                                    <p style={{
                                        fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text-color)',
                                        fontFamily: 'var(--font-serif)', fontWeight: 500
                                    }}>
                                        {highlightText(result.text, searchTerm)}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default GlobalSearch;
