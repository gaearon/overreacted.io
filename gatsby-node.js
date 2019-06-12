const Promise = require('bluebird');
const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');
const { supportedLanguages } = require('./i18n');

exports.createPages = ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions;

  return new Promise((resolve, reject) => {
    const blogPost = path.resolve('./src/templates/blog-post.js');

    // Create index pages for all supported languages
    Object.keys(supportedLanguages).forEach(langKey => {
      createPage({
        path: langKey === 'en' ? '/' : `/${langKey}/`,
        component: path.resolve('./src/templates/blog-index.js'),
        context: {
          langKey,
        },
      });
    });

    resolve(
      graphql(
        `
          {
            allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }, limit: 1000) {
              edges {
                node {
                  fields {
                    slug
                    langKey
                    directoryName
                  }
                  frontmatter {
                    title
                  }
                }
              }
            }
          }
        `,
      ).then(result => {
        if (result.errors) {
          console.log(result.errors);
          reject(result.errors);
          return;
        }

        // Create blog posts pages.
        const posts = result.data.allMarkdownRemark.edges;
        const allSlugs = posts.reduce((result, post) => {
          result.add(post.node.fields.slug);
          return result;
        }, new Set());

        const translationsByDirectory = posts.reduce((result, post) => {
          const { directoryName, langKey } = post.node.fields;

          if (directoryName && langKey && langKey !== 'en') {
            (result[directoryName] || (result[directoryName] = [])).push(langKey);
          }

          return result;
        }, {});

        const defaultLangPosts = posts.filter(({ node }) => node.fields.langKey === 'en');
        defaultLangPosts.forEach((post, index) => {
          const previous =
            index === defaultLangPosts.length - 1 ? null : defaultLangPosts[index + 1].node;
          const next = index === 0 ? null : defaultLangPosts[index - 1].node;

          const translations = translationsByDirectory[post.node.fields.directoryName] || [];

          createPage({
            path: post.node.fields.slug,
            component: blogPost,
            context: {
              slug: post.node.fields.slug,
              previous,
              next,
              translations,
              translatedLinks: [],
            },
          });

          const otherLangPosts = posts.filter(({ node }) => node.fields.langKey !== 'en');
          otherLangPosts.forEach(post => {
            const translations = translationsByDirectory[post.node.fields.directoryName];

            createPage({
              path: post.node.fields.slug,
              component: blogPost,
              context: {
                slug: post.node.fields.slug,
                translations,
                translatedLinks,
              },
            });
          });
        });
      }),
    );
  });
};

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    createNodeField({
      node,
      name: 'directoryName',
      value: path.basename(path.dirname(node.fileAbsolutePath)),
    });

    // Capture a list of what looks to be absolute internal links.
    // We'll later remember which of them have translations,
    // and use that to render localized internal links when available.

    // // TODO: check against links with no trailing slashes
    // // or that already link to translations.
    // const markdown = node.internal.content;
    // let maybeAbsoluteLinks = [];
    // let linkRe = /\]\((\/[^\)]+\/)\)/g;
    // let match = linkRe.exec(markdown);
    // while (match != null) {
    //   maybeAbsoluteLinks.push(match[1]);
    //   match = linkRe.exec(markdown);
    // }
    // createNodeField({
    //   node,
    //   name: 'maybeAbsoluteLinks',
    //   value: _.uniq(maybeAbsoluteLinks),
    // });
  }
};
