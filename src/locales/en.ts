export default {
    books: {
        gn: 'Genesis', ex: 'Exodus', lv: 'Leviticus', nm: 'Numbers', dt: 'Deuteronomy', js: 'Joshua', jud: 'Judges', rt: 'Ruth', '1sm': '1 Samuel', '2sm': '2 Samuel', '1kgs': '1 Kings', '2kgs': '2 Kings', '1ch': '1 Chronicles', '2ch': '2 Chronicles', ezr: 'Ezra', ne: 'Nehemiah', et: 'Esther', job: 'Job', ps: 'Psalms', prv: 'Proverbs', ec: 'Ecclesiastes', so: 'Song of Solomon', is: 'Isaiah', jr: 'Jeremiah', lm: 'Lamentations', ez: 'Ezekiel', dn: 'Daniel', ho: 'Hosea', jl: 'Joel', am: 'Amos', ob: 'Obadiah', jn: 'Jonah', mi: 'Micah', na: 'Naum', hk: 'Habakkuk', zp: 'Zephaniah', hg: 'Haggai', zc: 'Zechariah', ml: 'Malachi', mt: 'Matthew', mk: 'Mark', lk: 'Luke', jo: 'John', act: 'Acts', rm: 'Romans', '1co': '1 Corinthians', '2co': '2 Corinthians', gl: 'Galatians', eph: 'Ephesians', ph: 'Philippians', cl: 'Colossians', '1ts': '1 Thessalonians', '2ts': '2 Thessalonians', '1tm': '1 Timothy', '2tm': '2 Timothy', tt: 'Titus', phm: 'Philemon', hb: 'Hebrews', jm: 'James', '1pe': '1 Peter', '2pe': '2 Peter', '1jo': '1 John', '2jo': '2 John', '3jo': '3 John', jd: 'Jude', re: 'Revelation'
    },
    app: {
        title: 'Holy Read',
        nav: {
            read: 'Read',
            bookmarks: 'Bookmarks',
            notes: 'Notes',
            search: 'Search',
            settings: 'Mine',
        }
    },
    settings: {
        title: 'Preferences',
        subtitle: 'Configure your perfect reading environment',
        ui_language: 'Localization',
        visual_style: 'Visual Style',
        reading_controls: 'Reading & Audio',
        font_size: 'Font Size',
        reading_effect: 'Reading Mode',
        animation_effect: 'Page Animation',
        custom_bg: 'Custom Background',
        accent_color: 'Accent Color',
        speech_rate: 'Speech Speed',
        continuous_reading: 'Continuous Playback',
        continuous_reading_desc: 'Automatically advance to the next verse, ideal for focused meditation.',
        pause_on_switch: 'Pause on Module Switch',
        pause_on_switch_desc: 'Automatically pause playback when manually changing chapters.',
        theme: {
            light: 'Light',
            dark: 'Dark',
            sepia: 'Sepia',
        },
        font_family: 'Font Family',
        line_height: 'Line Spacing',
        effects: {
            scroll: 'Vertical Scroll',
            horizontal: 'Horizontal Slide',
            pageFlip: 'Full Screen',
            paginated: 'Book Mode'
        },
        animations: {
            none: 'None',
            fade: 'Fade',
            slide: 'Slide',
            curl: 'Curl'
        },
        fonts: {
            serif: 'Serif (Classic)',
            sans: 'Sans (Modern)',
            kai: 'Kaiti (Elegant)',
            rounded: 'Rounded (Soft)'
        }
    },
    reader: {
        daily_wisdom: 'Daily Wisdom',
        app_title: 'Holy Read',
        menu: 'Books',
        chapter_select: '{book} • Ch. {chapter}',
        range_select: 'Range Select',
        select_start_end: 'Select start and end verses',
        verse_single: 'Verse {verse}',
        verse_range: 'Verses {start}-{end}',
        bookmark: 'Bookmark',
        stop: 'Stop',
        listen: 'Listen',
        play_chapter: 'Play Chapter',
        highlight: 'Highlight',
        add_note: 'Add a note...',
        reading: 'Reading...',
        prev_chapter: 'Previous',
        next_chapter: 'Next',
        fullscreen_reader: 'Fullscreen Reader',
        exit_fullscreen: 'Exit Fullscreen',
        note_placeholder: 'Write your spiritual reflection...',
        share: 'Share Bible Verse',
        share_success: 'Verse and link copied to clipboard!',
        drawer_books: 'Books',
        drawer_title: 'Books',
        note: 'Note'
    },
    common: {
        save: 'Save',
        cancel: 'Cancel',
        close: 'Close',
        expand: 'Show Full',
        collapse: 'Collapse'
    },
    bookmarks: {
        title: 'Bookmarks',
        count: 'You have {count} saved verses',
        empty: 'No bookmarks yet.',
        search_placeholder: 'Search bookmarks...',
        edit: 'Edit',
        selected_count: '{count} Selected',
        batch_delete: 'Delete Selected ({count})',
        select_all: 'Select All',
        reverse_select: 'Reverse Select',
        delete_confirm: 'Delete these {count} bookmarks?',
        cancel: 'Cancel',
        confirm: 'Delete',
    },
    notes: {
        title: 'Spiritual Notes',
        count: 'Reflecting on {count} insights',
        search_placeholder: 'Search notes...',
        empty: 'No notes found.',
        edit: 'Edit',
        selected_count: '{count} Selected',
        batch_delete: 'Delete Selected ({count})',
        select_all: 'Select All',
        reverse_select: 'Reverse Select',
        delete_confirm: 'Delete these {count} notes?',
        cancel: 'Cancel',
        confirm: 'Delete',
    },
    globalSearch: {
        title: 'Global Search',
        subtitle: 'Search for Truth and Wisdom in the Bible',
        placeholder: 'Enter keywords to search verse content...',
        count: 'Found {count} verses',
        empty: 'No verses found. Try different keywords.',
        searching: 'Searching the scriptures...',
        result_format: '{book} {chapter}:{verse}'
    }
};
