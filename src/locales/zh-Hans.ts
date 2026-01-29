export default {
    books: {
        gn: '创世记', ex: '出埃及记', lv: '利未记', nm: '民数记', dt: '申命记', js: '约书亚记', jud: '士师记', rt: '路得记', '1sm': '撒母耳记上', '2sm': '撒母耳记下', '1kgs': '列王纪上', '2kgs': '列王纪下', '1ch': '历代志上', '2ch': '历代志下', ezr: '以斯拉记', ne: '尼希米记', et: '以斯帖记', job: '约伯记', ps: '诗篇', prv: '箴言', ec: '传道书', so: '雅歌', is: '以赛亚书', jr: '耶利米书', lm: '耶利米哀歌', ez: '以西结书', dn: '但以理书', ho: '何西阿书', jl: '约珥书', am: '阿摩司书', ob: '俄巴底亚书', jn: '约拿书', mi: '弥迦书', na: '那鸿书', hk: '哈巴谷书', zp: '西番雅书', hg: '哈该书', zc: '撒迦利亚书', ml: '玛拉基书', mt: '马太福音', mk: '马可福音', lk: '路加福音', jo: '约翰福音', act: '使徒行传', rm: '罗马书', '1co': '哥林多前书', '2co': '哥林多后书', gl: '加拉太书', eph: '以弗所书', ph: '腓立比书', cl: '歌罗西书', '1ts': '帖撒罗尼迦前书', '2ts': '帖撒罗尼迦后书', '1tm': '提摩太前书', '2tm': '提摩太后书', tt: '提多书', phm: '腓利门书', hb: '希伯来书', jm: '雅各书', '1pe': '彼得前书', '2pe': '彼得后书', '1jo': '约翰一书', '2jo': '约翰二书', '3jo': '约翰三书', jd: '犹大书', re: '启示录'
    },
    app: {
        title: '圣经阅读',
        nav: {
            read: '阅读',
            bookmarks: '书签',
            notes: '笔记',
            settings: '我的',
        }
    },
    settings: {
        title: '个性化设置',
        subtitle: '打造最适合您的灵修阅读环境',
        ui_language: '语言预设',
        visual_style: '视觉风格',
        reading_controls: '阅读及朗读',
        font_size: '字体大小',
        font_family: '字体样式',
        line_height: '行高比例',
        reading_effect: '阅读模式',
        animation_effect: '翻页效果',
        custom_bg: '自定义背景',
        accent_color: '主题色调',
        speech_rate: '朗读速率',
        continuous_reading: '沉浸式连续播放',
        continuous_reading_desc: '朗读完当前经文后自动进入下一节，适合闭目灵修。',
        pause_on_switch: '切换章节时暂停',
        pause_on_switch_desc: '手动切换章节时自动暂停播放，包括点击上/下一章按钮。',
        theme: {
            light: '明亮',
            dark: '深色',
            sepia: '护眼',
        },
        effects: {
            scroll: '纵向滚动',
            horizontal: '横向滑屏',
            pageFlip: '全屏页码',
            paginated: '全屏模式'
        },
        animations: {
            none: '无',
            fade: '渐隐',
            slide: '滑屏',
            curl: '仿真'
        },
        fonts: {
            serif: '思源宋体',
            sans: '系统默认',
            kai: '优美楷体',
            rounded: '精致圆体'
        }
    },
    reader: {
        daily_wisdom: '今日灵修经文',
        app_title: '圣经阅读',
        menu: '目录',
        chapter_select: '{book} • 第 {chapter} 章',
        range_select: '范围选择',
        select_start_end: '选择起始和结束节',
        verse_single: '第 {verse} 节',
        verse_range: '第 {start}-{end} 节',
        bookmark: '收藏',
        stop: '停止',
        listen: '朗读',
        play_chapter: '播全章',
        highlight: '高亮',
        add_note: '添加笔记...',
        reading: '正在朗读',
        prev_chapter: '上一章',
        next_chapter: '下一章',
        fullscreen_reader: '进入全屏阅读',
        exit_fullscreen: '退出全屏',
        note_placeholder: '在这里写下您的灵修感悟...',
        share: '分享经文',
        share_success: '经文和链接已复制到剪贴板!',
        drawer_books: '目录',
        drawer_title: '目录',
        note: '笔记'
    },
    common: {
        save: '保存',
        cancel: '取消',
        close: '关闭',
        expand: '显示全文',
        collapse: '收起'
    },
    bookmarks: {
        title: '经文收藏',
        count: '已珍藏 {count} 条灵粮',
        empty: '书签栏空空的，开启您的读经之旅吧',
        edit: '编辑',
        selected_count: '已选择 {count} 项',
        batch_delete: '批量删除 ({count})',
        select_all: '全选',
        reverse_select: '反选',
        delete_confirm: '确定删除选中的 {count} 条书签吗?',
        cancel: '取消',
        confirm: '确定删除',
    },
    notes: {
        title: '灵修笔记',
        count: '已记录 {count} 段感悟',
        search_placeholder: '搜索您的笔记或感悟...',
        empty: '笔尖未动,感悟从读经开始',
        edit: '编辑',
        selected_count: '已选择 {count} 项',
        batch_delete: '批量删除 ({count})',
        select_all: '全选',
        reverse_select: '反选',
        delete_confirm: '确定删除选中的 {count} 条笔记吗?',
        cancel: '取消',
        confirm: '确定删除',
    }
};
