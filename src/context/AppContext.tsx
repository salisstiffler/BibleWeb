import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation, type Locale } from '../locales';

type Theme = 'light' | 'dark' | 'sepia';
type Language = 'zh-Hans' | 'zh-Hant' | 'en';

export interface BibleBook {
    id: string;
    name: string;
    chapters: string[][];
}

export interface VerseRange {
    bookId: string;
    chapter: number;
    startVerse: number;
    endVerse: number;
}

export interface RangeBookmark extends VerseRange {
    id: string; // Format: "bookId chapter:startVerse-endVerse"
}

export interface RangeHighlight extends VerseRange {
    id: string;
    color: string;
}

export interface RangeNote extends VerseRange {
    id: string;
    text: string;
}

interface AppContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    // Range-based bookmarks, highlights, notes
    bookmarks: RangeBookmark[];
    toggleBookmark: (range: VerseRange) => void;
    isBookmarked: (bookId: string, chapter: number, verse: number) => RangeBookmark | null;
    highlights: RangeHighlight[];
    setHighlight: (range: VerseRange, color: string | null) => void;
    getHighlight: (bookId: string, chapter: number, verse: number) => string | null;
    notes: RangeNote[];
    saveNote: (range: VerseRange, text: string) => void;
    getNote: (bookId: string, chapter: number, verse: number) => RangeNote | null;
    bibleData: BibleBook[];
    isLoadingBible: boolean;
    // TTS
    isSpeaking: boolean;
    currentSpeakingId: string | null;
    isAutoPlaying: boolean;
    setIsAutoPlaying: (val: boolean) => void;
    speak: (text: string, id: string, onEnd?: () => void, isRestarting?: boolean) => void;
    stopSpeaking: () => void;
    // Navigation & Last Read
    lastRead: { bookIndex: number; chapterIndex: number; verseNum?: number };
    setLastRead: (pos: { bookIndex: number; chapterIndex: number; verseNum?: number }) => void;
    // Continuous Reading Toggle
    continuousReading: boolean;
    setContinuousReading: (val: boolean) => void;
    // TTS Settings
    playbackRate: number;
    setPlaybackRate: (rate: number) => void;
    pauseOnManualSwitch: boolean;
    setPauseOnManualSwitch: (val: boolean) => void;
    loopCount: number;
    setLoopCount: (count: number) => void;
    showDrawer: boolean;
    setShowDrawer: (show: boolean) => void;
    isFullscreenReader: boolean;
    setIsFullscreenReader: (val: boolean) => void;
    // Reader Settings
    readingEffect: 'scroll' | 'horizontal' | 'pageFlip' | 'paginated';
    setReadingEffect: (effect: 'scroll' | 'horizontal' | 'pageFlip' | 'paginated') => void;
    lineHeight: number;
    setLineHeight: (height: number) => void;
    fontFamily: 'serif' | 'sans-serif';
    setFontFamily: (family: 'serif' | 'sans-serif') => void;
    customTheme: string | null;
    setCustomTheme: (theme: string | null) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Migration helper: convert old string format to new range format
const migrateOldData = () => {
    try {
        // Migrate bookmarks
        const oldBookmarks = localStorage.getItem('bookmarks');
        if (oldBookmarks) {
            const parsed = JSON.parse(oldBookmarks);
            // Check if it's old format (array of strings)
            if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                const migrated: RangeBookmark[] = parsed.map((verseId: string) => {
                    const spaceIdx = verseId.lastIndexOf(' ');
                    const bookId = verseId.substring(0, spaceIdx);
                    const position = verseId.substring(spaceIdx + 1);
                    const [chapterStr, verseStr] = position.split(':');
                    return {
                        id: verseId,
                        bookId,
                        chapter: parseInt(chapterStr),
                        startVerse: parseInt(verseStr),
                        endVerse: parseInt(verseStr)
                    };
                });
                localStorage.setItem('bookmarks', JSON.stringify(migrated));
            }
        }

        // Migrate highlights
        const oldHighlights = localStorage.getItem('highlights');
        if (oldHighlights) {
            const parsed = JSON.parse(oldHighlights);
            // Check if it's old format (object with string keys)
            if (!Array.isArray(parsed) && typeof parsed === 'object') {
                const migrated: RangeHighlight[] = Object.entries(parsed).map(([verseId, color]) => {
                    const spaceIdx = verseId.lastIndexOf(' ');
                    const bookId = verseId.substring(0, spaceIdx);
                    const position = verseId.substring(spaceIdx + 1);
                    const [chapterStr, verseStr] = position.split(':');
                    return {
                        id: verseId,
                        bookId,
                        chapter: parseInt(chapterStr),
                        startVerse: parseInt(verseStr),
                        endVerse: parseInt(verseStr),
                        color: color as string
                    };
                });
                localStorage.setItem('highlights', JSON.stringify(migrated));
            }
        }

        // Migrate notes
        const oldNotes = localStorage.getItem('notes');
        if (oldNotes) {
            const parsed = JSON.parse(oldNotes);
            // Check if it's old format (object with string keys)
            if (!Array.isArray(parsed) && typeof parsed === 'object') {
                const migrated: RangeNote[] = Object.entries(parsed).map(([verseId, text]) => {
                    const spaceIdx = verseId.lastIndexOf(' ');
                    const bookId = verseId.substring(0, spaceIdx);
                    const position = verseId.substring(spaceIdx + 1);
                    const [chapterStr, verseStr] = position.split(':');
                    return {
                        id: verseId,
                        bookId,
                        chapter: parseInt(chapterStr),
                        startVerse: parseInt(verseStr),
                        endVerse: parseInt(verseStr),
                        text: text as string
                    };
                });
                localStorage.setItem('notes', JSON.stringify(migrated));
            }
        }
    } catch (e) {
        console.error('Migration failed:', e);
    }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Run migration before initializing state
    React.useEffect(() => {
        migrateOldData();
    }, []);

    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('theme') as Theme) || 'light';
    });
    const [language, setLanguage] = useState<Language>(() => {
        return (localStorage.getItem('language') as Language) || 'zh-Hans';
    });
    const [fontSize, setFontSize] = useState<number>(() => {
        return parseInt(localStorage.getItem('fontSize') || '18');
    });
    const [bookmarks, setBookmarks] = useState<RangeBookmark[]>(() => {
        return JSON.parse(localStorage.getItem('bookmarks') || '[]');
    });
    const [highlights, setHighlights] = useState<RangeHighlight[]>(() => {
        return JSON.parse(localStorage.getItem('highlights') || '[]');
    });
    const [notes, setNotes] = useState<RangeNote[]>(() => {
        return JSON.parse(localStorage.getItem('notes') || '[]');
    });
    const [bibleData, setBibleData] = useState<BibleBook[]>([]);
    const [isLoadingBible, setIsLoadingBible] = useState(true);

    const [continuousReading, setContinuousReadingState] = useState<boolean>(() => {
        return localStorage.getItem('continuousReading') === 'true';
    });

    const setContinuousReading = (val: boolean) => {
        setContinuousReadingState(val);
        localStorage.setItem('continuousReading', val.toString());
    };

    const [playbackRate, setPlaybackRateState] = useState<number>(() => {
        return parseFloat(localStorage.getItem('playbackRate') || '1.0');
    });

    const setPlaybackRate = (rate: number) => {
        setPlaybackRateState(rate);
        localStorage.setItem('playbackRate', rate.toString());
    };

    const [pauseOnManualSwitch, setPauseOnManualSwitchState] = useState<boolean>(() => {
        return localStorage.getItem('pauseOnManualSwitch') === 'true';
    });

    const setPauseOnManualSwitch = (val: boolean) => {
        setPauseOnManualSwitchState(val);
        localStorage.setItem('pauseOnManualSwitch', val.toString());
    };

    const [loopCount, setLoopCountState] = useState<number>(() => {
        return parseInt(localStorage.getItem('loopCount') || '1');
    });

    const setLoopCount = (count: number) => {
        setLoopCountState(count);
        localStorage.setItem('loopCount', count.toString());
    };

    const [showDrawer, setShowDrawer] = useState(false);
    const [isFullscreenReader, setIsFullscreenReader] = useState(false);

    // Reading Position
    const [lastRead, setLastReadState] = useState<{ bookIndex: number; chapterIndex: number; verseNum?: number }>(() => {
        return JSON.parse(localStorage.getItem('lastRead') || '{"bookIndex":0,"chapterIndex":0}');
    });

    const setLastRead = (pos: { bookIndex: number; chapterIndex: number; verseNum?: number }) => {
        setLastReadState(pos);
        localStorage.setItem('lastRead', JSON.stringify(pos));
    };

    // Reader Mode Settings
    const [readingEffect, setReadingEffectState] = useState<'scroll' | 'horizontal' | 'pageFlip' | 'paginated'>(() => {
        return (localStorage.getItem('readingEffect') as any) || 'scroll';
    });
    const setReadingEffect = (effect: 'scroll' | 'horizontal' | 'pageFlip' | 'paginated') => {
        setReadingEffectState(effect);
        localStorage.setItem('readingEffect', effect);
    };

    const [lineHeight, setLineHeightState] = useState<number>(() => {
        return parseFloat(localStorage.getItem('lineHeight') || '1.6');
    });
    const setLineHeight = (height: number) => {
        setLineHeightState(height);
        localStorage.setItem('lineHeight', height.toString());
    };

    const [fontFamily, setFontFamilyState] = useState<'serif' | 'sans-serif'>(() => {
        return (localStorage.getItem('fontFamily') as any) || 'sans-serif';
    });
    const setFontFamily = (family: 'serif' | 'sans-serif') => {
        setFontFamilyState(family);
        localStorage.setItem('fontFamily', family);
    };

    const [customTheme, setCustomThemeState] = useState<string | null>(() => {
        return localStorage.getItem('customTheme');
    });
    const setCustomTheme = (theme: string | null) => {
        setCustomThemeState(theme);
        if (theme) localStorage.setItem('customTheme', theme);
        else localStorage.removeItem('customTheme');
    };

    // TTS State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
    const [currentSpeakingText, setCurrentSpeakingText] = useState<string | null>(null);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const activeSpeakIdRef = React.useRef<string | null>(null);

    // Live Voice/Rate Switching
    useEffect(() => {
        if (isSpeaking && currentSpeakingId && currentSpeakingText) {
            const saveId = currentSpeakingId;
            const saveText = currentSpeakingText;
            const timer = setTimeout(() => {
                speak(saveText, saveId, undefined, true);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [language, playbackRate]);

    useEffect(() => {
        setIsLoadingBible(true);
        const fileName = language === 'en' ? 'bible-en.json' : language === 'zh-Hant' ? 'bible-zh-hant.json' : 'bible-zh.json';

        fetch(`/${fileName}`)
            .then(res => res.json())
            .then(data => {
                // Map names based on current language using the translation helper
                const mappedData = data.map((book: any) => ({
                    ...book,
                    name: getTranslation(language as Locale, `books.${book.id}`) || book.id
                }));
                setBibleData(mappedData);
                setIsLoadingBible(false);
            })
            .catch(err => {
                console.error('Failed to load bible data:', err);
                setIsLoadingBible(false);
            });
    }, [language]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    useEffect(() => {
        document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
        localStorage.setItem('fontSize', fontSize.toString());
    }, [fontSize]);

    useEffect(() => {
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    useEffect(() => {
        localStorage.setItem('highlights', JSON.stringify(highlights));
    }, [highlights]);

    useEffect(() => {
        localStorage.setItem('notes', JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        if (customTheme) {
            document.documentElement.style.setProperty('--custom-bg', customTheme);
            document.documentElement.setAttribute('data-custom-theme', 'true');
        } else {
            document.documentElement.removeAttribute('data-custom-theme');
        }
    }, [customTheme]);

    useEffect(() => {
        document.documentElement.style.setProperty('--line-height', lineHeight.toString());
    }, [lineHeight]);

    useEffect(() => {
        document.documentElement.setAttribute('data-reading-effect', readingEffect);
    }, [readingEffect]);

    useEffect(() => {
        document.documentElement.setAttribute('data-fullscreen', isFullscreenReader.toString());
    }, [isFullscreenReader]);

    useEffect(() => {
        document.documentElement.style.setProperty('--font-family', fontFamily === 'serif' ? '"Noto Serif SC", "Source Han Serif SC", serif' : 'system-ui, -apple-system, sans-serif');
    }, [fontFamily]);

    // TTS Implementation
    const speak = (text: string, id: string, onEnd?: () => void, isRestarting = false) => {
        const synth = window.speechSynthesis;
        synth.cancel();

        if (!isRestarting && isSpeaking && currentSpeakingId === id && !onEnd) {
            stopSpeaking();
            return;
        }

        activeSpeakIdRef.current = id;
        setIsSpeaking(true);
        setCurrentSpeakingId(id);
        setCurrentSpeakingText(text);

        const executeSpeak = () => {
            if (activeSpeakIdRef.current !== id) return;

            const utterance = new SpeechSynthesisUtterance(text);
            const voices = synth.getVoices();

            // Map Language
            let langCode = 'zh-CN';
            if (language === 'en') langCode = 'en-US';
            if (language === 'zh-Hant') langCode = 'zh-HK';

            const langPrefix = language === 'en' ? 'en' : language === 'zh-Hans' ? 'zh-cn' : 'zh-hk';
            const langVoices = voices.filter(v => v.lang.toLowerCase().includes(langPrefix));

            // Auto selection based on quality names
            const preferredVoices = ['Samantha', 'Xiaoxiao', 'Daniel', 'Kangkang', 'Ting-Ting', 'Sin-Ji'];
            const selectedVoice = langVoices.find(v => preferredVoices.some(name => v.name.includes(name))) || langVoices[0];

            if (selectedVoice) {
                utterance.voice = selectedVoice;
                utterance.lang = selectedVoice.lang;
            } else {
                utterance.lang = langCode;
            }

            // Apply Rate & Pitch
            utterance.rate = playbackRate;
            utterance.pitch = 1.0;

            utterance.onend = () => {
                if (activeSpeakIdRef.current === id) {
                    setIsSpeaking(false);
                    setCurrentSpeakingId(null);
                    setCurrentSpeakingText(null);
                    activeSpeakIdRef.current = null;
                }
                if (onEnd) onEnd();
            };

            utterance.onerror = (event: any) => {
                if (event.error !== 'interrupted' && event.error !== 'canceled') {
                    if (activeSpeakIdRef.current === id) {
                        setIsSpeaking(false);
                        setCurrentSpeakingId(null);
                        setCurrentSpeakingText(null);
                    }
                }
            };

            synth.speak(utterance);
            if (synth.paused) synth.resume();
        };

        setTimeout(executeSpeak, 100);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
        setIsAutoPlaying(false);
    };

    const createRangeId = (range: VerseRange): string => {
        if (range.startVerse === range.endVerse) {
            return `${range.bookId} ${range.chapter}:${range.startVerse}`;
        }
        return `${range.bookId} ${range.chapter}:${range.startVerse}-${range.endVerse}`;
    };

    const toggleBookmark = (range: VerseRange) => {
        const id = createRangeId(range);
        setBookmarks(prev => {
            const existing = prev.find(b => b.id === id);
            if (existing) {
                return prev.filter(b => b.id !== id);
            }
            return [...prev, { ...range, id }];
        });
    };

    const isBookmarked = (bookId: string, chapter: number, verse: number): RangeBookmark | null => {
        return bookmarks.find(b =>
            b.bookId === bookId &&
            b.chapter === chapter &&
            verse >= b.startVerse &&
            verse <= b.endVerse
        ) || null;
    };

    const setHighlight = (range: VerseRange, color: string | null) => {
        const id = createRangeId(range);
        setHighlights(prev => {
            const filtered = prev.filter(h => h.id !== id);
            if (color) {
                return [...filtered, { ...range, id, color }];
            }
            return filtered;
        });
    };

    const getHighlight = (bookId: string, chapter: number, verse: number): string | null => {
        const highlight = highlights.find(h =>
            h.bookId === bookId &&
            h.chapter === chapter &&
            verse >= h.startVerse &&
            verse <= h.endVerse
        );
        return highlight ? highlight.color : null;
    };

    const saveNote = (range: VerseRange, text: string) => {
        const id = createRangeId(range);
        setNotes(prev => {
            const filtered = prev.filter(n => n.id !== id);
            if (text.trim()) {
                return [...filtered, { ...range, id, text }];
            }
            return filtered;
        });
    };

    const getNote = (bookId: string, chapter: number, verse: number): RangeNote | null => {
        return notes.find(n =>
            n.bookId === bookId &&
            n.chapter === chapter &&
            verse >= n.startVerse &&
            verse <= n.endVerse
        ) || null;
    };

    const t = (key: string, params?: Record<string, string | number>) => {
        return getTranslation(language as Locale, key, params);
    };

    return (
        <AppContext.Provider value={{
            theme, setTheme,
            language, setLanguage,
            fontSize, setFontSize,
            bookmarks, toggleBookmark, isBookmarked,
            highlights, setHighlight, getHighlight,
            notes, saveNote, getNote,
            bibleData, isLoadingBible,
            isSpeaking, currentSpeakingId, speak, stopSpeaking,
            isAutoPlaying, setIsAutoPlaying,
            lastRead, setLastRead,
            continuousReading, setContinuousReading,
            playbackRate, setPlaybackRate,
            pauseOnManualSwitch, setPauseOnManualSwitch,
            loopCount, setLoopCount,
            showDrawer, setShowDrawer,
            readingEffect, setReadingEffect,
            lineHeight, setLineHeight,
            fontFamily, setFontFamily,
            customTheme, setCustomTheme,
            isFullscreenReader,
            setIsFullscreenReader,
            t
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within AppProvider');
    return context;
};
