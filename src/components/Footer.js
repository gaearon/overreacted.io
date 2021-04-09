import React from 'react';
import PropTypes from 'prop-types';

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
          {` `}
          {this.props.langKey !== 'en' && (
            <a
              href={`/${this.props.langKey}/rss.xml`}
              target="_blank"
              rel="noopener noreferrer"
            >
              rss ({this.props.langKey})
            </a>
          )}
        </div>
        <a
          href="https://mobile.twitter.com/dan_abramov"
          target="_blank"
          rel="noopener noreferrer"
        >
          twitter
        </a>{' '}
        &bull;{' '}
        <a
          href="https://github.com/gaearon"
          target="_blank"
          rel="noopener noreferrer"
        >
          github
        </a>{' '}
        &bull;{' '}
        <a
          href="https://stackoverflow.com/users/458193/dan-abramov"
          target="_blank"
          rel="noopener noreferrer"
        >
          stack overflow
        </a>
      </footer>
    );
  }
}

Footer.propTypes = {
  langKey: PropTypes.string.isRequired,
};

export default Footer;
