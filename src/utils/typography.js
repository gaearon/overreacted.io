import Typography from 'typography'
import Wordpress2016 from 'typography-theme-wordpress-2016'

Wordpress2016.overrideThemeStyles = () => ({
  a: {
    color: '#d23669',
  },
  'a.gatsby-resp-image-link': {
    boxShadow: 'none',
  },
  'a.anchor': {
    boxShadow: 'none',
  },
  'p code': {
    fontSize: '1rem',
  },
  'li code': {
    fontSize: '1rem'
  },
})

delete Wordpress2016.googleFonts

const typography = new Typography(Wordpress2016)

// Hot reload typography in development.
if (process.env.NODE_ENV !== 'production') {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
