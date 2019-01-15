import React from 'react'

import './Signup.css'

class Signup extends React.Component {
  render() {
    return (
      <form
        action="https://app.convertkit.com/forms/812047/subscriptions"
        className="seva-form formkit-form"
        method="post"
        data-sv-form="812047"
        data-uid="4a352cb1fd"
        data-format="inline"
        data-version="5"
        data-options='{"settings":{"after_subscribe":{"action":"message","success_message":"Success! Now check your email to confirm your subscription.","redirect_url":""},"modal":{"trigger":null,"scroll_percentage":null,"timer":null,"devices":null,"show_once_every":null},"recaptcha":{"enabled":false},"return_visitor":{"action":"hide","custom_content":""},"slide_in":{"display_in":null,"trigger":null,"scroll_percentage":null,"timer":null,"devices":null,"show_once_every":null}}}'
        min-width="400 500 600 700 800"
        style={{ backgroundColor: 'rgb(255, 255, 255)', borderRadius: '6px' }}
      >
        <div data-style="full">
          <div
            data-element="column"
            className="formkit-column"
            style={{ backgroundColor: 'rgb(249, 250, 251)' }}
          >
            <h1
              className="formkit-header"
              data-element="header"
              style={{
                color: 'rgb(77, 77, 77)',
                fontSize: '20px',
                fontWeight: 700,
              }}
            >
              Join the Newsletter
            </h1>
            <div
              data-element="subheader"
              className="formkit-subheader"
              style={{ color: 'rgb(104, 104, 104)', fontsize: '15px' }}
            >
              <p>Subscribe to get my latest content by email.</p>
            </div>
            <div className="formkit-image">
              <img
                src="https://083950260099-attachments.s3.us-east-2.amazonaws.com/107805/19c4e69f-19dc-4586-9b79-c165f1775e4a/newsletterLogo.svg"
                style={{ maxWidth: '100%' }}
              />
            </div>
          </div>
          <div data-element="column" className="formkit-column">
            <ul
              className="formkit-alert formkit-alert-error"
              data-element="errors"
              data-group="alert"
            />

            <div data-element="fields" className="seva-fields formkit-fields">
              <div className="formkit-field">
                <input
                  className="formkit-input"
                  aria-label="Your first name"
                  name="fields[first_name]"
                  placeholder="Your first name"
                  type="text"
                  style={{
                    borderColor: 'rgb(227, 227, 227)',
                    borderRadius: '4px',
                    color: 'rgb(0, 0, 0)',
                    fontWeight: 400,
                  }}
                />
              </div>
              <div className="formkit-field">
                <input
                  className="formkit-input"
                  name="email_address"
                  aria-label="Your email address"
                  placeholder="Your email address"
                  required=""
                  type="email"
                  style={{
                    borderColor: 'rgb(227, 227, 227)',
                    borderRadius: '4px',
                    color: 'rgb(0, 0, 0)',
                    fontWeight: 400,
                  }}
                />
              </div>
              <button
                data-element="submit"
                className="formkit-submit formkit-submit"
                style={{
                  backgroundColor: 'rgb(252, 211, 225)',
                  borderRadius: '24px',
                  color: 'rgb(110, 110, 110)',
                  fontWeight: 700,
                }}
              >
                <div className="formkit-spinner" />
                <span>Subscribe</span>
              </button>
            </div>
            <div
              data-element="guarantee"
              className="formkit-guarantee"
              style={{
                color: 'rgb(77, 77, 77)',
                fontSize: '13px',
                fontWeight: 400,
              }}
            >
              <p>I won't send you spam.</p>
              <p>
                Unsubscribe at <em>any</em> time.
              </p>
            </div>
          </div>
        </div>
      </form>
    )
  }
}

export default Signup
