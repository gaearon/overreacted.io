import React from 'react';
import profilePic from '../assets/ivan.jpg';
import { rhythm } from '../utils/typography';

class Bio extends React.Component {
  render() {
    return (
      <div
        style={{
          display: 'flex',
          marginBottom: rhythm(2),
        }}
      >
        <img
          src={profilePic}
          alt="Ivan Gonzalez"
          style={{
            marginRight: rhythm(1 / 2),
            marginBottom: 0,
            width: rhythm(2),
            height: rhythm(2),
            borderRadius: '50%',
          }}
        />
        <p style={{ maxWidth: 240 }}>
          A blog by{' '}
          <a href="https://mobile.twitter.com/ivanmauric_io">Ivan Mauricio</a>.{' '}
          Striving to learn in public.
        </p>
      </div>
    );
  }
}

export default Bio;
