import { defaultLangKey } from '../../languages';

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
    ru: 'Russian',
    tr: 'Turkish',
    es: 'Spanish',
    ko: 'Korean',
    sv: 'Swedish',
    it: 'Italian',
    'pt-br': 'Portuguese (Brazil)',
    'zh-hant': 'Chinese (Traditional)',
    ja: 'Japanese',
    fr: 'French',
    hu: 'Hungarian',
    vi: 'Vietnamese',
    th: 'Thai',
  }[code]);

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

export const createLanguageLink = (slug, lang) => {
  const rawSlug = slug.replace(`${lang}/`, '');

  return targetLang =>
    targetLang === defaultLangKey ? rawSlug : `${targetLang}/${rawSlug}`;
};
