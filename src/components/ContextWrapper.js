import React from 'react'

import { themes } from './ThemeContext'

export const ThemeContext = React.createContext({
  theme: themes.light,
  toggleTheme: () => {},
})

class Wrapper extends React.Component {
  constructor(props) {
    super(props)
    this.toggleTheme = this.toggleTheme.bind(this)
    this.state = {
      theme: themes.light,
      toggleTheme: this.toggleTheme,
    }
  }

  componentDidMount() {
    this.setState({ theme: themes[localStorage.getItem('theme') || 'light'] })
  }

  toggleTheme() {
    const newTheme = this.state.theme.id === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', newTheme)
    this.setState({ theme: themes[newTheme] })
  }

  render() {
    return (
      <ThemeContext.Provider value={this.state}>
        {this.props.children}
      </ThemeContext.Provider>
    )
  }
}

export default ({ element }) => <Wrapper>{element}</Wrapper>
