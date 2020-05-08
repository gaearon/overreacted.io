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
        <a
          href="https://mobile.twitter.com/jedr_blaszyk"
          target="_blank"
          rel="noopener noreferrer"
        >
          twitter
        </a>{' '}
        &bull;{' '}
        <a
          href="https://github.com/jedrazb"
          target="_blank"
          rel="noopener noreferrer"
        >
          github
        </a>{' '}
        &bull;{' '}
        <a
          href="https://www.strava.com/athletes/jedrzej_blaszyk"
          target="_blank"
          rel="noopener noreferrer"
        >
          strava
        </a>{' '}
        &bull;{' '}
        <a
          href="https://www.yelp.com/user_details?userid=iNhtBqAm2UyyIxqZTc5Drg"
          target="_blank"
          rel="noopener noreferrer"
        >
          yelp
        </a>
      </footer>
    );
  }
}

export default Footer;
