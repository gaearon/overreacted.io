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
    let initialTheme;
    try {
      initialTheme = localStorage.getItem('theme');
    } catch (err) {
      // Ignore.
    }
    this.state = {
      theme: themes[initialTheme || 'light'],
      setTheme: this.setTheme,
    };
  }

  setTheme(newTheme) {
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
