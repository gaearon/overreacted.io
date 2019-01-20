import React from 'react';
import { StaticQuery, graphql } from 'gatsby';
import profilePic from '../assets/profile-pic.jpg';
import { rhythm } from '../utils/typography';

const query = graphql`
  query getBio {
    site {
      siteMetadata {
        title
        description
        author
        social {
          twitter
        }
      }
    }
  }
`;
class Bio extends React.Component {
  render() {
    return (
      <StaticQuery
        query={query}
        render={data => {
          const { author, social, description } = data.site.siteMetadata;
          const [part1, part2] = description.split(author);

          return (
            <div
              style={{
                display: 'flex',
                marginBottom: rhythm(2),
              }}
            >
              <img
                src={profilePic}
                alt={author}
                style={{
                  marginRight: rhythm(1 / 2),
                  marginBottom: 0,
                  width: rhythm(2),
                  height: rhythm(2),
                  borderRadius: '50%',
                }}
              />
              <p style={{ maxWidth: 310 }}>
                {part1}
                <a href={`https://mobile.twitter.com/${social.twitter}`}>
                  {author}
                </a>
                {part2}
              </p>
            </div>
          );
        }}
      />
    );
  }
}

export default Bio;
