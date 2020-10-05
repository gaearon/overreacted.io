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
        {/* <a
          href="https://mobile.twitter.com/dan_abramov"
          target="_blank"
          rel="noopener noreferrer"
        >
          twitter
        </a>{' '}
        &bull;{' '} */}
        <a
          href="https://github.com/pavoltravnik/ophthamed.sk"
          target="_blank"
          rel="noopener noreferrer"
        >
          github
        </a>{' '}
        &bull;{' '}
        <a
          href="https://lekom.sk/slovenska-lekarska-komora/organy-slk/register-lekarov"
          target="_blank"
          rel="noopener noreferrer"
        >
          register lekárov
        </a>
      </footer>
    );
  }
}

export default Footer;
