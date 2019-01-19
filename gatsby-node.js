const _ = require('lodash');
const Promise = require('bluebird');
const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');

const { defaultLangKey } = require('./languages');

exports.createPages = ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions;

  // Oops
  createRedirect({
    fromPath: '/zh_TW/things-i-dont-know-as-of-2018/',
    toPath: '/zh-hant/things-i-dont-know-as-of-2018/',
    isPermanent: true,
    redirectInBrowser: true,
  });

  return new Promise((resolve, reject) => {
    const blogPost = path.resolve('./src/templates/blog-post.js');
    resolve(
      graphql(/* GraphQL */ `
        {
          allMarkdownRemark(
            sort: { fields: [frontmatter___date], order: DESC }
            limit: 1000
          ) {
            edges {
              node {
                fields {
                  slug
                  langKey
                }
                frontmatter {
                  title
                }
              }
            }
          }
        }
      `).then(result => {
        if (result.errors) {
          console.log(result.errors);
          reject(result.errors);
          return;
        }

        // Create blog posts pages.
        const posts = result.data.allMarkdownRemark.edges;

        const _originalTitleCache = new Map();
        const originalTitle = slug => {
          const plainSlug = slug.replace(/^\/[\w-]+\//, '/');
          if (_originalTitleCache.has(plainSlug)) {
            return _originalTitleCache.get(plainSlug);
          }
          const post = posts.find(({ node }) => node.fields.slug === plainSlug);
          if (!post)
            throw new Error('Can’t find parent for post with slug ' + slug);
          const { title } = post.node.frontmatter;
          _originalTitleCache.set(plainSlug, title);
          return title;
        };

        const defaultLangPosts = posts.filter(
          ({ node }) => node.fields.langKey === defaultLangKey
        );
        _.each(defaultLangPosts, (post, index) => {
          const previous =
            index === defaultLangPosts.length - 1
              ? null
              : defaultLangPosts[index + 1].node;
          const next = index === 0 ? null : defaultLangPosts[index - 1].node;

          createPage({
            path: post.node.fields.slug,
            component: blogPost,
            context: {
              slug: post.node.fields.slug,
              previous,
              next,
            },
          });

          const otherLangPosts = posts.filter(
            ({ node }) => node.fields.langKey !== defaultLangKey
          );
          _.each(otherLangPosts, post =>
            createPage({
              path: post.node.fields.slug,
              component: blogPost,
              context: {
                slug: post.node.fields.slug,
                originalTitle: originalTitle(post.node.fields.slug),
              },
            })
          );
        });
      })
    );
  });
};
