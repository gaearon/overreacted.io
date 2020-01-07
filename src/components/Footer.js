import React from 'react';

import { rhythm } from '../utils/typography';

class Footer extends React.Component {
  render() {
    return (
      <footer
        style={{
          marginTop: rhythm(2.5),
          paddingTop: rhythm(1),
          position: 'absolute',
          bottom: rhythm(1),
          width: `calc(100% - ${rhythm(2)})`,
        }}
      >
        <div style={{ float: 'right' }}>
          <a href="/rss.xml" target="_blank" rel="noopener noreferrer">
            rss
          </a>
        </div>
        <a
          href="https://mobile.twitter.com/ivanmauric_io"
          target="_blank"
          rel="noopener noreferrer"
        >
          twitter
        </a>{' '}
        &bull;{' '}
        <a
          href="https://github.com/ivanmauricio"
          target="_blank"
          rel="noopener noreferrer"
        >
          github
        </a>{' '}
        &bull;{' '}
        {/* <a
          target="_blank"
          rel="noopener noreferrer"
        >
        // TODO: add stackoverflow on here?
          stack overflow
        </a> */}
      </footer>
    );
  }
}

export default Footer;
