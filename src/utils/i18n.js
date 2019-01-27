// This is kind of a mess for some languages.
// Try to be as short as possible.
// Make sure you use a real code (e.g. "ja", not "jp").
// Some resources:
// http://www.rfc-editor.org/rfc/bcp/bcp47.txt
// https://www.w3.org/International/articles/language-tags/
// https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
// https://discuss.httparchive.org/t/what-are-the-invalid-uses-of-the-lang-attribute/1022

// Please keep keys lowercase!
export const codeToLanguage = code =>
  ({
    en: 'English',
    ru: 'Русский',
    tr: 'Türkçe',
    es: 'Español',
    ko: '한국어',
    sv: 'Svenska',
    it: 'Italiano',
    id: 'Bahasa Indonesia',
    'pt-br': 'Português do Brasil',
    pl: 'Polski',
    'zh-hant': '繁體中文',
    'zh-hans': '简体中文',
    ja: '日本語',
    fr: 'Français',
    hu: 'Magyar',
    vi: 'Tiếng Việt',
    th: 'ไทย',
    my: 'မြန်မာဘာသာ',
    sk: 'Slovenčina',
    te: 'తెలుగు',
    uk: 'Українська',
    cs: 'Čeština',
    de: 'Deutsch',
  }[code].replace(/ /g, ' ' /* nbsp */));

export const loadFontsForCode = code => {
  switch (code) {
    case 'ru':
    case 'bg':
      import('../fonts/fonts-shared.cyrillic.css');
      import('../fonts/fonts-post.cyrillic.css');
      break;
    case 'uk':
      import('../fonts/fonts-shared.cyrillic.css');
      import('../fonts/fonts-post.cyrillic.css');
      import('../fonts/fonts-shared.latin-ext.css');
      import('../fonts/fonts-post.latin-ext.css');
      break;
    case 'cs':
    case 'da':
    case 'de':
    case 'es':
    case 'fi':
    case 'fr':
    case 'hu':
    case 'it':
    case 'nl':
    case 'no':
    case 'pl':
    case 'pt-br':
    case 'sk':
    case 'sq':
    case 'sv':
    case 'tr':
      import('../fonts/fonts-shared.latin-ext.css');
      import('../fonts/fonts-post.latin-ext.css');
      break;
    case 'vi':
      import('../fonts/fonts-shared.vietnamese.css');
      import('../fonts/fonts-post.vietnamese.css');
      break;
    default:
      break;
  }
};

// TODO: the curried signature is weird.
export const createLanguageLink = (slug, lang) => {
  const rawSlug = slug.replace(`${lang}/`, '');

  return targetLang =>
    targetLang === 'en' ? rawSlug : `${targetLang}${rawSlug}`;
};
