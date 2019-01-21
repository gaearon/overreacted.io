import React, { useCallback, useMemo } from 'react';
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
          posts={data.allMarkdownRemark.edges.map(edge => edge.node)}
        />
      )}
    />
  );
}

function PostBody({ html, posts }) {
  const langMap = useMemo(() => {
    const langMap = Object.create(null);
    posts.forEach(post => {
      langMap[post.fields.slug] = post.frontmatter.langs;
    });
    return langMap;
  }, posts);
  const handler = useCallback(
    event => {
      if (
        event.target.matches('a[href]') &&
        event.target.host === location.host
      ) {
        const dest = event.target.pathname;
        const src = location.pathname;
        if (src.match(/^\/[\w-]+\/.+\//)) {
          // localized page
          const [, lang] = /^\/([\w-]+)\//.exec(src);
          const langs = langMap[dest];
          if (langs.indexOf(lang) > -1) {
            navigate('/' + lang + dest);
          } else {
            navigate(dest);
          }
        } else {
          navigate(dest);
        }
        event.preventDefault();
      }
    },
    [posts]
  );
  return <div onClick={handler} dangerouslySetInnerHTML={{ __html: html }} />;
}
