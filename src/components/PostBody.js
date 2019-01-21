import React, { useCallback } from 'react';
import { navigate, StaticQuery, graphql } from 'gatsby';

export default function PostBodyWrapper({ html }) {
  return (
    <StaticQuery
      query={graphql`
        query GetLanguages {
          allMarkdownRemark(
            filter: { fields: { slug: { regex: "/^/[^/]+/$/" } } }
          ) {
            edges {
              node {
                fields {
                  slug
                }
                frontmatter {
                  langs
                }
              }
            }
          }
        }
      `}
      render={data => (
        <PostBody
          html={html}
          posts={data.allMarkdownRemark.edges.map(edge => ({
            slug: edge.node.fields.slug,
            langs: edge.node.frontmatter.langs,
          }))}
        />
      )}
    />
  );
}

function PostBody({ html, posts }) {
  const handler = useCallback(event => {
    if (
      event.target.matches('a[href]') &&
      event.target.host === location.host
    ) {
      const dest = event.target.pathname;
      const src = location.pathname;
      if (src.match(/^\/[\w-]+\/.+\//)) {
        // localized page
        const [, lang] = /^\/([\w-]+)\//.exec(src);
        const post = posts.find(post => post.slug === dest);
        if (post.langs.includes(lang)) {
          navigate('/' + lang + dest);
        } else {
          navigate(dest);
        }
      } else {
        navigate(dest);
      }
      event.preventDefault();
    }
  }, []);
  return <div onClick={handler} dangerouslySetInnerHTML={{ __html: html }} />;
}
