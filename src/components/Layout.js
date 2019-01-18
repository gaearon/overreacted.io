import React from 'react'
import { Link } from 'gatsby'
import Toggle from 'react-toggle'
import "react-toggle/style.css"

import { rhythm, scale } from '../utils/typography'
import { ThemeContext } from './ContextWrapper'
import sun from "../assets/sun.png";
import moon from "../assets/moon.png";
import Style from './Style'

class Layout extends React.Component {
  renderHeader(theme) {
    const { location, title } = this.props
    const rootPath = `${__PATH_PREFIX__}/`

    if (location.pathname === rootPath) {
      return (
        <h1
          style={{
            ...scale(1.0),
            marginBottom: rhythm(1.5),
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: 'none',
              textDecoration: 'none',
              color: theme.primary.text.title
            }}
            to={'/'}
          >
            {title}
          </Link>
        </h1>
      )
    } else {
      return (
        <h3
          style={{
            fontFamily: 'Montserrat, sans-serif',
            marginTop: 0,
            marginBottom: rhythm(-1),
          }}
        >
          <Link
            style={{
              boxShadow: 'none',
              textDecoration: 'none',
              color: theme.header
            }}
            to={'/'}
          >
            {title}
          </Link>
        </h3>
      )
    }
  }
  render() {
    const { children } = this.props
    return (
      <ThemeContext.Consumer>
      {({theme, toggleTheme }) => (
      <div style={{
        color: theme.primary.text.normal,
        background: theme.primary.background,
      }}>
      <Style theme={theme} />
      <div
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        {this.renderHeader(theme)}
        <Toggle
          icons={{checked: <img src={moon}/>, unchecked: <img src={sun}/>}}
          checked={theme.id === 'dark'}
          onChange={toggleTheme}
        />
        </div>
        {children}
      </div>
      </div>
      )}
      </ThemeContext.Consumer>
    )
  }
}

export default Layout
