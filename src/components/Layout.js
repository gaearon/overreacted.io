import React from 'react';
import { Link } from 'gatsby';
import Toggle from './Toggle';

import { rhythm, scale } from '../utils/typography';
import { ThemeContext } from './ContextWrapper';
import sun from '../assets/sun.png';
import moon from '../assets/moon.png';
import Style from './Style';

class Layout extends React.Component {
  state = {
    hasMounted: false,
  };
  componentDidMount() {
    setTimeout(() => {
      this.setState({ hasMounted: true });
    });
  }
  renderHeader(theme) {
    const { location, title } = this.props;
    const rootPath = `${__PATH_PREFIX__}/`;

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
              color: theme.primary.text.title,
            }}
            to={'/'}
          >
            {title}
          </Link>
        </h1>
      );
    } else {
      return (
        <h3
          style={{
            fontFamily: 'Montserrat, sans-serif',
            marginTop: 0,
            marginBottom: rhythm(-1),
            minHeight: '3.5rem',
          }}
        >
          <Link
            style={{
              boxShadow: 'none',
              textDecoration: 'none',
              color: 'rgb(255, 167, 196)',
            }}
            to={'/'}
          >
            {title}
          </Link>
        </h3>
      );
    }
  }
  render() {
    const { children, location } = this.props;
    const rootPath = `${__PATH_PREFIX__}/`;
    const isHomePage = location.pathname === rootPath;
    // Keep dark/light mode switch aligned between home and post page
    const topPadding = isHomePage ? rhythm(1.5) : rhythm(2.15);
    return (
      <ThemeContext.Consumer>
        {({ theme, setTheme }) => (
          <div
            style={{
              color: theme.primary.text.normal,
              background: theme.primary.background,
              transition: this.state.hasMounted
                ? 'color 0.2s ease-out, background 0.2s ease-out'
                : '',
            }}
          >
            <Style theme={theme} />
            <div
              style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                maxWidth: rhythm(24),
                padding: `${topPadding} ${rhythm(3 / 4)}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                {this.renderHeader(theme)}
                <Toggle
                  icons={{
                    checked: (
                      <img
                        src={moon}
                        alt="Dark Mode"
                        style={{ pointerEvents: 'none' }}
                      />
                    ),
                    unchecked: (
                      <img
                        src={sun}
                        alt="Light Mode"
                        style={{ pointerEvents: 'none' }}
                      />
                    ),
                  }}
                  checked={theme.id === 'dark'}
                  onChange={e => setTheme(e.target.checked ? 'dark' : 'light')}
                />
              </div>
              {children}
            </div>
          </div>
        )}
      </ThemeContext.Consumer>
    );
  }
}

export default Layout;
