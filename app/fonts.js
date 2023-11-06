import { Montserrat, Merriweather } from 'next/font/google'

export const sans = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700', '900'],
  style: ['normal'],
})

export const serif = Merriweather({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})
