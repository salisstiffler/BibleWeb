import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bookmark, BookmarkCheck, Share2, ChevronDown, BookOpen, ChevronLeft, ChevronRight, X, Volume2, Play, Pause, Quote, Menu } from 'lucide-react';
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
        continuousReading,
        language,
        pauseOnManualSwitch
    } = useAppContext();

    const [currentBookIndex, setCurrentBookIndex] = useState(lastRead.bookIndex);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(lastRead.chapterIndex);
    const [showSelector, setShowSelector] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
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
                    element.classList.add('jump-highlight');
                    setTimeout(() => element.classList.remove('jump-highlight'), 2000);
                    setLastRead({ ...lastRead, verseNum: undefined });
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isLoadingBible, lastRead.verseNum]);

    // Auto-scroll when TTS is playing
    useEffect(() => {
        if (isSpeaking && currentSpeakingId) {
            const [_, position] = currentSpeakingId.split(' ');
            if (position) {
                const [chapter, verse] = position.split(':');
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
        if (pauseOnManualSwitch) {
            stopSpeaking();
        }
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
        if (pauseOnManualSwitch) {
            stopSpeaking();
        }
        if (currentChapterIndex < currentBook.chapters.length - 1) {
            setCurrentChapterIndex(currentChapterIndex + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentBookIndex < bibleData.length - 1) {
            setCurrentBookIndex(currentBookIndex + 1);
            setCurrentChapterIndex(0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (isAutoPlaying && !isSpeaking) {
            playVerse(0);
        }
    }, [currentChapterIndex, currentBookIndex]);

    const playVerse = (index: number) => {
        if (index >= currentChapter.length) {
            if (currentChapterIndex < currentBook.chapters.length - 1 || currentBookIndex < bibleData.length - 1) {
                handleNextChapter();
            } else {
                setIsAutoPlaying(false);
                stopSpeaking();
            }
            return;
        }

        const text = currentChapter[index];
        const verseId = `${currentBook.id} ${currentChapterIndex + 1}:${index + 1}`;

        speak(text, verseId, () => {
            setTimeout(() => {
                if (index + 1 < currentChapter.length) {
                    playVerse(index + 1);
                } else {
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
                <div className="pulse-animation" style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary-color)', borderRadius: '12px' }}></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="reader-container"
            style={{ paddingBottom: '120px', paddingTop: '76px' }}
        >
            {/* Daily Verse Card */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                style={{
                    padding: '30px',
                    borderRadius: '32px',
                    background: 'linear-gradient(135deg, var(--primary-color) 0%, #818cf8 50%, #6366f1 100%)',
                    color: 'white',
                    marginBottom: '40px',
                    boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.4)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Quote size={80} style={{ position: 'absolute', top: '-10px', left: '-10px', opacity: 0.1 }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {language === 'en' ? 'Daily Wisdom' : '今日灵修经文'}
                    </div>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.5, marginBottom: '24px', letterSpacing: '-0.3px' }}>
                        “{dailyVerse.text}”
                    </p>
                    <div style={{ fontSize: '0.95rem', textAlign: 'right', fontWeight: 700, opacity: 0.9 }}>
                        — {dailyVerse.book} {dailyVerse.chapter}:{dailyVerse.verse}
                    </div>
                </div>
            </motion.div>

            {/* Sticky Header Bar */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '800px',
                zIndex: 100,
                backgroundColor: 'rgba(var(--bg-rgb), 0.98)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderBottom: '1px solid var(--border-color)',
                padding: '14px 24px',
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
            }}>
                {/* Menu Button */}
                <button
                    onClick={() => setShowDrawer(true)}
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-color)',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        flexShrink: 0,
                        opacity: 0.8
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                        e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.opacity = '0.8';
                    }}
                >
                    <Menu size={24} strokeWidth={2.5} />
                </button>

                {/* App Title */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flex: 1
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--primary-color) 0%, #818cf8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 4px 12px -2px rgba(99, 102, 241, 0.3)'
                    }}>
                        <BookOpen size={18} strokeWidth={2.5} />
                    </div>
                    <span style={{
                        fontSize: '1.15rem',
                        fontWeight: 900,
                        letterSpacing: '-0.5px',
                        background: 'linear-gradient(135deg, var(--text-color) 0%, var(--primary-color) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        {language === 'en' ? 'Holy Read' : '圣经阅读'}
                    </span>
                </div>
            </div>

            {/* Chapter Selector */}
            <div style={{ marginBottom: '32px', position: 'relative', zIndex: 50 }}>
                <button

                    onClick={() => setShowSelector(!showSelector)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px 24px',
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '24px',
                        border: '1px solid var(--border-color)',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        width: '100%',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    <div style={{
                        width: '36px', height: '36px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--primary-color)'
                    }}>
                        <BookOpen size={20} />
                    </div>
                    <span style={{ flex: 1, textAlign: 'left' }}>
                        {language === 'en'
                            ? `${currentBook.name} • Ch. ${currentChapterIndex + 1}`
                            : `${currentBook.name} • 第 ${currentChapterIndex + 1} 章`}
                    </span>
                    <motion.div animate={{ rotate: showSelector ? 180 : 0 }}>
                        <ChevronDown size={22} style={{ opacity: 0.5 }} />
                    </motion.div>
                </button>

                <AnimatePresence>
                    {showSelector && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(20px)',
                                zIndex: 1000,
                                marginTop: '12px',
                                borderRadius: '28px',
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                                maxHeight: '420px',
                                overflow: 'hidden',
                                display: 'flex'
                            }}
                        >
                            <div style={{ flex: 1.4, overflowY: 'auto', borderRight: '1px solid var(--border-color)', padding: '12px' }}>
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
                                            padding: '12px 16px',
                                            textAlign: 'left',
                                            borderRadius: '14px',
                                            backgroundColor: currentBookIndex === idx ? 'var(--primary-color)' : 'transparent',
                                            color: currentBookIndex === idx ? 'white' : 'var(--text-color)',
                                            fontWeight: currentBookIndex === idx ? 800 : 500,
                                            fontSize: '0.95rem',
                                            marginBottom: '4px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {book.name}
                                    </button>
                                ))}
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', alignContent: 'start' }}>
                                {currentBook.chapters.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            stopSpeaking();
                                            setCurrentChapterIndex(idx);
                                            setShowSelector(false);
                                        }}
                                        style={{
                                            padding: '14px',
                                            borderRadius: '14px',
                                            backgroundColor: currentChapterIndex === idx ? 'var(--primary-color)' : 'var(--card-bg)',
                                            color: currentChapterIndex === idx ? 'white' : 'var(--text-color)',
                                            fontWeight: 800,
                                            fontSize: '1rem',
                                            transition: 'all 0.2s'
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

            {/* Verses List */}
            <div className="verses-list">
                {currentChapter.map((text, index) => {
                    const verseNum = index + 1;
                    const verseId = `${currentBook.id} ${currentChapterIndex + 1}:${verseNum}`;
                    const bookmarked = isBookmarked(verseId);
                    const highlightColor = highlights[verseId];
                    const hasNote = !!notes[verseId];
                    const isBeingRead = currentSpeakingId === verseId;

                    return (
                        <motion.div
                            key={index} id={`verse-${verseNum}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            style={{ marginBottom: '32px', position: 'relative' }}
                        >
                            <div className={`verse ${bookmarked ? 'bookmarked' : ''} ${isBeingRead ? 'being-read' : ''}`}
                                style={{ display: 'flex', gap: '16px', padding: '8px 0' }}>
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 900,
                                    color: isBeingRead ? 'var(--primary-color)' : 'var(--secondary-text)',
                                    minWidth: '24px',
                                    paddingTop: '6px'
                                }}>
                                    {verseNum}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div
                                        className="verse-text"
                                        data-highlight={highlightColor}
                                        onClick={() => openNoteEditor(verseId)}
                                        style={{
                                            cursor: 'pointer',
                                            color: isBeingRead ? 'var(--primary-color)' : 'var(--text-color)',
                                            fontWeight: isBeingRead ? 700 : 500,
                                            fontSize: '1.2rem',
                                            lineHeight: 1.8,
                                            transition: 'all 0.3s ease',
                                            fontFamily: 'var(--font-serif)'
                                        }}
                                    >
                                        {text}
                                        {hasNote && <span style={{
                                            display: 'inline-flex',
                                            width: '6px', height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--primary-color)',
                                            margin: '0 4px',
                                            verticalAlign: 'middle'
                                        }} />}
                                    </div>

                                    {/* Action Bar Beneath Text */}
                                    <div style={{ display: 'flex', gap: '20px', marginTop: '12px', opacity: isBeingRead ? 1 : 0.4 }}>
                                        <button
                                            onClick={() => {
                                                if (isBeingRead) stopSpeaking();
                                                else {
                                                    if (continuousReading) { setIsAutoPlaying(true); playVerse(index); }
                                                    else speak(text, verseId);
                                                }
                                            }}
                                            style={{ color: isBeingRead ? 'var(--primary-color)' : 'inherit', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}
                                        >
                                            <Volume2 size={16} className={isBeingRead ? 'pulse-animation' : ''} />
                                            {isBeingRead ? (language === 'en' ? 'Reading...' : '正在朗读') : ''}
                                        </button>
                                        <button onClick={() => toggleBookmark(verseId)} style={{ color: bookmarked ? 'var(--primary-color)' : 'inherit', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                                            {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                                        </button>
                                        <button onClick={() => handleShare(text, verseId)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                                            <Share2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {activeVerseId === verseId && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{
                                            background: 'var(--card-bg)',
                                            borderRadius: '24px',
                                            padding: '24px',
                                            marginTop: '16px',
                                            border: '1px solid var(--border-color)',
                                            boxShadow: '0 10px 20px -5px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                {['yellow', 'green', 'blue', 'red'].map(color => (
                                                    <button
                                                        key={color}
                                                        style={{
                                                            width: '32px', height: '32px', borderRadius: '50%',
                                                            backgroundColor: color === 'yellow' ? '#fef08a' : color === 'green' ? '#bbf7d0' : color === 'blue' ? '#bfdbfe' : '#fecaca',
                                                            border: highlightColor === color ? '2px solid var(--text-color)' : 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => setHighlight(verseId, highlightColor === color ? null : color)}
                                                    />
                                                ))}
                                            </div>
                                            <button onClick={() => setActiveVerseId(null)} style={{ opacity: 0.5 }}><X size={20} /></button>
                                        </div>
                                        <textarea
                                            placeholder={language === 'en' ? "Write your spiritual reflection..." : "在这里写下您的灵修感悟..."}
                                            value={noteText}
                                            onChange={(e) => {
                                                setNoteText(e.target.value);
                                                saveNote(verseId, e.target.value);
                                            }}
                                            style={{
                                                width: '100%',
                                                background: 'var(--bg-color)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '16px',
                                                padding: '16px',
                                                fontSize: '1rem',
                                                minHeight: '120px',
                                                color: 'var(--text-color)',
                                                fontFamily: 'inherit',
                                                resize: 'none',
                                                outline: 'none'
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Navigation Buttons footer */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '60px' }}>
                <button
                    onClick={handlePrevChapter}
                    disabled={currentBookIndex === 0 && currentChapterIndex === 0}
                    style={{
                        flex: 1, height: '64px', borderRadius: '24px',
                        background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        fontWeight: 800, color: 'var(--primary-color)',
                        opacity: (currentBookIndex === 0 && currentChapterIndex === 0) ? 0.3 : 1
                    }}
                >
                    <ChevronLeft size={24} />
                    {language === 'en' ? 'Previous' : '上一章'}
                </button>
                <button
                    onClick={handleNextChapter}
                    disabled={bibleData.length > 0 && currentBookIndex === bibleData.length - 1 && currentChapterIndex === currentBook.chapters.length - 1}
                    style={{
                        flex: 1, height: '64px', borderRadius: '24px',
                        background: 'var(--primary-color)', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        fontWeight: 800, color: 'white',
                        boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)',
                        opacity: (bibleData.length > 0 && currentBookIndex === bibleData.length - 1 && currentChapterIndex === currentBook.chapters.length - 1) ? 0.3 : 1
                    }}
                >
                    {language === 'en' ? 'Next' : '下一章'}
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Floating Action Player */}
            <motion.div
                initial={{ y: 100, x: 50 }}
                animate={{ y: 0, x: 0 }}
                style={{
                    position: 'fixed',
                    bottom: '90px',
                    right: '24px',
                    zIndex: 1000,
                    width: 'auto',
                    minWidth: '120px'
                }}
            >
                <button
                    onClick={toggleChapterPlay}
                    style={{
                        width: '100%',
                        height: '52px',
                        padding: '0 24px',
                        borderRadius: '26px',
                        background: isAutoPlaying ? '#ef4444' : 'var(--primary-color)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 12px 24px -6px rgba(0,0,0,0.2)',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        whiteSpace: 'nowrap'
                    }}
                >
                    {isAutoPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />}
                    <span>{isAutoPlaying ? (language === 'en' ? 'Pause' : '暂停') : (language === 'en' ? 'Listen' : '听全章')}</span>
                </button>
            </motion.div>

            {/* Sidebar Drawer */}
            <AnimatePresence>
                {showDrawer && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDrawer(false)}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                zIndex: 2000,
                                backdropFilter: 'blur(4px)'
                            }}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: -320 }}
                            animate={{ x: 0 }}
                            exit={{ x: -320 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: '320px',
                                maxWidth: '85vw',
                                backgroundColor: 'var(--bg-color)',
                                zIndex: 2001,
                                boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Drawer Header */}
                            <div style={{
                                padding: '24px',
                                borderBottom: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>
                                    {language === 'en' ? 'Navigation' : '章节导航'}
                                </h3>
                                <button onClick={() => setShowDrawer(false)} style={{ padding: '8px' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Books and Chapters */}
                            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                                {/* Books List */}
                                <div style={{
                                    width: '45%',
                                    borderRight: '1px solid var(--border-color)',
                                    overflowY: 'auto',
                                    padding: '12px 8px'
                                }}>
                                    {bibleData.map((book, idx) => (
                                        <button
                                            key={book.id}
                                            onClick={() => {
                                                if (pauseOnManualSwitch) stopSpeaking();
                                                setCurrentBookIndex(idx);
                                                setCurrentChapterIndex(0);
                                            }}
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                padding: '12px',
                                                textAlign: 'left',
                                                borderRadius: '12px',
                                                marginBottom: '4px',
                                                backgroundColor: currentBookIndex === idx ? 'var(--primary-color)' : 'transparent',
                                                color: currentBookIndex === idx ? 'white' : 'var(--text-color)',
                                                fontWeight: currentBookIndex === idx ? 800 : 500,
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {book.name}
                                        </button>
                                    ))}
                                </div>

                                {/* Chapters Grid */}
                                <div style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    padding: '12px'
                                }}>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '8px'
                                    }}>
                                        {currentBook.chapters.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    if (pauseOnManualSwitch) stopSpeaking();
                                                    setCurrentChapterIndex(idx);
                                                    setShowDrawer(false);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                style={{
                                                    padding: '12px',
                                                    borderRadius: '12px',
                                                    backgroundColor: currentChapterIndex === idx ? 'var(--primary-color)' : 'var(--card-bg)',
                                                    color: currentChapterIndex === idx ? 'white' : 'var(--text-color)',
                                                    fontWeight: 800,
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.2s',
                                                    border: '1px solid',
                                                    borderColor: currentChapterIndex === idx ? 'var(--primary-color)' : 'var(--border-color)'
                                                }}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Reader;
