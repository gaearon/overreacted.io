import React from 'react';
import profilePic from '../assets/me.png';
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
          alt={`Benjamin Cooper`}
          style={{
            marginRight: rhythm(1 / 2),
            marginBottom: 0,
            width: rhythm(2),
            height: rhythm(2),
            borderRadius: '50%',
          }}
        />
        <p style={{ maxWidth: 370 }}>
          <a href="https://twitter.com/bcoops222">Ben Cooper's</a> blog. <br /> I write mostly about
          code, policy, and my life.
        </p>
      </div>
    );
  }
}

export default Bio;
