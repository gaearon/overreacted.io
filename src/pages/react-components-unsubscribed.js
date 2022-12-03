import React from 'react'
import Layout from '../components/Layout'
import get from 'lodash/get'

class ReactComponentsUnsubscribed extends React.Component {
  render() {
    const siteTitle = get(this.props, 'data.site.siteMetadata.title')
    return (
      <Layout location={this.props.location} title={siteTitle}>
        <h1>You've Been Unsubscribed</h1>
        <p>
          You will no longer receive emails about Resilient React Components.
        </p>
      </Layout>
    )
  }
}

export const pageQuery = graphql`
  query ReactComponentsUnsubscribedSiteData {
    site {
      siteMetadata {
        title
      }
    }
  }
`

export default ReactComponentsUnsubscribed
