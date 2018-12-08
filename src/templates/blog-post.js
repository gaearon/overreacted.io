import React from 'react'
import Helmet from 'react-helmet'
import { Link, graphql } from 'gatsby'
import get from 'lodash/get'

import Bio from '../components/Bio'
import Layout from '../components/Layout'
import { formatReadingTime } from '../utils/helpers'
import { rhythm, scale } from '../utils/typography'
import { codeToLanguage, createLanguageLink } from '../utils/i18n'

const GITHUB_USERNAME = 'gaearon'
const GITHUB_REPO_NAME = 'overreacted.io'

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const siteTitle = get(this.props, 'data.site.siteMetadata.title')
    const siteDescription = post.excerpt
    const { previous, next, slug } = this.props.pageContext
    const lang = post.fields.langKey

    const otherLangs = (post.frontmatter.langs || [])
      .filter(l => l !== lang)

    const { slug } = post.fields
    const languageLink = createLanguageLink(slug, lang)
    const editUrl = `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}/edit/master/src/pages/${slug.replace(/\//g, '')}.md`
    return (
      <Layout location={this.props.location} title={siteTitle}>
        <Helmet
          htmlAttributes={{ lang }}
          meta={[{ name: 'description', content: siteDescription }]}
          title={`${post.frontmatter.title} | ${siteTitle}`}
        />
        <h1>{post.frontmatter.title}</h1>
        <p
          style={{
            ...scale(-1 / 5),
            display: 'block',
            marginBottom: rhythm(1),
            marginTop: rhythm(-1),
          }}
        >
          {post.frontmatter.date}
          {` • ${formatReadingTime(post.timeToRead)}`}
        </p>
        {otherLangs.length > 0 &&
          <p>Other languages: {otherLangs
            .map(l => (
              <React.Fragment key={l}>
                <Link to={languageLink(l)}>{codeToLanguage(l)}</Link>
                {' '}
              </React.Fragment>
            ))
          }
          </p>
        }
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
        <p>
          <a
            href={editUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Edit on GitHub
          </a>
        </p>
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />
        <h3
          style={{
            fontFamily: 'Montserrat, sans-serif',
            marginTop: rhythm(0.25),
          }}
        >
          <Link
            style={{
              boxShadow: 'none',
              textDecoration: 'none',
              color: '#ffa7c4',
            }}
            to={'/'}
          >
            Overreacted
          </Link>
        </h3>
        <Bio />
        <ul
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            listStyle: 'none',
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt
      html
      timeToRead
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        langs
      }
      fields {
        slug
        langKey
      }
    }
  }
`
