import React from 'react'
export const onRenderBody = ({ setPostBodyComponents }) => {
  return setPostBodyComponents([
    <script src="https://f.convertkit.com/ckjs/ck.5.js" />,
  ])
}
