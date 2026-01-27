import zhHans from './zh-Hans';
import zhHant from './zh-Hant';
import en from './en';

export type Locale = 'zh-Hans' | 'zh-Hant' | 'en';

export const translations = {
    'zh-Hans': zhHans,
    'zh-Hant': zhHant,
    'en': en
};

export const getTranslation = (lang: Locale, keyPath: string, params?: Record<string, string | number>) => {
    const keys = keyPath.split('.');
    let value: any = translations[lang];

    for (const key of keys) {
        if (value && typeof value === 'object') {
            value = value[key as keyof typeof value];
        } else {
            return keyPath;
        }
    }

    if (typeof value === 'string' && params) {
        let result = value;
        Object.entries(params).forEach(([k, v]) => {
            result = result.split(`{${k}}`).join(String(v));
        });
        return result;
    }

    return typeof value === 'string' ? value : keyPath;
};
