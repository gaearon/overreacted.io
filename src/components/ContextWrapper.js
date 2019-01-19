import React from 'react';

import { themes } from './themes';

export const ThemeContext = React.createContext({
  theme: themes.light,
  setTheme: () => {},
});

class Wrapper extends React.Component {
  constructor(props) {
    super(props);
    this.setTheme = this.setTheme.bind(this);
    this.handleDarkQueryChange = this.handleDarkQueryChange.bind(this);
    try {
      this.preferredTheme = localStorage.getItem('theme');
    } catch (err) {
      // Ignore.
    }
    this.darkQuery =
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : { matches: false };
    this.state = {
      theme:
        themes[
          this.preferredTheme || (this.darkQuery.matches ? 'dark' : 'light')
        ],
      setTheme: this.setTheme,
    };
  }

  componentDidMount() {
    this.darkQuery.addListener(this.handleDarkQueryChange);
  }

  componentWillUnmount() {
    this.darkQuery.addListener(this.handleDarkQueryChange);
  }

  handleDarkQueryChange(e) {
    if (this.preferredTheme) {
      return;
    }
    this.setTheme(e.matches ? 'dark' : 'light');
  }

  setTheme(newTheme) {
    this.preferredTheme = newTheme;
    try {
      localStorage.setItem('theme', newTheme);
    } catch (err) {
      // Ignore.
    }
    this.setState({ theme: themes[newTheme] });
  }

  render() {
    return (
      <ThemeContext.Provider value={this.state}>
        {this.props.children}
      </ThemeContext.Provider>
    );
  }
}

export default ({ element }) => <Wrapper>{element}</Wrapper>;
