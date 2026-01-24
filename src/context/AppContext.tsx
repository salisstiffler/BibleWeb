import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'sepia';
type Language = 'zh-Hans' | 'zh-Hant' | 'en';

export interface BibleBook {
    id: string;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const bookNamesMapping: Record<string, Record<string, string>> = {
    'zh-Hans': {
        gn: '创世记', ex: '出埃及记', lv: '利未记', nm: '民数记', dt: '申命记', js: '约书亚记', jud: '士师记', rt: '路得记', '1sm': '撒母耳记上', '2sm': '撒母耳记下', '1kgs': '列王纪上', '2kgs': '列王纪下', '1ch': '历代志上', '2ch': '历代志下', ezr: '以斯拉记', ne: '尼希米记', et: '以斯帖记', job: '约伯记', ps: '诗篇', prv: '箴言', ec: '传道书', so: '雅歌', is: '以赛亚书', jr: '耶利米书', lm: '耶利米哀歌', ez: '以西结书', dn: '但以理书', ho: '何西阿书', jl: '约珥书', am: '阿摩司书', ob: '俄巴底亚书', jn: '约拿书', mi: '弥迦书', na: '那鸿书', hk: '哈巴谷书', zp: '西番雅书', hg: '哈该书', zc: '撒迦利亚书', ml: '玛拉基书', mt: '马太福音', mk: '马可福音', lk: '路加福音', jo: '约翰福音', act: '使徒行传', rm: '罗马书', '1co': '哥林多前书', '2co': '哥林多后书', gl: '加拉太书', eph: '以弗所书', ph: '腓立比书', cl: '歌罗西书', '1ts': '帖撒罗尼迦前书', '2ts': '帖撒罗尼迦后书', '1tm': '提摩太前书', '2tm': '提摩太后书', tt: '提多书', phm: '腓利门书', hb: '希伯来书', jm: '雅各书', '1pe': '彼得前书', '2pe': '彼得后书', '1jo': '约翰一书', '2jo': '约翰二书', '3jo': '约翰三书', jd: '犹大书', re: '启示录'
    },
    'zh-Hant': {
        gn: '創世記', ex: '出埃及記', lv: '利未記', nm: '民數記', dt: '申命記', js: '約書亞記', jud: '士師記', rt: '路得記', '1sm': '撒母耳記上', '2sm': '撒母耳記下', '1kgs': '列王紀上', '2kgs': '列王紀下', '1ch': '歷代志上', '2ch': '歷代志下', ezr: '以斯拉記', ne: '尼希米記', et: '以斯帖記', job: '約伯記', ps: '詩篇', prv: '箴言', ec: '傳道書', so: '雅歌', is: '以賽亞書', jr: '耶利米書', lm: '耶利米哀歌', ez: '以西結書', dn: '但以理書', ho: '何西阿書', jl: '約珥書', am: '阿摩司書', ob: '俄巴底亞書', jn: '約拿書', mi: '彌迦書', na: '那鴻書', hk: '哈巴谷書', zp: '西番雅書', hg: '哈該書', zc: '撒迦利亞書', ml: '瑪拉基書', mt: '馬太福音', mk: '馬可福音', lk: '路加福音', jo: '約翰福音', act: '使徒行傳', rm: '羅馬書', '1co': '哥林多前書', '2co': '哥林多後書', gl: '加拉太書', eph: '以弗所書', ph: '腓立比書', cl: '歌羅西書', '1ts': '帖撒羅尼迦前書', '2ts': '帖撒羅尼迦後書', '1tm': '提摩太前書', '2tm': '提摩太後書', tt: '提多書', phm: '腓利門書', hb: '希伯來書', jm: '雅各書', '1pe': '彼得前書', '2pe': '彼得後書', '1jo': '約翰一書', '2jo': '約翰二書', '3jo': '約翰三書', jd: '猶大書', re: '啟示錄'
    },
    'en': {
        gn: 'Genesis', ex: 'Exodus', lv: 'Leviticus', nm: 'Numbers', dt: 'Deuteronomy', js: 'Joshua', jud: 'Judges', rt: 'Ruth', '1sm': '1 Samuel', '2sm': '2 Samuel', '1kgs': '1 Kings', '2kgs': '2 Kings', '1ch': '1 Chronicles', '2ch': '2 Chronicles', ezr: 'Ezra', ne: 'Nehemiah', et: 'Esther', job: 'Job', ps: 'Psalms', prv: 'Proverbs', ec: 'Ecclesiastes', so: 'Song of Solomon', is: 'Isaiah', jr: 'Jeremiah', lm: 'Lamentations', ez: 'Ezekiel', dn: 'Daniel', ho: 'Hosea', jl: 'Joel', am: 'Amos', ob: 'Obadiah', jn: 'Jonah', mi: 'Micah', na: 'Naum', hk: 'Habakkuk', zp: 'Zephaniah', hg: 'Haggai', zc: 'Zechariah', ml: 'Malachi', mt: 'Matthew', mk: 'Mark', lk: 'Luke', jo: 'John', act: 'Acts', rm: 'Romans', '1co': '1 Corinthians', '2co': '2 Corinthians', gl: 'Galatians', eph: 'Ephesians', ph: 'Philippians', cl: 'Colossians', '1ts': '1 Thessalonians', '2ts': '2 Thessalonians', '1tm': '1 Timothy', '2tm': '2 Timothy', tt: 'Titus', phm: 'Philemon', hb: 'Hebrews', jm: 'James', '1pe': '1 Peter', '2pe': '2 Peter', '1jo': '1 John', '2jo': '2 John', '3jo': '3 John', jd: 'Jude', re: 'Revelation'
    }
};

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

    const [playbackRate, setPlaybackRateState] = useState<number>(() => {
        return parseFloat(localStorage.getItem('playbackRate') || '1.0');
    });

    const setPlaybackRate = (rate: number) => {
        setPlaybackRateState(rate);
        localStorage.setItem('playbackRate', rate.toString());
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
        const fileName = language === 'en' ? 'bible-en.json' : 'bible-zh.json';

        fetch(`/${fileName}`)
            .then(res => res.json())
            .then(data => {
                // Map names based on current language
                const mappedData = data.map((book: any) => ({
                    ...book,
                    name: bookNamesMapping[language][book.id] || book.id
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
            continuousReading, setContinuousReading,
            playbackRate, setPlaybackRate
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
