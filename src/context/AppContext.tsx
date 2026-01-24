import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'sepia';
type Language = 'zh-Hans' | 'zh-Hant' | 'en';

export interface BibleBook {
    name: string;
    chapters: string[][];
}

interface AppContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    bookmarks: string[]; // Format: "Book Chapter:Verse"
    toggleBookmark: (verseId: string) => void;
    isBookmarked: (verseId: string) => boolean;
    highlights: Record<string, string>; // verseId -> color
    setHighlight: (verseId: string, color: string | null) => void;
    notes: Record<string, string>; // verseId -> note text
    saveNote: (verseId: string, text: string) => void;
    bibleData: BibleBook[];
    isLoadingBible: boolean;
    // TTS
    isSpeaking: boolean;
    currentSpeakingId: string | null;
    isAutoPlaying: boolean;
    setIsAutoPlaying: (val: boolean) => void;
    speak: (text: string, id: string, onEnd?: () => void) => void;
    stopSpeaking: () => void;
    // Navigation & Last Read
    lastRead: { bookIndex: number; chapterIndex: number; verseNum?: number };
    setLastRead: (pos: { bookIndex: number; chapterIndex: number; verseNum?: number }) => void;
    // Continuous Reading Toggle
    continuousReading: boolean;
    setContinuousReading: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('theme') as Theme) || 'light';
    });
    const [language, setLanguage] = useState<Language>(() => {
        return (localStorage.getItem('language') as Language) || 'zh-Hans';
    });
    const [fontSize, setFontSize] = useState<number>(() => {
        return parseInt(localStorage.getItem('fontSize') || '18');
    });
    const [bookmarks, setBookmarks] = useState<string[]>(() => {
        return JSON.parse(localStorage.getItem('bookmarks') || '[]');
    });
    const [highlights, setHighlights] = useState<Record<string, string>>(() => {
        return JSON.parse(localStorage.getItem('highlights') || '{}');
    });
    const [notes, setNotes] = useState<Record<string, string>>(() => {
        return JSON.parse(localStorage.getItem('notes') || '{}');
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

    // Reading Position
    const [lastRead, setLastReadState] = useState<{ bookIndex: number; chapterIndex: number; verseNum?: number }>(() => {
        return JSON.parse(localStorage.getItem('lastRead') || '{"bookIndex":0,"chapterIndex":0}');
    });

    const setLastRead = (pos: { bookIndex: number; chapterIndex: number; verseNum?: number }) => {
        setLastReadState(pos);
        localStorage.setItem('lastRead', JSON.stringify(pos));
    };

    // TTS State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);

    useEffect(() => {
        setIsLoadingBible(true);
        const fileName = language === 'en' ? 'bible-en.json' :
            language === 'zh-Hant' ? 'bible-zh-hant.json' :
                'bible-zh.json';

        fetch(`/${fileName}`)
            .then(res => res.json())
            .then(data => {
                setBibleData(data);
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

    // TTS Implementation
    const speak = (text: string, id: string, onEnd?: () => void) => {
        // Stop current speaking if any
        window.speechSynthesis.cancel();

        if (isSpeaking && currentSpeakingId === id && !onEnd) {
            setIsSpeaking(false);
            setCurrentSpeakingId(null);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Match language
        if (language === 'en') {
            utterance.lang = 'en-US';
        } else if (language === 'zh-Hans') {
            utterance.lang = 'zh-CN';
        } else {
            utterance.lang = 'zh-HK';
        }

        utterance.onstart = () => {
            setIsSpeaking(true);
            setCurrentSpeakingId(id);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setCurrentSpeakingId(null);
            if (onEnd) onEnd();
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
            setCurrentSpeakingId(null);
        };

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
        setIsAutoPlaying(false);
    };

    const toggleBookmark = (verseId: string) => {
        setBookmarks(prev =>
            prev.includes(verseId)
                ? prev.filter(id => id !== verseId)
                : [...prev, verseId]
        );
    };

    const isBookmarked = (verseId: string) => bookmarks.includes(verseId);

    const setHighlight = (verseId: string, color: string | null) => {
        setHighlights(prev => {
            const next = { ...prev };
            if (color) next[verseId] = color;
            else delete next[verseId];
            return next;
        });
    };

    const saveNote = (verseId: string, text: string) => {
        setNotes(prev => {
            const next = { ...prev };
            if (text.trim()) next[verseId] = text;
            else delete next[verseId];
            return next;
        });
    };

    return (
        <AppContext.Provider value={{
            theme, setTheme,
            language, setLanguage,
            fontSize, setFontSize,
            bookmarks, toggleBookmark, isBookmarked,
            highlights, setHighlight,
            notes, saveNote,
            bibleData, isLoadingBible,
            isSpeaking, currentSpeakingId, speak, stopSpeaking,
            isAutoPlaying, setIsAutoPlaying,
            lastRead, setLastRead,
            continuousReading, setContinuousReading
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
