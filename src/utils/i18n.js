import { supportedLanguages } from './../../i18n';
import whitelist from './whitelist';

// This is kind of a mess for some languages.
// Try to be as short as possible.
// Make sure you use a real code (e.g. "ja", not "jp").
// Some resources:
// http://www.rfc-editor.org/rfc/bcp/bcp47.txt
// https://www.w3.org/International/articles/language-tags/
// https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
// https://discuss.httparchive.org/t/what-are-the-invalid-uses-of-the-lang-attribute/1022

export const codeToLanguage = code =>
  supportedLanguages[code].replace(/ /g, ' ' /* nbsp */);

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
    case 'he':
    case 'hu':
    case 'it':
    case 'nl':
    case 'no':
    case 'pl':
    case 'pt-br':
    case 'sk':
    case 'sr':
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
    case 'fa':
      import('../fonts/fonts-post.persian.css');
      break;
    case 'ar':
      import('../fonts/fonts-post.arabic.css');
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

export const replaceAnchorLinksByLanguage = (html, code) => {
  // Match any link using https://regexr.com/4airl
  const matches = html.match(/https?:\/\/(www)?[^\/\s)"?]+/gm);

  // Return same html if no matches were found
  // or code isn't supported
  if (!matches || !supportedLanguages[code]) {
    return html;
  }

  matches.forEach(url => {
    // Replace to locale url if and only if exists in whitelist
    // and has code registered
    if (whitelist[url] && whitelist[url][code]) {
      html = html.replace(url, whitelist[url][code]);
    }
  });

  return html;
};
