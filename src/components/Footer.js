import React from 'react';
import { rhythm } from '../utils/typography';

class Footer extends React.Component {
  render() {
    return (
      <footer
        style={{
          marginTop: rhythm(2.5),
          paddingTop: rhythm(1),
        }}
      >
        <div style={{ float: 'right' }}>
          <a href="/rss.xml" target="_blank" rel="noopener noreferrer">
            rss
          </a>
        </div>
        <a href="https://mobile.twitter.com/bcoops222" target="_blank" rel="noopener noreferrer">
          twitter
        </a>{' '}
        &bull;{' '}
        <a href="https://github.com/bencooper222" target="_blank" rel="noopener noreferrer">
          github
        </a>{' '}
        &bull;{' '}
        <a href="https://stackoverflow.com/users/5041889/ben-cooper" target="_blank" rel="noopener noreferrer">
          stack overflow
        </a>{' '}
        &bull;{' '}
        <a href="https://resume.benc.io" target="_blank" rel="noopener noreferrer">
          resume
        </a>
      </footer>
    );
  }
}

export default Footer;
