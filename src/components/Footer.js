import React from 'react'

import { rhythm } from '../utils/typography'

class Footer extends React.Component {
  render() {
    return (
      <footer
        style={{
          marginTop: rhythm(3),
          borderTop: '1px solid #ccc',
          paddingTop: rhythm(1),
        }}
      >
        <div style={{ float: 'right' }}>
          <a href="/rss.xml">rss</a>
        </div>
        <a href="mailto:dan.abramov@me.com">email</a> &bull;{' '}
        <a href="http://twitter.com/dan_abramov">twitter</a> &bull;{' '}
        <a href="http://github.com/gaearon">github</a> &bull;{' '}
        <a href="https://stackoverflow.com/users/458193/dan-abramov">
          stack overflow
        </a>
      </footer>
    )
  }
}

export default Footer
