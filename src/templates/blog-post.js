import React from 'react'
import { Link, graphql } from 'gatsby'
import get from 'lodash/get'

import Bio from '../components/Bio'
import Layout from '../components/Layout'
import SEO from '../components/SEO'
import Signup from '../components/Signup'
import { formatReadingTime } from '../utils/helpers'
import { rhythm, scale } from '../utils/typography'
import { codeToLanguage, createLanguageLink } from '../utils/i18n'

const GITHUB_USERNAME = 'gaearon'
const GITHUB_REPO_NAME = 'overreacted.io'

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const siteTitle = get(this.props, 'data.site.siteMetadata.title')
    const { previous, next, slug } = this.props.pageContext
    const lang = post.fields.langKey
    const translations = (post.frontmatter.langs || [])
      .filter(l => l !== 'en')

    const languageLink = createLanguageLink(slug, lang)
    const enSlug = languageLink('en');
    const editUrl = `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}/edit/master/src/pages/${
      enSlug.slice(1, enSlug.length - 1) + (lang === 'en' ? '' : '.' + lang)
    }.md`
    const discussUrl = `https://mobile.twitter.com/search?q=${encodeURIComponent(`https://overreacted.io${enSlug}`)}`
    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          lang={lang}
          title={post.frontmatter.title}
          description={post.frontmatter.spoiler}
          slug={post.fields.slug}
          lang={lang}
        />
        <h1>{post.frontmatter.title}</h1>
        <p
          style={{
            ...scale(-1 / 5),
            display: 'block',
            marginBottom: rhythm(1),
            marginTop: rhythm(-4 / 5),
          }}
        >
          {post.frontmatter.date}
          {` • ${formatReadingTime(post.timeToRead)}`}
        </p>
        {translations.length > 0 &&
          <>
            {(translations.length > 1 || lang === 'en') &&
              <p><i>This article was translated by readers into {translations
                .map((l, i) => (
                  <React.Fragment key={l}>
                    {l === lang ?
                      <b>{codeToLanguage(l)}</b> :
                      <Link to={languageLink(l)}>{codeToLanguage(l)}</Link>
                    }
                    {i === translations.length - 1 ? '' : (i === translations.length - 2 ? (i === 0 ? ' and ' : ', and ') : ', ')}
                  </React.Fragment>
                ))
              }.
              </i></p>
            }
            {lang !== 'en' &&
              <p><i>
                This is a <b>community translation</b> into {codeToLanguage(lang)}.<br />
                You can also <Link to={languageLink('en')}>read the original in English</Link> or <a href={editUrl} target="_blank" rel="noopener noreferrer">
                  improve the translation
                </a>.
              </i></p>
            }
          </>
        }
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
        <p>
          <a href={discussUrl} target="_blank" rel="noopener noreferrer">
            Discuss on Twitter
          </a>
          {` • `}
          <a href={editUrl} target="_blank" rel="noopener noreferrer">
            Edit on GitHub
          </a>
        </p>
        <div style={{ margin: '90px 0 40px 0' }}>
          <Signup />
        </div>
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
      html
      timeToRead
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        langs
        spoiler
      }
      fields {
        slug
        langKey
      }
    }
  }
`
