import React from 'react'
import { Link } from 'gatsby'
import { Helmet } from 'react-helmet'

import { rhythm, scale } from '../utils/typography'
import { loadState, saveState } from '../utils/helpers'

class Layout extends React.Component {
  constructor() {
    super()
    this.state = {
      lightMode: loadState('lightMode') === undefined || loadState('lightMode'),
    }
    this.toggleLightMode = this.toggleLightMode.bind(this)
  }

  toggleLightMode() {
    const lightMode = !this.state.lightMode
    saveState('lightMode', lightMode)
    this.setState({ lightMode })
  }

  render() {
    const { location, title, children } = this.props
    const { lightMode } = this.state
    const rootPath = `${__PATH_PREFIX__}/`
    let header

    if (location.pathname === rootPath) {
      header = (
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
            }}
            to={'/'}
          >
            {title}
          </Link>
        </h1>
      )
    } else {
      header = (
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
              color: '#ffa7c4',
            }}
            to={'/'}
          >
            {title}
          </Link>
        </h3>
      )
    }
    return (
      <div
        style={{
          width: '100%',
          backgroundColor: lightMode ? '#ffffff' : '#212121',
        }}
      >
        <div
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            maxWidth: rhythm(24),
            backgroundColor: lightMode ? 'inherit' : '#212121',
            color: lightMode ? 'inherit' : 'rgba(255, 255, 255, 0.8)',
            transition: 1,
            padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
          }}
        >
          <button
            style={{
              color: '#ffa7c4',
              float: 'right',
              background: lightMode ? '#212121' : '#ffffff',
            }}
            onClick={this.toggleLightMode}
          >
            {lightMode ? 'Dark' : 'Light'}
          </button>
          {header}
          {children}
        </div>
      </div>
    )
  }
}

export default Layout
