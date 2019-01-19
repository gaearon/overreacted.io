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
    // Do I need to avoid SSR mismatch and always light first? Dunno.
    this.state = {
      theme: themes.light,
      setTheme: this.setTheme,
    };
  }

  componentDidMount() {
    let initialTheme;
    try {
      initialTheme = localStorage.getItem('theme');
      this.preferredTheme = initialTheme;
    } catch (err) {
      this.darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.darkQuery.addListener(this.handleDarkQueryChange);
      initialTheme = this.darkQuery.matches ? 'dark' : 'light';
    }
    if (initialTheme && initialTheme !== 'light') {
      this.setState({
        theme: themes[initialTheme],
      });
    }
  }

  componentWillUnmount() {
    if (this.darkQuery) {
      this.darkQuery.removeListener(this.handleDarkQueryChange);
    }
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
