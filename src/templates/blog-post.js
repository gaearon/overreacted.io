import React from 'react';
import { Link, graphql } from 'gatsby';
import get from 'lodash/get';

import '../fonts/fonts-post.css';
import Bio from '../components/Bio';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Signup from '../components/Signup';
import { formatPostDate, formatReadingTime } from '../utils/helpers';
import { rhythm, scale } from '../utils/typography';
import {
  codeToLanguage,
  createLanguageLink,
  loadFontsForCode,
} from '../utils/i18n';

const GITHUB_USERNAME = 'gaearon';
const GITHUB_REPO_NAME = 'overreacted.io';
const systemFont = `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
    "Droid Sans", "Helvetica Neue", sans-serif`;

class Translations extends React.Component {
  render() {
    const { translations, lang, languageLink, editUrl } = this.props;
    return (
      <p
        style={{
          fontSize: '0.9em',
          border: '1px solid var(--hr)',
          borderRadius: '0.75em',
          padding: '0.75em',
          background: 'var(--inlineCode-bg)',
          wordBreak: 'keep-all',
          // Use system font to avoid loading extra glyphs for language names
          fontFamily: systemFont,
        }}
      >
        {translations.length > 0 && (
          <span ref={this.translationsRef}>
            <span ref={this.translationsChildRef}>
              Translations by readers:{' '}
            </span>
            {translations.map((l, i) => (
              <React.Fragment key={l}>
                {l === lang ? (
                  <b>{codeToLanguage(l)}</b>
                ) : (
                  <Link to={languageLink(l)}>{codeToLanguage(l)}</Link>
                )}
                {i === translations.length - 1 ? '' : ' • '}
              </React.Fragment>
            ))}
          </span>
        )}
        {lang !== 'en' && (
          <>
            <br />
            <br />
            <Link to={languageLink('en')}>Read the original</Link>
            {' • '}
            <a href={editUrl} target="_blank" rel="noopener noreferrer">
              Improve this translation
            </a>{' '}
          </>
        )}
      </p>
    );
  }
}

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark;
    const siteTitle = get(this.props, 'data.site.siteMetadata.title');
    const { previous, next, slug, translations } = this.props.pageContext;
    const lang = post.fields.langKey;

    translations.sort((a, b) => {
      return codeToLanguage(a) < codeToLanguage(b) ? -1 : 1;
    });

    loadFontsForCode(lang);
    const languageLink = createLanguageLink(slug, lang);
    const enSlug = languageLink('en');
    const editUrl = `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}/edit/master/src/pages/${enSlug.slice(
      1,
      enSlug.length - 1
    )}/index${lang === 'en' ? '' : '.' + lang}.md`;
    const discussUrl = `https://mobile.twitter.com/search?q=${encodeURIComponent(
      `https://overreacted.io${enSlug}`
    )}`;
    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          lang={lang}
          title={post.frontmatter.title}
          description={post.frontmatter.spoiler}
          slug={post.fields.slug}
          lang={lang}
        />
        <h1 style={{ color: 'var(--textTitle)' }}>{post.frontmatter.title}</h1>
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
        {translations.length > 0 && (
          <Translations
            translations={translations}
            editUrl={editUrl}
            languageLink={languageLink}
            lang={lang}
          />
        )}
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
        <div
          style={{
            margin: '90px 0 40px 0',
            fontFamily: systemFont,
          }}
        >
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
              color: 'var(--pink)',
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
