import { writeFile } from "node:fs/promises";
import { Feed } from "feed";

export async function generateFeed(metadata, posts) {
  const { description, title } = metadata;
  const site_url = "https://overreacted.io/";

  const feedOptions = {
    description,
    favicon: `${site_url}/icon.png`,
    feedLinks: { atom1: `${site_url}/atom.xml`, rss2: `${site_url}/rss.xml` },
    generator: "Feed for Node.js",
    id: site_url,
    image:
    "https://pbs.twimg.com/profile_images/1545194945161707520/rqkwPViA_400x400.jpg",
    link: site_url,
    title,
  };

  const feed = new Feed(feedOptions);

  for (const post of posts) {
    feed.addItem({
      date: new Date(post.date),
      description: post.spoiler,
      id: `${site_url}${post.slug}/`,
      link: `${site_url}${post.slug}/`,
      title: post.title,
    });
  }

  await Promise.all([
    writeFile("./public/atom.xml", feed.atom1()),
    writeFile("./public/rss.xml", feed.rss2()),
  ]);
}
