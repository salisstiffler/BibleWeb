export default {
    books: {
        gn: '創世記', ex: '出埃及記', lv: '利未記', nm: '民數記', dt: '申命記', js: '約書亞記', jud: '士師記', rt: '路得記', '1sm': '撒母耳記上', '2sm': '撒母耳記下', '1kgs': '列王紀上', '2kgs': '列王紀下', '1ch': '歷代志上', '2ch': '歷代志下', ezr: '以斯拉記', ne: '尼希米記', et: '以斯帖記', job: '約伯記', ps: '詩篇', prv: '箴言', ec: '傳道書', so: '雅歌', is: '以賽亞書', jr: '耶利米書', lm: '耶利米哀歌', ez: '以西結書', dn: '但以理書', ho: '何西阿書', jl: '約珥書', am: '阿摩司書', ob: '俄巴底亞書', jn: '約拿書', mi: '彌迦書', na: '那鴻書', hk: '哈巴谷書', zp: '西番雅書', hg: '哈該書', zc: '撒迦利亞書', ml: '瑪拉基書', mt: '馬太福音', mk: '馬可福音', lk: '路加福音', jo: '約翰福音', act: '使徒行傳', rm: '羅馬書', '1co': '哥林多前書', '2co': '哥林多後書', gl: '加拉太書', eph: '以弗所書', ph: '腓立比書', cl: '歌羅西書', '1ts': '帖撒羅尼迦前書', '2ts': '帖撒羅尼迦後書', '1tm': '提摩太前書', '2tm': '提摩太後書', tt: '提多書', phm: '腓利門書', hb: '希伯來書', jm: '雅各書', '1pe': '彼得前書', '2pe': '彼得後書', '1jo': '約翰一書', '2jo': '約翰二書', '3jo': '約翰三書', jd: '猶大書', re: '啟示錄'
    },
    app: {
        title: '聖經閱讀',
        nav: {
            read: '閱讀',
            bookmarks: '書籤',
            notes: '筆記',
            settings: '我的',
        }
    },
    settings: {
        title: '個性化設置',
        subtitle: '打造最適合您的靈修閱讀環境',
        ui_language: '語言預設',
        visual_style: '視覺風格',
        reading_controls: '閱讀及朗讀',
        font_size: '字體大小',
        font_family: '字體樣式',
        line_height: '行高比例',
        reading_effect: '閱讀模式',
        animation_effect: '翻頁效果',
        custom_bg: '自定義背景',
        accent_color: '主題色調',
        speech_rate: '朗讀速率',
        continuous_reading: '沉浸式連續播放',
        continuous_reading_desc: '朗讀完當前經文後自動進入下一節，適合閉目靈修。',
        pause_on_switch: '切換章節時暫停',
        pause_on_switch_desc: '手動切換章節時自動暫停播放，包括點擊上/下一章按鈕。',
        theme: {
            light: '明亮',
            dark: '深色',
            sepia: '護眼',
        },
        effects: {
            scroll: '縱向滾動',
            horizontal: '橫向滑屏',
            pageFlip: '全屏頁碼',
            paginated: '全屏模式'
        },
        animations: {
            none: '無',
            fade: '漸隱',
            slide: '滑屏',
            curl: '仿真'
        },
        fonts: {
            serif: '襯線體 (宣講)',
            sans: '無襯線 (現代)'
        }
    },
    reader: {
        daily_wisdom: '今日靈修經文',
        app_title: '聖經閱讀',
        menu: '目錄',
        chapter_select: '{book} • 第 {chapter} 章',
        range_select: '範圍選擇',
        select_start_end: '選擇起始和結束節',
        verse_single: '第 {verse} 節',
        verse_range: '第 {start}-{end} 節',
        bookmark: '收藏',
        stop: '停止',
        listen: '朗讀',
        play_chapter: '播全章',
        highlight: '高亮',
        add_note: '添加筆記...',
        reading: '正在朗讀',
        prev_chapter: '上一章',
        next_chapter: '下一章',
        fullscreen_reader: '進入全屏閱讀',
        exit_fullscreen: '退出全屏',
        note_placeholder: '在這裡寫下您的靈修感悟...',
        share: '分享經文',
        share_success: '經文和鏈接已複製到剪貼板!',
        drawer_books: '目錄',
        drawer_title: '目錄'
    },
    common: {
        save: '保存',
        cancel: '取消',
        close: '關閉',
        expand: '顯示全文',
        collapse: '收起'
    },
    bookmarks: {
        title: '經文收藏',
        count: '已珍藏 {count} 條靈糧',
        empty: '書籤欄空空的，開啟您的讀經之旅吧',
        edit: '編輯',
        selected_count: '已選擇 {count} 項',
        batch_delete: '批量刪除 ({count})',
        select_all: '全選',
        reverse_select: '反選',
        delete_confirm: '確定刪除選中的 {count} 條書籤嗎?',
        cancel: '取消',
        confirm: '確定刪除',
    },
    notes: {
        title: '靈修筆記',
        count: '已記錄 {count} 段感悟',
        search_placeholder: '搜索您的筆記或感悟...',
        empty: '筆尖未動,感悟從讀經開始',
        edit: '編輯',
        selected_count: '已選擇 {count} 項',
        batch_delete: '批量刪除 ({count})',
        select_all: '全選',
        reverse_select: '反選',
        delete_confirm: '確定刪除選中的 {count} 條筆記嗎?',
        cancel: '取消',
        confirm: '確定刪除',
    }
};
