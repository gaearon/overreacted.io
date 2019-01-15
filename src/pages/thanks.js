import React from 'react'
import Layout from '../components/Layout'
import get from 'lodash/get'

class Thanks extends React.Component {
  render() {
    const siteTitle = get(this.props, 'data.site.siteMetadata.title')
    return (
      <Layout location={this.props.location} title={siteTitle}>
        <h1>Thank you for subscribing.</h1>
        <p>
          You are now confirmed. You can expect to receive emails as I create
          new content.
        </p>
      </Layout>
    )
  }
}

export const pageQuery = graphql`
  query ThanksSiteData {
    site {
      siteMetadata {
        title
      }
    }
  }
`

export default Thanks
