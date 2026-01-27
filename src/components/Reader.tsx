import React, { useState, useEffect } from 'react';
import { useAppContext, type VerseRange } from '../context/AppContext';
import { Bookmark, BookmarkCheck, Share2, ChevronDown, BookOpen, ChevronLeft, ChevronRight, X, Volume2, Quote, FileText, CheckSquare, Highlighter, PlayCircle, StopCircle, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Reader: React.FC = () => {
    const {
        toggleBookmark, isBookmarked,
        bibleData, isLoadingBible,
        setHighlight, getHighlight,
        saveNote, getNote,
        speak, stopSpeaking, isSpeaking, currentSpeakingId,
        isAutoPlaying, setIsAutoPlaying,
        lastRead, setLastRead,
        continuousReading,
        pauseOnManualSwitch,
        loopCount, setLoopCount,
        showDrawer, setShowDrawer,
        t
    } = useAppContext();

    const [currentBookIndex, setCurrentBookIndex] = useState(lastRead.bookIndex);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(lastRead.chapterIndex);
    const [showSelector, setShowSelector] = useState(false);
    const [expandedBook, setExpandedBook] = useState<number | null>(null);

    // Sync expanded book when drawer opens
    useEffect(() => {
        if (showDrawer) {
            setExpandedBook(currentBookIndex);
        }
    }, [showDrawer, currentBookIndex]);

    const [activeVerseId, setActiveVerseId] = useState<string | null>(null);
    const [noteText, setNoteText] = useState("");

    // Range selection states
    const [isRangeSelectMode, setIsRangeSelectMode] = useState(false);
    const [rangeStart, setRangeStart] = useState<number | null>(null);
    const [rangeEnd, setRangeEnd] = useState<number | null>(null);
    const [batchNoteText, setBatchNoteText] = useState("");
    const [isBatchPlaying, setIsBatchPlaying] = useState(false);

    const currentBook = bibleData[currentBookIndex];
    const currentChapter = currentBook?.chapters[currentChapterIndex] || [];

    // Get selected range
    const selectedRange: VerseRange | null = rangeStart !== null && rangeEnd !== null ? {
        bookId: currentBook.id,
        chapter: currentChapterIndex + 1,
        startVerse: Math.min(rangeStart, rangeEnd),
        endVerse: Math.max(rangeStart, rangeEnd)
    } : null;

    // Check if a verse is in the selected range
    const isVerseInRange = (verseNum: number): boolean => {
        if (!selectedRange) return false;
        return verseNum >= selectedRange.startVerse && verseNum <= selectedRange.endVerse;
    };

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

    // Parse URL parameters on mount to navigate to shared verse
    useEffect(() => {
        if (!isLoadingBible && bibleData.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const bookParam = params.get('book');
            const chapterParam = params.get('chapter');
            const verseParam = params.get('verse');

            if (bookParam !== null && chapterParam !== null) {
                const bookIdx = parseInt(bookParam);
                const chapterIdx = parseInt(chapterParam);
                const verseNum = verseParam ? parseInt(verseParam) : undefined;

                if (bookIdx >= 0 && bookIdx < bibleData.length) {
                    setCurrentBookIndex(bookIdx);
                    setCurrentChapterIndex(chapterIdx);

                    if (verseNum) {
                        setLastRead({ bookIndex: bookIdx, chapterIndex: chapterIdx, verseNum });
                    }

                    window.history.replaceState({}, '', window.location.pathname);
                }
            }
        }
    }, [isLoadingBible, bibleData]);

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

    const [dailyVerse, setDailyVerse] = useState({
        text: "起初,神创造天地。",
        book: t('books.gn'),
        chapter: 1,
        verse: 1
    });

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
        const spaceIdx = id.lastIndexOf(' ');
        const bookIdentifier = id.substring(0, spaceIdx);
        const position = id.substring(spaceIdx + 1);
        const [chapter, verse] = position.split(':');

        let bookIndex = bibleData.findIndex(b => b.id === bookIdentifier);
        if (bookIndex === -1) {
            bookIndex = bibleData.findIndex(b => b.name === bookIdentifier);
        }

        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?book=${bookIndex}&chapter=${parseInt(chapter) - 1}&verse=${verse}`;
        const shareText = `${id}\n${text}\n\n${shareUrl}`;

        if (navigator.share) {
            navigator.share({
                title: t('reader.share'),
                text: shareText,
                url: shareUrl,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareText);
            alert(t('reader.share_success'));
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



    const handleVerseClick = (verseNum: number) => {
        if (isRangeSelectMode) {
            if (rangeStart === null) {
                setRangeStart(verseNum);
                setRangeEnd(verseNum);
            } else {
                setRangeEnd(verseNum);
            }
        } else {
            const verseId = `${currentBook.id} ${currentChapterIndex + 1}:${verseNum}`;
            setActiveVerseId(verseId === activeVerseId ? null : verseId);
            const note = getNote(currentBook.id, currentChapterIndex + 1, verseNum);
            setNoteText(note?.text || "");
        }
    };

    const handleBatchBookmark = () => {
        if (selectedRange) {
            toggleBookmark(selectedRange);
            cancelRangeSelect();
        }
    };

    const handleBatchHighlight = (color: string) => {
        if (selectedRange) {
            setHighlight(selectedRange, color);
            cancelRangeSelect();
        }
    };

    const handleBatchPlay = () => {
        if (!selectedRange) return;

        const playlist: string[] = [];
        const count = loopCount > 0 ? loopCount : 1;

        for (let i = 0; i < count; i++) {
            for (let v = selectedRange.startVerse; v <= selectedRange.endVerse; v++) {
                const verseId = `${selectedRange.bookId} ${selectedRange.chapter}:${v}`;
                playlist.push(verseId);
            }
        }

        setIsBatchPlaying(true);
        playBatchQueue(playlist, 0);
    };

    const playBatchQueue = (queue: string[], index: number) => {
        if (index >= queue.length) {
            setIsBatchPlaying(false);
            stopSpeaking();
            return;
        }

        const verseId = queue[index];
        const [_, position] = verseId.split(' ');
        const [, verseStr] = position.split(':');
        const verseNum = parseInt(verseStr);
        const text = currentChapter[verseNum - 1];

        if (text) {
            speak(text, verseId, () => {
                playBatchQueue(queue, index + 1);
            });
        } else {
            playBatchQueue(queue, index + 1);
        }
    };

    const handleBatchNote = () => {
        if (selectedRange && batchNoteText.trim()) {
            saveNote(selectedRange, batchNoteText);
            setBatchNoteText("");
            cancelRangeSelect();
        }
    };

    const cancelRangeSelect = () => {
        setIsRangeSelectMode(false);
        setRangeStart(null);
        setRangeEnd(null);
        setBatchNoteText("");
        if (isBatchPlaying) {
            stopSpeaking();
            setIsBatchPlaying(false);
        }
    };

    const formatRangeDisplay = (range: VerseRange): string => {
        if (range.startVerse === range.endVerse) {
            return t('reader.verse_single', { verse: range.startVerse });
        }
        return t('reader.verse_range', { start: range.startVerse, end: range.endVerse });
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
            style={{
                paddingBottom: selectedRange ? '380px' : '120px',
                paddingTop: '76px',
                transition: 'padding-bottom 0.3s ease'
            }}
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
                        {t('reader.daily_wisdom')}
                    </div>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.5, marginBottom: '24px', letterSpacing: '-0.3px' }}>
                        "{dailyVerse.text}"
                    </p>
                    <div style={{ fontSize: '0.95rem', textAlign: 'right', fontWeight: 700, opacity: 0.9 }}>
                        — {dailyVerse.book} {dailyVerse.chapter}:{dailyVerse.verse}
                    </div>
                </div>
            </motion.div>



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
                        {t('reader.chapter_select', { book: currentBook.name, chapter: currentChapterIndex + 1 })}
                    </span>
                    <motion.div animate={{ rotate: showSelector ? 180 : 0 }}>
                        <ChevronDown size={22} style={{ opacity: 0.5 }} />
                    </motion.div>
                </button>

                <AnimatePresence>
                    {showSelector && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowSelector(false)}
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    zIndex: 999,
                                    backdropFilter: 'blur(4px)'
                                }}
                            />

                            {/* Selector Popup */}
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'var(--bg-color)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    zIndex: 1000,
                                    marginTop: '12px',
                                    borderRadius: '28px',
                                    border: '1px solid var(--border-color)',
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
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
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Range Select Mode Controls */}
            {!isRangeSelectMode ? (
                <>
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => setIsRangeSelectMode(true)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '16px',
                                backgroundColor: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: 'var(--text-color)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <CheckSquare size={18} />
                            {t('reader.range_select')}
                        </button>
                    </div>

                    {/* Floating Action Button for Playing Chapter */}
                    <motion.button
                        layout
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            if (isSpeaking) {
                                stopSpeaking();
                            } else {
                                setIsAutoPlaying(true);
                                playVerse(0);
                            }
                        }}
                        style={{
                            position: 'fixed',
                            bottom: '100px',
                            right: '24px',
                            zIndex: 100,
                            padding: '12px 24px',
                            borderRadius: '30px',
                            background: isSpeaking
                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                : 'linear-gradient(135deg, var(--primary-color) 0%, #818cf8 100%)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '1rem',
                            fontWeight: 800,
                            color: 'white',
                            cursor: 'pointer',
                            boxShadow: isSpeaking
                                ? '0 10px 25px -5px rgba(239, 68, 68, 0.4)'
                                : '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
                            transition: 'background 0.3s ease'
                        }}
                    >
                        {isSpeaking ? (
                            <div className="pulse-animation" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <StopCircle size={22} strokeWidth={2.5} />
                                <span>{t('reader.stop')}</span>
                            </div>
                        ) : (
                            <>
                                <PlayCircle size={22} strokeWidth={2.5} />
                                <span>{t('reader.play_chapter')}</span>
                            </>
                        )}
                    </motion.button>
                </>
            ) : (
                <>
                    {/* Top indicator when in range-select mode */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginBottom: '24px',
                            padding: '16px 20px',
                            borderRadius: '20px',
                            backgroundColor: 'var(--card-bg)',
                            border: '2px solid var(--primary-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckSquare size={20} style={{ color: 'var(--primary-color)' }} />
                            <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                                {selectedRange
                                    ? formatRangeDisplay(selectedRange)
                                    : t('reader.select_start_end')}
                            </span>
                        </div>
                        <button
                            onClick={cancelRangeSelect}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '10px',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            <X size={16} style={{ verticalAlign: 'middle' }} />
                        </button>
                    </motion.div>

                    {/* Fixed bottom action bar when range is selected */}
                    <AnimatePresence>
                        {selectedRange && (
                            <>

                                <motion.div
                                    initial={{ y: '100%', x: '-50%', opacity: 0 }}
                                    animate={{ y: 0, x: '-50%', opacity: 1 }}
                                    exit={{ y: '100%', x: '-50%', opacity: 0 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    style={{
                                        position: 'fixed',
                                        bottom: '20px',
                                        left: '50%',
                                        width: '90%',
                                        maxWidth: '1000px',
                                        zIndex: 200,
                                        backgroundColor: 'rgba(var(--bg-rgb), 0.98)',
                                        backdropFilter: 'blur(24px)',
                                        WebkitBackdropFilter: 'blur(24px)',
                                        border: '1px solid var(--border-color)',
                                        padding: '20px 24px',
                                        paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
                                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                                        borderRadius: '24px',
                                        maxHeight: '85vh',
                                        overflowY: 'auto'
                                    }}
                                >
                                    <div style={{ position: 'relative', height: '32px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', opacity: 0.5 }}></div>
                                        <button
                                            onClick={cancelRangeSelect}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--card-bg)',
                                                border: '1px solid var(--border-color)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                color: 'var(--text-color)',
                                                zIndex: 10
                                            }}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {/* Actions Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                                        {/* Bookmark Info */}
                                        <button
                                            onClick={handleBatchBookmark}
                                            style={{
                                                padding: '16px',
                                                borderRadius: '20px',
                                                backgroundColor: 'var(--card-bg)',
                                                border: '1px solid var(--border-color)',
                                                color: 'var(--text-color)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'transform 0.1s'
                                            }}
                                        >
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '12px',
                                                backgroundColor: '#f59e0b', color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <Bookmark size={20} />
                                            </div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                                                {t('reader.bookmark')}
                                            </span>
                                        </button>

                                        {/* TTS Info */}
                                        <div style={{
                                            padding: '16px',
                                            borderRadius: '20px',
                                            backgroundColor: 'var(--card-bg)',
                                            border: '1px solid var(--border-color)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            position: 'relative'
                                        }}>
                                            {!isBatchPlaying ? (
                                                <button
                                                    onClick={handleBatchPlay}
                                                    style={{
                                                        width: '40px', height: '40px', borderRadius: '12px',
                                                        backgroundColor: 'var(--primary-color)', color: 'white',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        border: 'none', cursor: 'pointer'
                                                    }}
                                                >
                                                    <PlayCircle size={20} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => { stopSpeaking(); setIsBatchPlaying(false); }}
                                                    style={{
                                                        width: '40px', height: '40px', borderRadius: '12px',
                                                        backgroundColor: '#ef4444', color: 'white',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        border: 'none', cursor: 'pointer'
                                                    }}
                                                >
                                                    <StopCircle size={20} />
                                                </button>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                                                    {isBatchPlaying ? t('reader.stop') : t('reader.listen')}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.6, fontSize: '0.8rem' }}>
                                                    <Repeat size={10} style={{ marginRight: '2px' }} />
                                                    <select
                                                        value={loopCount}
                                                        onChange={(e) => setLoopCount(parseInt(e.target.value))}
                                                        style={{
                                                            background: 'transparent', border: 'none', color: 'inherit', fontWeight: 700, padding: 0
                                                        }}
                                                    >
                                                        {[1, 2, 3, 5].map(n => <option key={n} value={n}>{n}x</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Highlight Row */}
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '16px', borderRadius: '20px',
                                        backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)',
                                        marginBottom: '20px'
                                    }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Highlighter size={18} />
                                            {t('reader.highlight')}
                                        </span>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            {['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca'].map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => handleBatchHighlight(color === '#fef08a' ? 'yellow' : color === '#bbf7d0' ? 'green' : color === '#bfdbfe' ? 'blue' : 'red')}
                                                    style={{
                                                        width: '32px', height: '32px', borderRadius: '50%',
                                                        backgroundColor: color,
                                                        border: '2px solid rgba(0,0,0,0.05)',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Note Section */}
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <input
                                            type="text"
                                            placeholder={t('reader.add_note')}
                                            value={batchNoteText}
                                            onChange={(e) => setBatchNoteText(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '14px 16px',
                                                borderRadius: '16px',
                                                border: '1px solid var(--border-color)',
                                                backgroundColor: 'var(--card-bg)',
                                                fontSize: '0.95rem'
                                            }}
                                        />
                                        <button
                                            onClick={handleBatchNote}
                                            disabled={!batchNoteText.trim()}
                                            style={{
                                                padding: '0 20px',
                                                borderRadius: '16px',
                                                backgroundColor: batchNoteText.trim() ? '#10b981' : 'var(--border-color)',
                                                color: 'white',
                                                border: 'none',
                                                cursor: batchNoteText.trim() ? 'pointer' : 'default',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            <FileText size={20} />
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </>
            )}

            {/* Verses List */}
            <div className="verses-list">
                {currentChapter.map((text, index) => {
                    const verseNum = index + 1;
                    const verseId = `${currentBook.id} ${currentChapterIndex + 1}:${verseNum}`;
                    const bookmarkInfo = isBookmarked(currentBook.id, currentChapterIndex + 1, verseNum);
                    const highlightColor = getHighlight(currentBook.id, currentChapterIndex + 1, verseNum);
                    const noteInfo = getNote(currentBook.id, currentChapterIndex + 1, verseNum);
                    const isBeingRead = currentSpeakingId === verseId;
                    const inSelectedRange = isVerseInRange(verseNum);

                    return (
                        <motion.div
                            key={index} id={`verse-${verseNum}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            style={{ marginBottom: '32px', position: 'relative' }}
                        >
                            <div className={`verse ${bookmarkInfo ? 'bookmarked' : ''} ${isBeingRead ? 'being-read' : ''}`}
                                style={{
                                    display: 'flex',
                                    gap: '16px',
                                    padding: '12px',
                                    borderRadius: '16px',
                                    backgroundColor: inSelectedRange ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                    transition: 'background-color 0.2s'
                                }}>
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 900,
                                    color: isBeingRead ? 'var(--primary-color)' : 'var(--secondary-text)',
                                    minWidth: '32px',
                                    paddingTop: '6px',
                                    cursor: isRangeSelectMode ? 'pointer' : 'default',
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}
                                    onClick={() => isRangeSelectMode && handleVerseClick(verseNum)}>
                                    <div style={{
                                        width: '28px', height: '28px',
                                        borderRadius: '50%',
                                        backgroundColor: isRangeSelectMode
                                            ? (inSelectedRange ? 'var(--primary-color)' : 'transparent')
                                            : 'transparent',
                                        border: isRangeSelectMode
                                            ? (inSelectedRange ? 'none' : '2px solid var(--border-color)')
                                            : 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: isRangeSelectMode && inSelectedRange ? 'white' : 'inherit',
                                        transition: 'all 0.2s',
                                        fontSize: '0.8rem',
                                        fontWeight: 800
                                    }}>
                                        {verseNum}
                                    </div>
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div
                                        className="verse-text"
                                        data-highlight={highlightColor}
                                        onClick={() => handleVerseClick(verseNum)}
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
                                        {noteInfo && <FileText size={16} style={{
                                            display: 'inline-block',
                                            color: '#10b981',
                                            marginLeft: '6px',
                                            verticalAlign: 'middle',
                                            opacity: 0.8
                                        }} />}
                                    </div>

                                    {/* Action Bar Beneath Text */}
                                    {!isRangeSelectMode && (
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
                                                {isBeingRead ? t('reader.reading') : ''}
                                            </button>
                                            <button onClick={() => toggleBookmark({ bookId: currentBook.id, chapter: currentChapterIndex + 1, startVerse: verseNum, endVerse: verseNum })} style={{
                                                color: bookmarkInfo ? '#f59e0b' : 'inherit',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                opacity: bookmarkInfo ? 1 : 0.6
                                            }}>
                                                {bookmarkInfo ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                                            </button>
                                            <button onClick={() => handleShare(text, verseId)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                                                <Share2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <AnimatePresence>
                                {activeVerseId === verseId && !isRangeSelectMode && (
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
                                                        onClick={() => setHighlight(
                                                            { bookId: currentBook.id, chapter: currentChapterIndex + 1, startVerse: verseNum, endVerse: verseNum },
                                                            highlightColor === color ? null : color
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <button onClick={() => setActiveVerseId(null)} style={{ opacity: 0.5 }}><X size={20} /></button>
                                        </div>
                                        <textarea
                                            placeholder={t('reader.note_placeholder')}
                                            value={noteText}
                                            onChange={(e) => {
                                                setNoteText(e.target.value);
                                                saveNote(
                                                    { bookId: currentBook.id, chapter: currentChapterIndex + 1, startVerse: verseNum, endVerse: verseNum },
                                                    e.target.value
                                                );
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
                    {t('reader.prev_chapter')}
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
                    {t('reader.next_chapter')}
                    <ChevronRight size={24} />
                </button>
            </div>

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
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 1000
                            }}
                        />
                        {/* Drawer Panel */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            style={{
                                position: 'fixed',
                                top: 0, left: 0, bottom: 0,
                                width: '280px',
                                maxWidth: '80%',
                                backgroundColor: 'var(--bg-color)',
                                zIndex: 1001,
                                boxShadow: '20px 0 50px rgba(0,0,0,0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                            onAnimationComplete={() => {
                                // Auto scroll to current book
                                const el = document.getElementById(`book-nav-${currentBookIndex}`);
                                if (el) {
                                    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
                                }
                            }}
                        >
                            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <BookOpen size={24} color="var(--primary-color)" />
                                    {t('reader.drawer_books')}
                                </div>
                                <button onClick={() => setShowDrawer(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5 }}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                                {bibleData.map((book, bIdx) => (
                                    <div key={book.id} id={`book-nav-${bIdx}`} style={{ marginBottom: '8px' }}>
                                        <div
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '12px',
                                                backgroundColor: currentBookIndex === bIdx ? 'var(--card-bg)' : 'transparent',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                color: currentBookIndex === bIdx ? 'var(--primary-color)' : 'var(--text-color)',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                            }}
                                            onClick={() => {
                                                if (expandedBook === bIdx) {
                                                    setExpandedBook(null);
                                                } else {
                                                    setExpandedBook(bIdx);
                                                }
                                            }}
                                        >
                                            {book.name}
                                            {expandedBook === bIdx ? <ChevronDown size={16} /> : (currentBookIndex === bIdx && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-color)' }} />)}
                                        </div>
                                        <AnimatePresence>
                                            {expandedBook === bIdx && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(5, 1fr)',
                                                        gap: '8px',
                                                        padding: '8px 12px',
                                                        borderTop: '1px solid var(--border-color)'
                                                    }}>
                                                        {book.chapters.map((_, cIdx) => (
                                                            <button
                                                                key={cIdx}
                                                                onClick={() => {
                                                                    setCurrentBookIndex(bIdx);
                                                                    setCurrentChapterIndex(cIdx);
                                                                    setShowDrawer(false);
                                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                }}
                                                                style={{
                                                                    padding: '8px 0',
                                                                    borderRadius: '8px',
                                                                    backgroundColor: (currentBookIndex === bIdx && currentChapterIndex === cIdx) ? 'var(--primary-color)' : 'transparent',
                                                                    color: (currentBookIndex === bIdx && currentChapterIndex === cIdx) ? 'white' : 'var(--text-color)',
                                                                    border: (currentBookIndex === bIdx && currentChapterIndex === cIdx) ? 'none' : '1px solid var(--border-color)',
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: 600,
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {cIdx + 1}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Reader;
