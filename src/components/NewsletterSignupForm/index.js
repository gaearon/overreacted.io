import React from 'react'

import { rhythm, scale } from '../../utils/typography'

import newsletterLogo from './images/newsletterLogo.svg'

class NewsletterSignupForm extends React.Component {
  render() {
    return (
      <div
        style={{
          width: '100%',
          borderRadius: '10px',
          background: '#fafafa',
          padding: '80px 50px 70px 50px',
          position: 'relative',
        }}
      >
        <div
          style={{
            background: '#FFF2F6',
            width: '80px',
            height: '80px',
            position: 'absolute',
            borderRadius: '50%',
            zIndex: 1,
            left: 0,
            right: 0,
            top: '-40px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src={newsletterLogo}
            alt=""
            style={{
              display: 'block',
              width: '46px',
              margin: 0,
            }}
          />
        </div>
        <h3
          style={{
            textAlign: 'center',
            fontSize: rhythm(1),
            lineHeight: 1.1,
            color: '#FFA7C4',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            margin: 0,
          }}
        >
          The Overreacted Newsletter
        </h3>
        <p
          style={{
            margin: '30px 0 0 0',
            color: '#191919',
            fontSize: '24px',
            lineHeight: 1.5,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          Receive free articles, useful tips and valuable React resources in
          your inbox.
        </p>
        <div
          style={{
            margin: '40px auto 0 auto',
            width: '100%',
            maxWidth: '360px',
            display: 'flex',
          }}
        >
          <input
            style={{
              height: '45px',
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              borderRadius: '5px 0 0 5px',
              borderColor: '#E4E0E1',
              borderStyle: 'solid',
              borderWidth: '1px 0 1px 1px',
              padding: '5px 15px',
              fontWeight: 300,
            }}
            type="email"
            placeholder="Enter your email"
          />
          <button
            style={{
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#D23669',
              color: '#ffffff',
              fontSize: '17px',
              fontWeight: 600,
              borderRadius: '0 5px 5px 0',
              padding: '5px 20px',
              cursor: 'pointer',
              border: 'none',
            }}
            type="button"
          >
            Subscribe
          </button>
        </div>
      </div>
    )
  }
}

export default NewsletterSignupForm
