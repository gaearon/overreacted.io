import { defaultLangKey } from '../../languages'

export const codeToLanguage = (code) => ({
  en: 'English',
  ru: 'Russian',
  zh_TW: 'Chinese (Traditional)',
}[code])

export const createLanguageLink = (slug, lang) => {
  const rawSlug = slug.replace(`${lang}/`, '')
  
  return (targetLang) => targetLang === defaultLangKey
    ? rawSlug
    : `${targetLang}/${rawSlug}`
}
  
