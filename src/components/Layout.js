import React, { useState, useEffect } from 'react';
import { Link } from 'gatsby';
import Toggle from './Toggle';
import Helmet from 'react-helmet';

import { rhythm, scale } from '../utils/typography';
import sun from '../assets/sun.png';
import moon from '../assets/moon.png';

const Layout = ({ location, title, children }) => {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(window.__theme);
    window.__onThemeChange = () => {
      setTheme(window.__theme);
    };
  }, [theme]);

  const renderHeader = () => {
    const rootPath = `${__PATH_PREFIX__}/`;

    if (location.pathname === rootPath) {
      return (
        <h1
          style={{
            ...scale(0.75),
            marginBottom: 0,
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: 'none',
              textDecoration: 'none',
              color: 'var(--textTitle)',
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
            marginBottom: 0,
            height: 42, // because
            lineHeight: '2.625rem',
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
  };

  return (
    <div
      style={{
        color: 'var(--textNormal)',
        background: 'var(--bg)',
        transition: 'color 0.2s ease-out, background 0.2s ease-out',
        minHeight: '100vh',
      }}
    >
      <Helmet
        meta={[
          {
            name: 'theme-color',
            content: theme === 'light' ? '#ffa8c5' : '#282c35',
          },
        ]}
      />
      <div
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          maxWidth: rhythm(24),
          padding: `2.625rem ${rhythm(3 / 4)}`,
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2.625rem',
          }}
        >
          {renderHeader()}
          {theme !== null ? (
            <Toggle
              icons={{
                checked: (
                  <img
                    src={moon}
                    width="16"
                    height="16"
                    role="presentation"
                    style={{ pointerEvents: 'none' }}
                  />
                ),
                unchecked: (
                  <img
                    src={sun}
                    width="16"
                    height="16"
                    role="presentation"
                    style={{ pointerEvents: 'none' }}
                  />
                ),
              }}
              checked={theme === 'dark'}
              onChange={e =>
                window.__setPreferredTheme(e.target.checked ? 'dark' : 'light')
              }
            />
          ) : (
            <div style={{ height: '24px' }} />
          )}
        </header>
        {children}
      </div>
    </div>
  );
};

export default Layout;
