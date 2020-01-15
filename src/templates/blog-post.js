import React from 'react';
import { Link, graphql } from 'gatsby';
import get from 'lodash/get';

import '../fonts/fonts-post.css';
import Bio from '../components/Bio';
import Layout from '../components/Layout';
import Seo from '../components/SEO';
// import Signup from '../components/Signup';
import { formatPostDate, formatReadingTime } from '../utils/helpers';
import { rhythm, scale } from '../utils/typography';

// const GITHUB_USERNAME = 'gaearon';
// const GITHUB_REPO_NAME = 'ivanmauric.io';

// const systemFont = `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
//     "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
//     "Droid Sans", "Helvetica Neue", sans-serif`;

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark;
    const siteTitle = get(this.props, 'data.site.siteMetadata.title');
    const { previous, next, slug } = this.props.pageContext;
    const lang = post.fields.langKey;
    // const editUrl = `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}/edit/master/src/pages/${slug.slice(
    //   1,
    //   slug.length - 1
    // )}/index${lang === 'en' ? '' : `.${lang}`}.md`;
    const discussUrl = `https://mobile.twitter.com/search?q=${encodeURIComponent(
      `https://ivanmauric.io${slug}`
    )}`;

    // Replace original links with translated when available.
    const html = post.html;

    // eslint-disable-next-line react/jsx-pascal-case
    return (
      <Layout location={this.props.location} title={siteTitle}>
        <Seo
          lang="en"
          title={post.frontmatter.title}
          description={post.frontmatter.spoiler}
          slug={post.fields.slug}
        />
        <main>
          <article>
            <header>
              <h1 style={{ color: 'var(--textTitle)' }}>
                {post.frontmatter.title}
              </h1>
              <p
                style={{
                  ...scale(-1 / 5),
                  display: 'block',
                  marginBottom: rhythm(1),
                  marginTop: rhythm(-4 / 5),
                }}
              >
                {formatPostDate(post.frontmatter.date, lang)}
                {` • ${formatReadingTime(post.timeToRead)}`}
              </p>
            </header>
            <div dangerouslySetInnerHTML={{ __html: html }} />
            <footer>
              <p>
                <a href={discussUrl} target="_blank" rel="noopener noreferrer">
                  Discuss on Twitter
                </a>
                {/* {` • `}
                <a href={editUrl} target="_blank" rel="noopener noreferrer">
                  Edit on GitHub
                </a> */}
              </p>
            </footer>
          </article>
        </main>
        <aside>
          {/* <div
            style={{
              margin: '90px 0 40px 0',
              fontFamily: systemFont,
            }}
          >
            <Signup />
          </div> */}
          <h3
            style={{
              fontFamily: 'Montserrat, sans-serif',
              marginTop: rhythm(4),
            }}
          >
            <Link
              style={{
                boxShadow: 'none',
                textDecoration: 'none',
                color: 'var(--textLink)',
              }}
              to="/"
            >
              ivanmauric.io
            </Link>
          </h3>
          <Bio />
          <nav>
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
                  <Link
                    to={previous.fields.slug}
                    rel="prev"
                    style={{ marginRight: 20 }}
                  >
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
          </nav>
        </aside>
      </Layout>
    );
  }
}

export default BlogPostTemplate;

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
        spoiler
      }
      fields {
        slug
        langKey
      }
    }
  }
`;
