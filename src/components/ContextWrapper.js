import React from 'react'

import { loadState, saveState } from '../utils/helpers'
import { themes, ThemeContext } from './ThemeContext'

class Wrapper extends React.Component {
  constructor(props) {
    super(props)
    this.toggleTheme = this.toggleTheme.bind(this)
    this.state = {
      theme: themes[loadState('theme') || 'light'],
      toggleTheme: this.toggleTheme,
    }
  }

  toggleTheme() {
    const newTheme = this.state.theme.id === 'light' ? 'dark' : 'light'
    saveState('theme', newTheme)
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
