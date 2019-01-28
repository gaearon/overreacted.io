import React from 'react';
import { Link, graphql } from 'gatsby';
import get from 'lodash/get';

import Bio from '../components/Bio';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { formatPostDate, formatReadingTime } from '../utils/helpers';
import { rhythm } from '../utils/typography';

function BlogIndex(props) {
  const siteTitle = get(props, 'data.site.siteMetadata.title');
  const posts = get(props, 'data.allMarkdownRemark.edges').filter(
    ({ node }) => node.fields.langKey === 'en'
  );
  return (
    <Layout location={props.location} title={siteTitle}>
      <SEO />
      <aside>
        <Bio />
      </aside>
      <main>
        {posts.map(({ node }) => {
          const title = get(node, 'frontmatter.title') || node.fields.slug;
          return (
            <article key={node.fields.slug}>
              <header>
                <h3
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: rhythm(1),
                    marginBottom: rhythm(1 / 4),
                  }}
                >
                  <Link
                    style={{ boxShadow: 'none' }}
                    to={node.fields.slug}
                    rel="bookmark"
                  >
                    {title}
                  </Link>
                </h3>
                <small>
                  {formatPostDate(node.frontmatter.date, 'en')}
                  {` • ${formatReadingTime(node.timeToRead)}`}
                </small>
              </header>
              <p
                dangerouslySetInnerHTML={{ __html: node.frontmatter.spoiler }}
              />
            </article>
          );
        })}
      </main>
      <Footer />
    </Layout>
  );
}

export default BlogIndex;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          fields {
            slug
            langKey
          }
          timeToRead
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            spoiler
          }
        }
      }
    }
  }
`;
