import React, { useState, useRef, useLayoutEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle, StopCircle, LogOut, StickyNote, Bookmark, BookmarkCheck, Edit2, Check } from 'lucide-react';
import type { VerseRange } from '../context/AppContext';

interface PaginatedPage {
    verses: { text: string; index: number }[];
}

const FullscreenReader: React.FC = () => {
    const {
        isFullscreenReader, setIsFullscreenReader,
        bibleData, lastRead, setLastRead,
        t, fontSize, lineHeight, fontFamily, pageTurnEffect,
        speak, stopSpeaking, isSpeaking, currentSpeakingId,
        toggleBookmark, isBookmarked, saveNote, getNote
    } = useAppContext();

    const [currentPage, setCurrentPage] = useState(0);
    const [pages, setPages] = useState<PaginatedPage[]>([]);
    const [showUI, setShowUI] = useState(false);
    const [showArcMenu, setShowArcMenu] = useState(false);
    const [interactionMode, setInteractionMode] = useState<'none' | 'bookmark' | 'note'>('none');
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [activeVerseIndex, setActiveVerseIndex] = useState<number | null>(null);
    const [tempNoteText, setTempNoteText] = useState("");

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
            const timer = setTimeout(paginateContent, 100);
            return () => clearTimeout(timer);
        }
    }, [currentChapter, fontSize, lineHeight, fontFamily, isFullscreenReader]);

    const handleNextPage = () => {
        setShowArcMenu(false);
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
        setShowArcMenu(false);
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
        if (!pageVerses || indexInPage >= pageVerses.length) return;

        const v = pageVerses[indexInPage];
        const verseId = `${currentBook.id} ${currentChapterIndex + 1}:${v.index + 1}`;

        speak(v.text, verseId, () => {
            if (indexInPage + 1 < pageVerses.length) {
                setTimeout(() => playVerseOnPage(indexInPage + 1), 100);
            }
        });
    };

    const handleSaveNote = () => {
        if (activeVerseIndex !== null && tempNoteText.trim()) {
            saveNote({
                bookId: currentBook.id,
                chapter: currentChapterIndex + 1,
                startVerse: activeVerseIndex + 1,
                endVerse: activeVerseIndex + 1
            }, tempNoteText);
            setShowNoteInput(false);
            setActiveVerseIndex(null);
        }
    };

    const handleVerseClickInMode = (verseIndex: number) => {
        const verseRange: VerseRange = {
            bookId: currentBook.id,
            chapter: currentChapterIndex + 1,
            startVerse: verseIndex + 1,
            endVerse: verseIndex + 1
        };

        if (interactionMode === 'bookmark') {
            toggleBookmark(verseRange);
        } else if (interactionMode === 'note') {
            const existingNote = getNote(currentBook.id, currentChapterIndex + 1, verseIndex + 1);
            setTempNoteText(existingNote?.text || "");
            setActiveVerseIndex(verseIndex);
            setShowNoteInput(true);
        }
    };

    const handleExitFullscreen = () => {
        const firstVerseIdx = pages[currentPage]?.verses[0]?.index;
        if (firstVerseIdx !== undefined) {
            setLastRead({ ...lastRead, verseNum: firstVerseIdx + 1 });
        }
        setIsFullscreenReader(false);
    };

    if (!isFullscreenReader) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'var(--bg-color)', zIndex: 9000,
                display: 'flex', flexDirection: 'column', overflow: 'hidden', userSelect: 'none'
            }}
        >
            <div ref={measurerRef} style={{
                position: 'absolute', visibility: 'hidden', width: 'calc(100% - 88px)',
                maxWidth: '950px', pointerEvents: 'none', left: '50%', transform: 'translateX(-50%)', zIndex: -1
            }} />

            {/* Top Indicator / Header */}
            <AnimatePresence>
                {showUI && (
                    <>
                        {/* Play/Pause Button */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ position: 'absolute', top: '32px', right: '44px', zIndex: 1000 }}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    isSpeaking ? stopSpeaking() : playCurrentPage();
                                }}
                                style={{
                                    background: isSpeaking ? '#ef4444' : 'var(--primary-color)', color: 'white', border: 'none',
                                    width: '40px', height: '40px', borderRadius: '20px', fontWeight: 800,
                                    cursor: 'pointer', boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {isSpeaking ? <StopCircle size={22} /> : <PlayCircle size={22} />}
                            </button>
                        </motion.div>

                        {/* Book Title Indicator */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 0.15, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{
                                position: 'absolute', top: '32px', left: '44px', fontSize: '0.8rem', fontWeight: 900,
                                color: 'var(--text-color)', letterSpacing: '4px', textTransform: 'uppercase', height: '52px',
                                display: 'flex', alignItems: 'center'
                            }}
                        >
                            {currentBook?.name} &bull; {currentChapterIndex + 1}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div
                style={{
                    flex: 1, display: 'flex', flexDirection: 'column', padding: '80px 44px 100px',
                    maxWidth: '950px', margin: '0 auto', width: '100%', justifyContent: 'flex-start',
                    position: 'relative', perspective: '2000px'
                }}
                onClick={(e) => {
                    const width = window.innerWidth;
                    if (e.clientX < width * 0.25) handlePrevPage();
                    else if (e.clientX > width * 0.75) handleNextPage();
                    else {
                        setShowArcMenu(false);
                        setShowUI(!showUI);
                    }
                }}
            >
                <AnimatePresence mode="popLayout" initial={false} custom={navDirection.current}>
                    <motion.div
                        key={`${currentBookIndex}-${currentChapterIndex}-${currentPage}`}
                        custom={navDirection.current}
                        variants={{
                            initial: (dir: string) => {
                                switch (pageTurnEffect) {
                                    case 'fade': return { opacity: 0 };
                                    case 'slide': return { x: dir === 'forward' ? '100%' : '-100%', opacity: 0 };
                                    case 'curl': return {
                                        rotateY: dir === 'forward' ? 45 : -45, x: dir === 'forward' ? '50%' : '-50%',
                                        opacity: 0, zIndex: 1, transformOrigin: dir === 'forward' ? 'left' : 'right'
                                    };
                                    default: return { opacity: 0 };
                                }
                            },
                            animate: { x: 0, opacity: 1, scale: 1, rotateY: 0, zIndex: 2, transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] } },
                            exit: (dir: string) => {
                                switch (pageTurnEffect) {
                                    case 'fade': return { opacity: 0 };
                                    case 'slide': return { x: dir === 'forward' ? '-100%' : '100%', opacity: 0 };
                                    case 'curl': return {
                                        rotateY: dir === 'forward' ? -90 : 90, x: dir === 'forward' ? '-100%' : '100%',
                                        opacity: 0, zIndex: 3, transformOrigin: dir === 'forward' ? 'left' : 'right'
                                    };
                                    default: return { opacity: 0 };
                                }
                            }
                        }}
                        initial="initial" animate="animate" exit="exit"
                        style={{ width: '100%', height: '100%', position: 'absolute', top: '80px', left: '44px', right: '44px', maxWidth: 'calc(100% - 88px)' }}
                    >
                        <div style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight, fontFamily: fontFamily, color: 'var(--text-color)', textAlign: 'justify' }}>
                            {pages[currentPage]?.verses.map((v) => {
                                const isVerseSpeaking = currentSpeakingId === `${currentBook.id} ${currentChapterIndex + 1}:${v.index + 1}`;
                                const note = getNote(currentBook.id, currentChapterIndex + 1, v.index + 1);
                                const bookmarked = isBookmarked(currentBook.id, currentChapterIndex + 1, v.index + 1);

                                return (
                                    <div
                                        key={v.index}
                                        onClick={(e) => {
                                            if (interactionMode !== 'none') {
                                                e.stopPropagation();
                                                handleVerseClickInMode(v.index);
                                            }
                                        }}
                                        style={{
                                            marginBottom: '1.8em', display: 'flex', gap: '24px', borderRadius: '16px', margin: '0 -16px 1.8em', padding: '8px 16px', transition: 'all 0.3s ease',
                                            backgroundColor: isVerseSpeaking ? 'rgba(var(--primary-rgb), 0.1)' : (interactionMode !== 'none' ? 'rgba(var(--primary-rgb), 0.03)' : 'transparent'),
                                            cursor: interactionMode !== 'none' ? 'pointer' : 'default',
                                            border: interactionMode !== 'none' ? '1px dashed rgba(var(--primary-rgb), 0.2)' : '1px solid transparent'
                                        }}
                                    >
                                        <span style={{ fontWeight: 900, color: 'var(--primary-color)', minWidth: '2.8rem', textAlign: 'right', fontSize: '0.85em', opacity: isVerseSpeaking ? 1 : 0.2, paddingTop: '6px' }}>
                                            {v.index + 1}
                                        </span>
                                        <div style={{ flex: 1 }}>
                                            <span style={{
                                                fontWeight: isVerseSpeaking ? 600 : 400,
                                                color: isVerseSpeaking ? 'var(--primary-color)' : 'inherit',
                                                display: 'inline'
                                            }}>
                                                {v.text}

                                                {/* Markers - Inline "Rich Text" style */}
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    verticalAlign: 'middle',
                                                    gap: '6px',
                                                    marginLeft: '12px',
                                                    opacity: (note || bookmarked) ? 1 : 0.2
                                                }}>
                                                    {bookmarked && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toggleBookmark({ bookId: currentBook.id, chapter: currentChapterIndex + 1, startVerse: v.index + 1, endVerse: v.index + 1 }); }}
                                                            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary-color)', cursor: 'pointer', display: 'flex' }}
                                                        >
                                                            <BookmarkCheck size={18} />
                                                        </button>
                                                    )}
                                                    {note && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleVerseClickInMode(v.index); }}
                                                            style={{ background: 'none', border: 'none', padding: 0, color: '#f59e0b', cursor: 'pointer', display: 'flex' }}
                                                        >
                                                            <StickyNote size={18} />
                                                        </button>
                                                    )}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                );
                            }) || <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '20vh', fontWeight: 700 }}>Preparing Pages...</div>}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div style={{ position: 'absolute', bottom: '34px', right: '44px', color: 'var(--secondary-text)', fontWeight: 900, fontSize: '0.9rem', opacity: 0.4, letterSpacing: '3px' }}>
                {currentPage + 1} <span style={{ opacity: 0.2 }}>/</span> {pages.length}
            </div>

            {/* Arc FAB Menu - Bottom Right with Top-Left Arc */}
            <div style={{ position: 'absolute', bottom: '24px', right: '40px', zIndex: 2000 }}>
                <AnimatePresence>
                    {showUI && (
                        <div style={{ position: 'relative' }}>
                            <AnimatePresence>
                                {showArcMenu && (
                                    <>
                                        {[
                                            { icon: <Bookmark size={22} />, color: '#6366f1', mode: 'bookmark', angle: -180 }, // Left
                                            { icon: <StickyNote size={22} />, color: '#f59e0b', mode: 'note', angle: -135 }, // Top-Left
                                            { icon: <LogOut size={22} />, color: '#ef4444', action: handleExitFullscreen, angle: -90 }  // Top
                                        ].map((item, idx) => {
                                            const rad = item.angle * Math.PI / 180;
                                            const r = 90;
                                            return (
                                                <motion.button
                                                    key={idx}
                                                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                                                    animate={{ x: r * Math.cos(rad), y: r * Math.sin(rad), opacity: 1, scale: 1 }}
                                                    exit={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                                                    whileHover={{ scale: 1.1 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (item.action) item.action();
                                                        else if (item.mode) { setInteractionMode(interactionMode === item.mode ? 'none' : (item.mode as any)); setShowArcMenu(false); }
                                                    }}
                                                    style={{
                                                        position: 'absolute', width: '56px', height: '56px', borderRadius: '28px', zIndex: 3,
                                                        background: interactionMode === item.mode ? item.color : 'var(--card-bg)', cursor: 'pointer',
                                                        color: interactionMode === item.mode ? 'white' : item.color, border: `2px solid ${item.color}`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                                                        // Adjust center so buttons rotate from the FAB center
                                                        top: '8px', left: '8px'
                                                    }}
                                                >
                                                    {item.icon}
                                                </motion.button>
                                            );
                                        })}
                                    </>
                                )}
                            </AnimatePresence>

                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (interactionMode !== 'none') {
                                        setInteractionMode('none');
                                    } else {
                                        setShowArcMenu(!showArcMenu);
                                    }
                                }}
                                style={{
                                    width: '72px', height: '72px', borderRadius: '36px', background: 'var(--primary-color)', color: 'white',
                                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 12px 30px rgba(var(--primary-rgb), 0.4)', cursor: 'pointer', zIndex: 10, position: 'relative'
                                }}
                            >
                                {interactionMode !== 'none' ? (
                                    <Check size={36} strokeWidth={3} />
                                ) : (showArcMenu ? <X size={32} /> : <Edit2 size={28} />)}
                            </motion.button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showNoteInput && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
                            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                        }}
                        onClick={() => setShowNoteInput(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            style={{ backgroundColor: 'var(--card-bg)', borderRadius: '32px', padding: '32px', width: '100%', maxWidth: '500px' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 style={{ margin: '0 0 20px', fontSize: '1.4rem', fontWeight: 800 }}>{t('reader.note')} - 第 {activeVerseIndex! + 1} 节</h3>
                            <textarea
                                value={tempNoteText} onChange={e => setTempNoteText(e.target.value)}
                                placeholder={t('reader.note_placeholder')}
                                style={{
                                    width: '100%', height: '150px', padding: '20px', borderRadius: '20px',
                                    background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)',
                                    fontSize: '1rem', resize: 'none', marginBottom: '24px'
                                }}
                                autoFocus
                            />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setShowNoteInput(false)} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', fontWeight: 700, cursor: 'pointer' }}>{t('common.cancel')}</button>
                                <button onClick={handleSaveNote} style={{ flex: 2, padding: '16px', borderRadius: '16px', background: 'var(--primary-color)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>{t('common.save')}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FullscreenReader;
