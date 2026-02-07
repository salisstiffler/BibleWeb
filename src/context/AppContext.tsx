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

export interface User {
    id: number;
    username: string;
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
    lineHeight: number;
    setLineHeight: (height: number) => void;
    fontFamily: 'sans' | 'serif' | 'kai' | 'rounded';
    setFontFamily: (family: 'sans' | 'serif' | 'kai' | 'rounded') => void;
    customTheme: string | null;
    setCustomTheme: (theme: string | null) => void;
    accentColor: string;
    setAccentColor: (color: string) => void;
    pageTurnEffect: 'none' | 'fade' | 'slide' | 'curl';
    setPageTurnEffect: (effect: 'none' | 'fade' | 'slide' | 'curl') => void;
    parallelLanguage: Language | null;
    setParallelLanguage: (lang: Language | null) => void;
    parallelBibleData: BibleBook[];
    t: (key: string, params?: Record<string, string | number>) => string;
    // Auth
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => void;
    syncData: () => Promise<void>;
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
    const [parallelBibleData, setParallelBibleData] = useState<BibleBook[]>([]);
    const [isLoadingBible, setIsLoadingBible] = useState(true);

    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('token');
    });

    const API_URL = 'https://api.berlin2025.dpdns.org/api';

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


    const [lineHeight, setLineHeightState] = useState<number>(() => {
        return parseFloat(localStorage.getItem('lineHeight') || '1.6');
    });
    const setLineHeight = (height: number) => {
        setLineHeightState(height);
        localStorage.setItem('lineHeight', height.toString());
    };

    const [fontFamily, setFontFamilyState] = useState<'sans' | 'serif' | 'kai' | 'rounded'>(() => {
        return (localStorage.getItem('fontFamily') as any) || 'sans';
    });
    const setFontFamily = (family: 'sans' | 'serif' | 'kai' | 'rounded') => {
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

    const [accentColor, setAccentColorState] = useState<string>(() => {
        return localStorage.getItem('accentColor') || '#6366f1';
    });
    const setAccentColor = (color: string) => {
        setAccentColorState(color);
        localStorage.setItem('accentColor', color);
    };

    const [pageTurnEffect, setPageTurnEffectState] = useState<'none' | 'fade' | 'slide' | 'curl'>(() => {
        return (localStorage.getItem('pageTurnEffect') as any) || 'curl';
    });
    const setPageTurnEffect = (effect: 'none' | 'fade' | 'slide' | 'curl') => {
        setPageTurnEffectState(effect);
        localStorage.setItem('pageTurnEffect', effect);
    };

    const [parallelLanguage, setParallelLanguageState] = useState<Language | null>(() => {
        return (localStorage.getItem('parallelLanguage') as Language) || null;
    });

    const setParallelLanguage = (lang: Language | null) => {
        setParallelLanguageState(lang);
        if (lang) localStorage.setItem('parallelLanguage', lang);
        else localStorage.removeItem('parallelLanguage');
    };

    // TTS State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
    const [currentSpeakingText, setCurrentSpeakingText] = useState<string | null>(null);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const activeSpeakIdRef = React.useRef<string | null>(null);

    // Backend Logic
    const register = async (username: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Merge and upload local data to server after registration/login
        await mergeAndSyncData(data.token);
    };

    const login = async (username: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Merge and upload local data to server after registration/login
        await mergeAndSyncData(data.token);
    };

    // Merge local data with server data (for login and registration)
    const mergeAndSyncData = async (tk: string) => {
        try {
            // Save current local data
            const localBookmarks = [...bookmarks];
            const localHighlights = [...highlights];
            const localNotes = [...notes];

            console.log('📥 Fetching server data...');
            console.log('💾 Local data before merge:', {
                bookmarks: localBookmarks.length,
                highlights: localHighlights.length,
                notes: localNotes.length
            });

            // Fetch server data
            const res = await fetch(`${API_URL}/user/profile`, {
                headers: { 'Authorization': `Bearer ${tk}` }
            });
            const data = await res.json();

            console.log('📥 Received profile data:', data);
            console.log('📚 Bookmarks:', data.bookmarks);
            console.log('📝 Notes:', data.notes);
            console.log('🎨 Highlights:', data.highlights);

            // Apply server settings
            if (data.settings) {
                if (data.settings.theme) setTheme(data.settings.theme);
                if (data.settings.language) setLanguage(data.settings.language);
                if (data.settings.font_size) setFontSize(data.settings.font_size);
                if (data.settings.line_height) setLineHeight(data.settings.line_height);
                if (data.settings.font_family) setFontFamily(data.settings.font_family);
                setCustomTheme(data.settings.custom_theme);
                if (data.settings.accent_color) setAccentColor(data.settings.accent_color);
                if (data.settings.page_turn_effect) setPageTurnEffect(data.settings.page_turn_effect);
                if (data.settings.continuous_reading !== undefined) setContinuousReading(data.settings.continuous_reading === 1);
                if (data.settings.playback_rate) setPlaybackRate(data.settings.playback_rate);
                if (data.settings.pause_on_manual_switch !== undefined) setPauseOnManualSwitch(data.settings.pause_on_manual_switch === 1);
                if (data.settings.loop_count) setLoopCount(data.settings.loop_count);
            }

            // Apply server progress
            if (data.progress) {
                setLastRead({
                    bookIndex: data.progress.book_index,
                    chapterIndex: data.progress.chapter_index,
                    verseNum: data.progress.verse_num || undefined
                });
            }

            // Merge bookmarks (combine local and server, remove duplicates)
            const serverBookmarks = data.bookmarks || [];
            const mergedBookmarks = [...serverBookmarks];
            const serverBookmarkIds = new Set(serverBookmarks.map((b: any) => b.id));

            localBookmarks.forEach(localBookmark => {
                if (!serverBookmarkIds.has(localBookmark.id)) {
                    mergedBookmarks.push(localBookmark);
                }
            });

            // Merge highlights
            const serverHighlights = data.highlights || [];
            const mergedHighlights = [...serverHighlights];
            const serverHighlightIds = new Set(serverHighlights.map((h: any) => h.id));

            localHighlights.forEach(localHighlight => {
                if (!serverHighlightIds.has(localHighlight.id)) {
                    mergedHighlights.push(localHighlight);
                }
            });

            // Merge notes
            const serverNotes = data.notes || [];
            const mergedNotes = [...serverNotes];
            const serverNoteIds = new Set(serverNotes.map((n: any) => n.id));

            localNotes.forEach(localNote => {
                if (!serverNoteIds.has(localNote.id)) {
                    mergedNotes.push(localNote);
                }
            });

            console.log('🔄 Merged data:', {
                bookmarks: mergedBookmarks.length,
                highlights: mergedHighlights.length,
                notes: mergedNotes.length
            });

            // Update local state with merged data
            if (mergedBookmarks.length > 0) {
                console.log('✅ Setting bookmarks:', mergedBookmarks);
                setBookmarks(mergedBookmarks);
            }
            if (mergedHighlights.length > 0) {
                console.log('✅ Setting highlights:', mergedHighlights);
                setHighlights(mergedHighlights);
            }
            if (mergedNotes.length > 0) {
                console.log('✅ Setting notes:', mergedNotes);
                setNotes(mergedNotes);
            }

            // Upload merged data back to server
            console.log('📤 Uploading merged data to server...');

            // Use server settings/progress if they exist, otherwise use current local state
            const finalSettings = data.settings ? {
                theme: data.settings.theme || theme,
                language: data.settings.language || language,
                fontSize: data.settings.font_size || fontSize,
                lineHeight: data.settings.line_height || lineHeight,
                fontFamily: data.settings.font_family || fontFamily,
                customTheme: data.settings.custom_theme || customTheme,
                accentColor: data.settings.accent_color || accentColor,
                pageTurnEffect: data.settings.page_turn_effect || pageTurnEffect,
                continuousReading: data.settings.continuous_reading === 1 || continuousReading,
                playbackRate: data.settings.playback_rate || playbackRate,
                pauseOnManualSwitch: data.settings.pause_on_manual_switch === 1 || pauseOnManualSwitch,
                loopCount: data.settings.loop_count || loopCount
            } : {
                theme, language, fontSize, lineHeight, fontFamily, customTheme, accentColor, pageTurnEffect,
                continuousReading, playbackRate, pauseOnManualSwitch, loopCount
            };

            const finalProgress = data.progress ? {
                bookIndex: data.progress.book_index,
                chapterIndex: data.progress.chapter_index,
                verseNum: data.progress.verse_num
            } : {
                bookIndex: lastRead.bookIndex,
                chapterIndex: lastRead.chapterIndex,
                verseNum: lastRead.verseNum
            };

            await fetch(`${API_URL}/user/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tk}`
                },
                body: JSON.stringify({
                    settings: finalSettings,
                    progress: finalProgress,
                    bookmarks: mergedBookmarks,
                    highlights: mergedHighlights,
                    notes: mergedNotes
                })
            });
            console.log('✅ Merged data uploaded successfully');
        } catch (e) {
            console.error('❌ Merge and sync failed:', e);
            if (e instanceof Error && e.message.includes('Unauthorized')) {
                logout();
            }
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setBookmarks([]);
        setHighlights([]);
        setNotes([]);
        setLastRead({ bookIndex: 0, chapterIndex: 0 });

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('bookmarks');
        localStorage.removeItem('highlights');
        localStorage.removeItem('notes');
        localStorage.removeItem('lastRead');
    };

    // Sync progress only (called every minute)
    const syncProgress = async () => {
        if (!token) return;
        try {
            await fetch(`${API_URL}/user/sync-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    progress: {
                        bookIndex: lastRead.bookIndex,
                        chapterIndex: lastRead.chapterIndex,
                        verseNum: lastRead.verseNum
                    }
                })
            });
        } catch (e) {
            console.error('Progress sync failed', e);
        }
    };

    // Sync settings only (called when settings change)
    const syncSettings = async () => {
        if (!token) return;
        try {
            await fetch(`${API_URL}/user/sync-settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    settings: {
                        theme,
                        language,
                        fontSize,
                        lineHeight,
                        fontFamily,
                        customTheme,
                        accentColor,
                        pageTurnEffect,
                        continuousReading,
                        playbackRate,
                        pauseOnManualSwitch,
                        loopCount
                    }
                })
            });
        } catch (e) {
            console.error('Settings sync failed', e);
        }
    };

    // API call for adding bookmark
    const apiAddBookmark = async (bookmark: RangeBookmark) => {
        if (!token) return;
        try {
            await fetch(`${API_URL}/user/bookmark/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: bookmark.id,
                    bookId: bookmark.bookId,
                    chapter: bookmark.chapter,
                    startVerse: bookmark.startVerse,
                    endVerse: bookmark.endVerse
                })
            });
        } catch (e) {
            console.error('Add bookmark failed', e);
        }
    };

    // API call for removing bookmark
    const apiRemoveBookmark = async (id: string) => {
        if (!token) return;
        try {
            await fetch(`${API_URL}/user/bookmark/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id })
            });
        } catch (e) {
            console.error('Remove bookmark failed', e);
        }
    };

    // API call for setting highlight
    const apiSetHighlight = async (highlight: RangeHighlight) => {
        if (!token) return;
        try {
            await fetch(`${API_URL}/user/highlight/set`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: highlight.id,
                    bookId: highlight.bookId,
                    chapter: highlight.chapter,
                    startVerse: highlight.startVerse,
                    endVerse: highlight.endVerse,
                    color: highlight.color
                })
            });
        } catch (e) {
            console.error('Set highlight failed', e);
        }
    };

    // API call for removing highlight
    const apiRemoveHighlight = async (id: string) => {
        if (!token) return;
        try {
            await fetch(`${API_URL}/user/highlight/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id })
            });
        } catch (e) {
            console.error('Remove highlight failed', e);
        }
    };

    // API call for saving note
    const apiSaveNote = async (note: RangeNote) => {
        if (!token) return;
        try {
            await fetch(`${API_URL}/user/note/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: note.id,
                    bookId: note.bookId,
                    chapter: note.chapter,
                    startVerse: note.startVerse,
                    endVerse: note.endVerse,
                    text: note.text
                })
            });
        } catch (e) {
            console.error('Save note failed', e);
        }
    };

    // API call for removing note
    const apiRemoveNote = async (id: string) => {
        if (!token) return;
        try {
            await fetch(`${API_URL}/user/note/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id })
            });
        } catch (e) {
            console.error('Remove note failed', e);
        }
    };

    // Legacy full sync (keep for compatibility)
    const syncData = async () => {
        if (!token) return;
        try {
            await fetch(`${API_URL}/user/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    settings: {
                        theme,
                        language,
                        fontSize,
                        lineHeight,
                        fontFamily,
                        customTheme,
                        accentColor,
                        pageTurnEffect,
                        continuousReading,
                        playbackRate,
                        pauseOnManualSwitch,
                        loopCount
                    },
                    progress: {
                        bookIndex: lastRead.bookIndex,
                        chapterIndex: lastRead.chapterIndex,
                        verseNum: lastRead.verseNum
                    },
                    bookmarks,
                    highlights,
                    notes
                })
            });
        } catch (e) {
            console.error('Sync failed', e);
        }
    };

    useEffect(() => {
        if (token) {
            mergeAndSyncData(token);
        }
    }, []);

    // Sync progress every 1 minute
    useEffect(() => {
        if (token) {
            const interval = setInterval(syncProgress, 60000); // 60 seconds
            return () => clearInterval(interval);
        }
    }, [token, lastRead]);

    // Sync settings when they change (with debounce)
    useEffect(() => {
        if (token) {
            const timer = setTimeout(syncSettings, 2000); // 2 second debounce
            return () => clearTimeout(timer);
        }
    }, [theme, language, fontSize, lineHeight, fontFamily, customTheme, accentColor, pageTurnEffect,
        continuousReading, playbackRate, pauseOnManualSwitch, loopCount, token]);

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
        const loadBible = async (lang: Language, isParallel: boolean) => {
            const fileName = lang === 'en' ? 'bible-en.json' : lang === 'zh-Hant' ? 'bible-zh-hant.json' : 'bible-zh.json';
            try {
                const res = await fetch(`/${fileName}`);
                const data = await res.json();
                const mappedData = data.map((book: any) => ({
                    ...book,
                    name: getTranslation(lang as Locale, `books.${book.id}`) || book.id
                }));
                if (isParallel) setParallelBibleData(mappedData);
                else setBibleData(mappedData);
            } catch (err) {
                console.error(`Failed to load ${isParallel ? 'parallel ' : ''}bible data:`, err);
            }
        };

        const init = async () => {
            await loadBible(language, false);
            if (parallelLanguage) {
                await loadBible(parallelLanguage, true);
            } else {
                setParallelBibleData([]);
            }
            setIsLoadingBible(false);
        };

        init();
    }, [language, parallelLanguage]);

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

            // Generate RGB for glass effects
            const hex = customTheme.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                document.documentElement.style.setProperty('--bg-rgb', `${r}, ${g}, ${b}`);
            }
        } else {
            document.documentElement.removeAttribute('data-custom-theme');
            document.documentElement.style.removeProperty('--bg-rgb');
        }
    }, [customTheme]);

    useEffect(() => {
        document.documentElement.style.setProperty('--primary-color', accentColor);

        // Generate RGB for accent transparency effects
        const hex = accentColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
            document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
        }
    }, [accentColor]);

    useEffect(() => {
        document.documentElement.style.setProperty('--line-height', lineHeight.toString());
    }, [lineHeight]);

    useEffect(() => {
        document.documentElement.setAttribute('data-fullscreen', isFullscreenReader.toString());
    }, [isFullscreenReader]);

    useEffect(() => {
        let fontValue = 'system-ui, -apple-system, sans-serif';
        switch (fontFamily) {
            case 'serif': fontValue = '"Noto Serif SC", "Source Han Serif SC", serif'; break;
            case 'kai': fontValue = '"STKaiti", "Kaiti SC", "Kaiti", "楷体", serif'; break;
            case 'rounded': fontValue = '"Hiragino Sans GB", "Microsoft YaHei UI", "圆体", sans-serif'; break;
            default: fontValue = 'Inter, system-ui, -apple-system, sans-serif';
        }
        document.documentElement.style.setProperty('--font-family', fontValue);
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
        console.log('🔖 toggleBookmark called:', { id, range });
        setBookmarks(prev => {
            const existing = prev.find(b => b.id === id);
            if (existing) {
                // Remove bookmark
                console.log('🗑️ Removing bookmark:', id);
                apiRemoveBookmark(id);
                return prev.filter(b => b.id !== id);
            }
            // Add bookmark
            console.log('➕ Adding bookmark:', id);
            const newBookmark = { ...range, id };
            apiAddBookmark(newBookmark);
            return [...prev, newBookmark];
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
                const newHighlight = { ...range, id, color };
                apiSetHighlight(newHighlight);
                return [...filtered, newHighlight];
            }
            // Remove highlight
            apiRemoveHighlight(id);
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
                const newNote = { ...range, id, text };
                apiSaveNote(newNote);
                return [...filtered, newNote];
            }
            // Remove note if text is empty
            apiRemoveNote(id);
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
            lineHeight, setLineHeight,
            fontFamily, setFontFamily,
            customTheme, setCustomTheme,
            accentColor, setAccentColor,
            pageTurnEffect, setPageTurnEffect,
            parallelLanguage, setParallelLanguage,
            parallelBibleData,
            isFullscreenReader,
            setIsFullscreenReader,
            t,
            user, token, login, register, logout, syncData
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
