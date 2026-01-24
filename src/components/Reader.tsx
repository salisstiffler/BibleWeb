import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bookmark, BookmarkCheck, Share2, ChevronDown, BookOpen, ChevronLeft, ChevronRight, X, Volume2, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Reader: React.FC = () => {
    const {
        toggleBookmark, isBookmarked,
        bibleData, isLoadingBible,
        highlights, setHighlight,
        notes, saveNote,
        speak, stopSpeaking, isSpeaking, currentSpeakingId,
        isAutoPlaying, setIsAutoPlaying,
        lastRead, setLastRead,
        continuousReading
    } = useAppContext();

    const [currentBookIndex, setCurrentBookIndex] = useState(lastRead.bookIndex);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(lastRead.chapterIndex);
    const [showSelector, setShowSelector] = useState(false);
    const [activeVerseId, setActiveVerseId] = useState<string | null>(null);
    const [noteText, setNoteText] = useState("");

    const currentBook = bibleData[currentBookIndex];
    const currentChapter = currentBook?.chapters[currentChapterIndex] || [];

    // Sync state to lastRead
    useEffect(() => {
        if (currentBookIndex !== lastRead.bookIndex || currentChapterIndex !== lastRead.chapterIndex) {
            setLastRead({ bookIndex: currentBookIndex, chapterIndex: currentChapterIndex });
        }
    }, [currentBookIndex, currentChapterIndex]);

    // Scroll to specific verse if requested
    useEffect(() => {
        if (!isLoadingBible && lastRead.verseNum) {
            const timer = setTimeout(() => {
                const element = document.getElementById(`verse-${lastRead.verseNum}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Provide a visual cue
                    element.classList.add('jump-highlight');
                    setTimeout(() => element.classList.remove('jump-highlight'), 2000);

                    // Clear the verseNum after jumping so it doesn't jump again
                    setLastRead({ ...lastRead, verseNum: undefined });
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isLoadingBible, lastRead.verseNum]);

    // Auto-scroll when TTS is playing
    useEffect(() => {
        if (isSpeaking && currentSpeakingId) {
            // currentSpeakingId format: "Book Chapter:Verse"
            const [_, position] = currentSpeakingId.split(' ');
            if (position) {
                const [chapter, verse] = position.split(':');
                // Only scroll if it's the current chapter we're looking at
                if (parseInt(chapter) === currentChapterIndex + 1) {
                    const element = document.getElementById(`verse-${verse}`);
                    if (element) {
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                }
            }
        }
    }, [isSpeaking, currentSpeakingId, currentChapterIndex]);

    const [dailyVerse, setDailyVerse] = useState({ text: "起初，神创造天地。", book: "创世记", chapter: 1, verse: 1 });

    useEffect(() => {
        if (bibleData.length > 0) {
            const bookIdx = Math.floor(Math.random() * bibleData.length);
            const book = bibleData[bookIdx];
            const chapterIdx = Math.floor(Math.random() * book.chapters.length);
            const chapter = book.chapters[chapterIdx];
            const verseIdx = Math.floor(Math.random() * chapter.length);
            setDailyVerse({
                text: chapter[verseIdx],
                book: book.name,
                chapter: chapterIdx + 1,
                verse: verseIdx + 1
            });
        }
    }, [bibleData]);

    const handleShare = (text: string, id: string) => {
        if (navigator.share) {
            navigator.share({
                title: '分享经文',
                text: `${id} - ${text}`,
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(`${id} - ${text}`);
            alert('经文已复制到剪贴板');
        }
    };

    const handlePrevChapter = () => {
        stopSpeaking();
        if (currentChapterIndex > 0) {
            setCurrentChapterIndex(currentChapterIndex - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentBookIndex > 0) {
            const prevBookIdx = currentBookIndex - 1;
            const prevBook = bibleData[prevBookIdx];
            setCurrentBookIndex(prevBookIdx);
            setCurrentChapterIndex(prevBook.chapters.length - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNextChapter = () => {
        if (currentChapterIndex < currentBook.chapters.length - 1) {
            setCurrentChapterIndex(currentChapterIndex + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentBookIndex < bibleData.length - 1) {
            setCurrentBookIndex(currentBookIndex + 1);
            setCurrentChapterIndex(0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Auto-advance to next chapter if autoplaying
    useEffect(() => {
        if (isAutoPlaying && !isSpeaking) {
            playVerse(0);
        }
    }, [currentChapterIndex, currentBookIndex]);

    const playVerse = (index: number) => {
        if (index >= currentChapter.length) {
            if (currentChapterIndex < currentBook.chapters.length - 1 || currentBookIndex < bibleData.length - 1) {
                // Chapter finished, start next one
                handleNextChapter();
            } else {
                setIsAutoPlaying(false);
                stopSpeaking();
            }
            return;
        }

        const text = currentChapter[index];
        const verseId = `${currentBook.name} ${currentChapterIndex + 1}:${index + 1}`;

        speak(text, verseId, () => {
            // Only continue if still in autoplay mode
            // We use a small timeout to avoid immediate state conflict
            setTimeout(() => {
                // If we are still in this chapter, play next
                if (index + 1 < currentChapter.length) {
                    playVerse(index + 1);
                } else {
                    // Last verse, trigger next chapter logic
                    playVerse(index + 1);
                }
            }, 100);
        });
    };

    const toggleChapterPlay = () => {
        if (isAutoPlaying) {
            setIsAutoPlaying(false);
            stopSpeaking();
        } else {
            setIsAutoPlaying(true);
            playVerse(0);
        }
    };

    const openNoteEditor = (verseId: string) => {
        setActiveVerseId(verseId === activeVerseId ? null : verseId);
        setNoteText(notes[verseId] || "");
    };

    if (isLoadingBible) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>正在加载圣经内容...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="reader-container"
            style={{ position: 'relative', paddingBottom: '100px' }}
        >
            <div style={{
                padding: '24px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, var(--primary-color) 0%, #a5b4fc 100%)',
                color: 'white',
                marginBottom: '32px',
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
            }}>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '12px', fontWeight: 600 }}>今日灵修 / Daily Verse</div>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '16px' }}>“{dailyVerse.text}”</p>
                <div style={{ fontSize: '0.875rem', textAlign: 'right', fontWeight: 600 }}>— {dailyVerse.book} {dailyVerse.chapter}:{dailyVerse.verse}</div>
            </div>

            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', position: 'relative' }}>
                <button
                    onClick={() => setShowSelector(!showSelector)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        fontWeight: 700,
                        fontSize: '1rem',
                        flex: 1
                    }}
                >
                    <BookOpen size={20} color="var(--primary-color)" />
                    <span>{currentBook.name} 第 {currentChapterIndex + 1} 章</span>
                    <ChevronDown size={18} style={{ marginLeft: 'auto' }} />
                </button>

                <AnimatePresence>
                    {showSelector && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: 'var(--bg-color)',
                                zIndex: 1000,
                                marginTop: '8px', // Changed from -16px to 8px
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                maxHeight: '400px',
                                overflow: 'hidden',
                                display: 'flex'
                            }}
                        >
                            <div style={{ flex: 1.5, overflowY: 'auto', borderRight: '1px solid var(--border-color)', padding: '8px' }}>
                                {bibleData.map((book, idx) => (
                                    <button
                                        key={book.name}
                                        onClick={() => {
                                            stopSpeaking();
                                            setCurrentBookIndex(idx);
                                            setCurrentChapterIndex(0);
                                        }}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '10px',
                                            textAlign: 'left',
                                            borderRadius: '8px',
                                            backgroundColor: currentBookIndex === idx ? 'var(--card-bg)' : 'transparent',
                                            color: currentBookIndex === idx ? 'var(--primary-color)' : 'inherit',
                                            fontWeight: currentBookIndex === idx ? 700 : 400
                                        }}
                                    >
                                        {book.name}
                                    </button>
                                ))}
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', alignContent: 'start' }}>
                                {currentBook.chapters.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            stopSpeaking();
                                            setCurrentChapterIndex(idx);
                                            setShowSelector(false);
                                        }}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '8px',
                                            backgroundColor: currentChapterIndex === idx ? 'var(--primary-color)' : 'var(--card-bg)',
                                            color: currentChapterIndex === idx ? 'white' : 'inherit'
                                        }}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="verses-list">
                {currentChapter.map((text, index) => {
                    const verseNum = index + 1;
                    const verseId = `${currentBook.name} ${currentChapterIndex + 1}:${verseNum}`;
                    const bookmarked = isBookmarked(verseId);
                    const highlightColor = highlights[verseId];
                    const hasNote = !!notes[verseId];
                    const isBeingRead = currentSpeakingId === verseId;

                    return (
                        <div key={index} id={`verse-${verseNum}`} style={{ marginBottom: '24px' }}>
                            <div className={`verse ${bookmarked ? 'bookmarked' : ''} ${isBeingRead ? 'being-read' : ''}`}>
                                <span className="verse-number">{verseNum}</span>
                                <div
                                    className="verse-text"
                                    data-highlight={highlightColor}
                                    onClick={() => openNoteEditor(verseId)}
                                    style={{
                                        cursor: 'pointer',
                                        color: isBeingRead ? 'var(--primary-color)' : 'inherit',
                                        fontWeight: isBeingRead ? 600 : 400,
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {text}
                                    {hasNote && <span className="note-indicator">记</span>}
                                </div>
                                <div className="verse-actions">
                                    <button
                                        onClick={() => {
                                            if (isBeingRead) {
                                                stopSpeaking();
                                            } else {
                                                if (continuousReading) {
                                                    setIsAutoPlaying(true);
                                                    playVerse(index);
                                                } else {
                                                    speak(text, verseId);
                                                }
                                            }
                                        }}
                                        className={`bookmark-btn ${isBeingRead ? 'speaking' : ''}`}
                                        style={{ color: isBeingRead ? 'var(--primary-color)' : 'var(--secondary-text)' }}
                                    >
                                        <Volume2 size={18} className={isBeingRead ? 'pulse-animation' : ''} />
                                    </button>
                                    <button onClick={() => toggleBookmark(verseId)} className="bookmark-btn" style={{ color: bookmarked ? 'var(--primary-color)' : 'var(--secondary-text)' }}>
                                        {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                                    </button>
                                    <button onClick={() => handleShare(text, verseId)} className="bookmark-btn">
                                        <Share2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {activeVerseId === verseId && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="note-editor"
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                            <div className="highlight-tools">
                                                {['yellow', 'green', 'blue', 'red'].map(color => (
                                                    <div
                                                        key={color}
                                                        className={`color-dot ${highlightColor === color ? 'active' : ''}`}
                                                        style={{ backgroundColor: color === 'yellow' ? '#fde047' : color === 'green' ? '#4ade80' : color === 'blue' ? '#60a5fa' : '#f87171' }}
                                                        onClick={() => setHighlight(verseId, highlightColor === color ? null : color)}
                                                    />
                                                ))}
                                            </div>
                                            <button onClick={() => setActiveVerseId(null)}><X size={18} /></button>
                                        </div>
                                        <textarea
                                            className="note-textarea"
                                            placeholder="添加笔记或注释..."
                                            value={noteText}
                                            onChange={(e) => {
                                                setNoteText(e.target.value);
                                                saveNote(verseId, e.target.value);
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', padding: '20px 0', borderTop: '1px solid var(--border-color)' }}>
                <button onClick={handlePrevChapter} disabled={currentBookIndex === 0 && currentChapterIndex === 0} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', opacity: (currentBookIndex === 0 && currentChapterIndex === 0) ? 0.3 : 1 }}>
                    <ChevronLeft size={20} /> 上一章
                </button>
                <button onClick={handleNextChapter} disabled={bibleData.length > 0 && currentBookIndex === bibleData.length - 1 && currentChapterIndex === currentBook.chapters.length - 1} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', opacity: (bibleData.length > 0 && currentBookIndex === bibleData.length - 1 && currentChapterIndex === currentBook.chapters.length - 1) ? 0.3 : 1 }}>
                    下一章 <ChevronRight size={20} />
                </button>
            </div>

            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleChapterPlay}
                style={{
                    position: 'fixed',
                    bottom: '100px',
                    right: '24px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '30px',
                    backgroundColor: isAutoPlaying ? '#ef4444' : 'var(--primary-color)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
                    zIndex: 100,
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                {isAutoPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />}
            </motion.button>
        </motion.div>
    );
};

export default Reader;
