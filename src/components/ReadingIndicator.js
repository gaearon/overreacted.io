import React, { PureComponent } from 'react'

class ReadingIndicator extends PureComponent {
  scrollHeight = 0
  state = { amount: 0, }

  componentDidMount() {
    window.addEventListener('scroll', this.scrolling)
    this.scrollHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
    ) - window.innerHeight
  }

  componentWillUnmount = () => window.removeEventListener('scroll', this.scrolling)

  scrolling = () =>
    this.setState({ amount: parseFloat(((window.scrollY * 100) / this.scrollHeight) / 100) })

  render() {
    const { amount } = this.state
    return <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '3px',
      backgroundColor: '#ffa7c4',
      width: '100%',
      transition: 'transform 200ms',
      transform: `scaleX(${amount})`,
      transformOrigin: 'left',
    }}></div>
  }
}

export default ReadingIndicator;