import React, { useState, useRef, useLayoutEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle, StopCircle } from 'lucide-react';

interface PaginatedPage {
    verses: { text: string; index: number }[];
}

const FullscreenReader: React.FC = () => {
    const {
        isFullscreenReader, setIsFullscreenReader,
        bibleData, lastRead, setLastRead,
        t, fontSize, lineHeight, fontFamily, pageTurnEffect,
        speak, stopSpeaking, isSpeaking, currentSpeakingId
    } = useAppContext();

    const [currentPage, setCurrentPage] = useState(0);
    const [pages, setPages] = useState<PaginatedPage[]>([]);
    const [showUI, setShowUI] = useState(false);

    // We use this to track if we should land on the last page of a new chapter
    const navDirection = useRef<'forward' | 'backward'>('forward');
    const measurerRef = useRef<HTMLDivElement>(null);

    const currentBookIndex = lastRead.bookIndex;
    const currentChapterIndex = lastRead.chapterIndex;
    const currentBook = bibleData[currentBookIndex];
    const currentChapter = currentBook?.chapters[currentChapterIndex] || [];

    const paginateContent = () => {
        if (!measurerRef.current || !currentChapter.length) {
            setPages([]);
            return;
        }

        const container = measurerRef.current;
        // Accurate height calculation: window height - padding top (80) - padding bottom (100)
        const maxHeight = window.innerHeight - 180;
        const newPages: PaginatedPage[] = [];
        let currentPageVerses: { text: string; index: number }[] = [];

        container.innerHTML = '';
        let currentHeight = 0;

        currentChapter.forEach((text, index) => {
            const verseEl = document.createElement('div');
            verseEl.style.marginBottom = '1.8em';
            verseEl.style.display = 'flex';
            verseEl.style.gap = '24px';
            verseEl.style.fontSize = `${fontSize}px`;
            verseEl.style.lineHeight = `${lineHeight}`;
            verseEl.style.fontFamily = fontFamily || 'inherit';
            verseEl.style.textAlign = 'justify';

            verseEl.innerHTML = `
                <div style="font-weight: 900; min-width: 2.8rem; text-align: right; font-size: 0.85em; padding-top: 6px; opacity: 0.2">
                    ${index + 1}
                </div>
                <div style="flex: 1">${text}</div>
            `;

            container.appendChild(verseEl);
            const verseHeight = verseEl.offsetHeight;

            if (currentHeight + verseHeight > maxHeight && currentPageVerses.length > 0) {
                newPages.push({ verses: currentPageVerses });
                currentPageVerses = [];
                currentHeight = 0;
            }

            currentPageVerses.push({ text, index });
            currentHeight += verseHeight;
        });

        if (currentPageVerses.length > 0) {
            newPages.push({ verses: currentPageVerses });
        }

        setPages(newPages);

        // Handle target page land
        if (navDirection.current === 'backward') {
            setCurrentPage(newPages.length - 1);
            navDirection.current = 'forward';
        } else {
            setCurrentPage(0);
        }

        container.innerHTML = '';
    };

    useLayoutEffect(() => {
        if (isFullscreenReader) {
            // Give time for layout
            const timer = setTimeout(paginateContent, 100);
            return () => clearTimeout(timer);
        }
    }, [currentChapter, fontSize, lineHeight, fontFamily, isFullscreenReader]);

    const handleNextPage = () => {
        if (currentPage < pages.length - 1) {
            setCurrentPage(prev => prev + 1);
        } else {
            navDirection.current = 'forward';
            if (currentChapterIndex < (currentBook?.chapters?.length || 0) - 1) {
                setLastRead({ bookIndex: currentBookIndex, chapterIndex: currentChapterIndex + 1 });
            } else if (currentBookIndex < bibleData.length - 1) {
                setLastRead({ bookIndex: currentBookIndex + 1, chapterIndex: 0 });
            }
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        } else {
            navDirection.current = 'backward';
            if (currentChapterIndex > 0) {
                setLastRead({ bookIndex: currentBookIndex, chapterIndex: currentChapterIndex - 1 });
            } else if (currentBookIndex > 0) {
                const prevBook = bibleData[currentBookIndex - 1];
                setLastRead({ bookIndex: currentBookIndex - 1, chapterIndex: prevBook.chapters.length - 1 });
            }
        }
    };

    const playCurrentPage = () => {
        const pageVerses = pages[currentPage]?.verses;
        if (!pageVerses || pageVerses.length === 0) return;
        playVerseOnPage(0);
    };

    const playVerseOnPage = (indexInPage: number) => {
        const pageVerses = pages[currentPage]?.verses;
        if (!pageVerses || indexInPage >= pageVerses.length) {
            return;
        }

        const v = pageVerses[indexInPage];
        const verseId = `${currentBook.id} ${currentChapterIndex + 1}:${v.index + 1}`;

        speak(v.text, verseId, () => {
            if (indexInPage + 1 < pageVerses.length) {
                setTimeout(() => playVerseOnPage(indexInPage + 1), 100);
            }
        });
    };

    if (!isFullscreenReader) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'var(--bg-color)',
                zIndex: 9000,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                userSelect: 'none'
            }}
        >
            {/* Hidden Measurer */}
            <div
                ref={measurerRef}
                style={{
                    position: 'absolute',
                    visibility: 'hidden',
                    width: 'calc(100% - 88px)', // Subtracting horizontal padding
                    maxWidth: '950px',
                    pointerEvents: 'none',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: -1
                }}
            />

            {/* Header (Exit & Play Button) */}
            <AnimatePresence>
                {showUI && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'absolute',
                            top: '24px',
                            right: '32px',
                            zIndex: 1000,
                            display: 'flex',
                            gap: '12px'
                        }}
                    >
                        {/* Play current page button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isSpeaking) {
                                    stopSpeaking();
                                } else {
                                    playCurrentPage();
                                }
                            }}
                            style={{
                                background: isSpeaking ? '#ef4444' : 'var(--primary-color)',
                                color: 'white', border: 'none',
                                padding: '12px 24px', borderRadius: '16px', fontWeight: 800,
                                fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 8px 30px rgba(var(--primary-rgb), 0.3)',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isSpeaking ? (
                                <><StopCircle size={18} /> {t('reader.stop')}</>
                            ) : (
                                <><PlayCircle size={18} /> {t('reader.listen')}</>
                            )}
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // Sync verse location: pick the first verse of the current page
                                const firstVerseIdx = pages[currentPage]?.verses[0]?.index;
                                if (firstVerseIdx !== undefined) {
                                    setLastRead({
                                        ...lastRead,
                                        verseNum: firstVerseIdx + 1
                                    });
                                }
                                setIsFullscreenReader(false);
                            }}
                            style={{
                                background: 'rgba(var(--bg-rgb), 0.5)',
                                backdropFilter: 'blur(10px)',
                                color: 'var(--text-color)', border: '1px solid var(--border-color)',
                                padding: '12px 24px', borderRadius: '16px', fontWeight: 800,
                                fontSize: '0.9rem', cursor: 'pointer'
                            }}
                        >
                            <X size={18} /> {t('reader.exit_fullscreen')}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Book Title Indicator */}
            <div style={{
                position: 'absolute', top: '32px', left: '44px',
                fontSize: '0.8rem', fontWeight: 900, opacity: 0.15,
                color: 'var(--text-color)', letterSpacing: '4px', textTransform: 'uppercase'
            }}>
                {currentBook?.name} &bull; {currentChapterIndex + 1}
            </div>

            {/* Main Reading Area */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '80px 44px 100px',
                    maxWidth: '950px',
                    margin: '0 auto',
                    width: '100%',
                    justifyContent: 'flex-start',
                    position: 'relative',
                    perspective: '2000px' // Crucial for 3D effects like Curl
                }}
                onClick={(e) => {
                    const width = window.innerWidth;
                    if (e.clientX < width * 0.25) handlePrevPage();
                    else if (e.clientX > width * 0.75) handleNextPage();
                    else setShowUI(!showUI);
                }}
            >
                <AnimatePresence mode="popLayout" initial={false} custom={navDirection.current}>
                    <motion.div
                        key={`${currentBookIndex}-${currentChapterIndex}-${currentPage}`}
                        custom={navDirection.current}
                        variants={{
                            initial: (direction: string) => {
                                switch (pageTurnEffect) {
                                    case 'fade': return { opacity: 0 };
                                    case 'slide': return { x: direction === 'forward' ? '100%' : '-100%', opacity: 0 };
                                    case 'curl': return {
                                        rotateY: direction === 'forward' ? 45 : -45,
                                        x: direction === 'forward' ? '50%' : '-50%',
                                        opacity: 0,
                                        zIndex: 1,
                                        transformOrigin: direction === 'forward' ? 'left' : 'right'
                                    };
                                    case 'none': return { opacity: 1 };
                                    default: return { opacity: 0, scale: 0.98 };
                                }
                            },
                            animate: {
                                x: 0, opacity: 1, scale: 1, rotateY: 0, zIndex: 2,
                                transition: {
                                    duration: pageTurnEffect === 'none' ? 0 : 0.6,
                                    ease: [0.32, 0.72, 0, 1]
                                }
                            },
                            exit: (direction: string) => {
                                switch (pageTurnEffect) {
                                    case 'fade': return { opacity: 0 };
                                    case 'slide': return { x: direction === 'forward' ? '-100%' : '100%', opacity: 0 };
                                    case 'curl': return {
                                        rotateY: direction === 'forward' ? -90 : 90,
                                        x: direction === 'forward' ? '-100%' : '100%',
                                        opacity: 0,
                                        zIndex: 3,
                                        transformOrigin: direction === 'forward' ? 'left' : 'right'
                                    };
                                    case 'none': return { opacity: 0, transition: { duration: 0 } };
                                    default: return { opacity: 0, scale: 1.02 };
                                }
                            }
                        }}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            top: '80px',
                            left: '44px',
                            right: '44px',
                            maxWidth: 'calc(100% - 88px)'
                        }}
                    >
                        <div style={{
                            fontSize: `${fontSize}px`,
                            lineHeight: lineHeight,
                            fontFamily: fontFamily,
                            color: 'var(--text-color)',
                            textAlign: 'justify'
                        }}>
                            {pages[currentPage]?.verses.map((v) => {
                                const isVerseSpeaking = currentSpeakingId === `${currentBook.id} ${currentChapterIndex + 1}:${v.index + 1}`;
                                return (
                                    <div
                                        key={v.index}
                                        style={{
                                            marginBottom: '1.8em',
                                            display: 'flex',
                                            gap: '24px',
                                            backgroundColor: isVerseSpeaking ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                                            borderRadius: '16px',
                                            margin: '0 -16px 1.8em',
                                            padding: '8px 16px',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <span style={{
                                            fontWeight: 900,
                                            color: isVerseSpeaking ? 'var(--primary-color)' : 'var(--primary-color)',
                                            minWidth: '2.8rem',
                                            textAlign: 'right',
                                            fontSize: '0.85em',
                                            opacity: isVerseSpeaking ? 1 : 0.2,
                                            paddingTop: '6px',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {v.index + 1}
                                        </span>
                                        <span style={{
                                            flex: 1,
                                            fontWeight: isVerseSpeaking ? 600 : 400,
                                            color: isVerseSpeaking ? 'var(--primary-color)' : 'inherit'
                                        }}>{v.text}</span>
                                    </div>
                                );
                            }) || <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '20vh', fontWeight: 700 }}>Preparing Pages...</div>}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Page Count (Bottom Right) */}
            <div style={{
                position: 'absolute', bottom: '34px', right: '44px',
                color: 'var(--secondary-text)', fontWeight: 900, fontSize: '0.9rem',
                opacity: 0.4, letterSpacing: '3px'
            }}>
                {currentPage + 1} <span style={{ opacity: 0.2 }}>/</span> {pages.length}
            </div>

            <div style={{
                position: 'absolute', bottom: '34px', left: '44px',
                opacity: 0.1, fontSize: '0.65rem', fontWeight: 900,
                letterSpacing: '5px', textTransform: 'uppercase'
            }}>
                PAGINATED READING
            </div>
        </motion.div>
    );
};

export default FullscreenReader;
