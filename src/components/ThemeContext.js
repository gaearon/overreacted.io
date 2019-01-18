import React from 'react'

import { loadState } from '../utils/helpers'

export const themes = {
  light: {
    id: 'light',
    header: 'rgb(255, 167, 196)',
    inlineCode: {
      background: 'rgba(255,229,100,0.2)',
      color: '#1a1a1a',
    },
    primary: {
      background: '#ffffff',
      text: {
        normal: '#000000',
        title: '#000000',
        link: '#d23669',
      },
    },
    secondary: {
      background: 'rgb(249, 250, 251)',
      text: {
        normal: '#000000',
        title: '#000000',
        link: '#d23669',
      },
    },
  },
  dark: {
    id: 'dark',
    header: '#ffffff',
    inlineCode: {
      background: 'rgba(63,63,63,1)',
      color: '#e6e6e6',
    },
    primary: {
      background: '#000000',
      text: {
        normal: 'rgba(255, 255, 255, 0.8)',
        title: '#ffffff',
        link: '#d23669',
      },
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.3)',
      text: {
        normal: '#ffffff',
        title: '#ffffff',
        link: '#d23669',
      },
    },
  },
}

export const ThemeContext = React.createContext({
  theme: themes[loadState('theme') || 'light'],
  toggleTheme: () => {},
})
