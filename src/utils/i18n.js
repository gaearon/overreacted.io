const { defaultLangKey } = require('../../languages')

export const codeToLanguage = (code) => ({
  en: 'English',
  ru: 'Russian',
}[code])

export const createLanguageLink = (slug, lang) => {
  const rawSlug = slug.replace(`${lang}/`, '')
  
  return (targetLang) => targetLang === defaultLangKey
    ? rawSlug
    : `${targetLang}/${rawSlug}`
}
  