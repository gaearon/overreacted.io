import { Feed } from "feed";

export function generateFeed(posts, metadata) {
  const site_url = "https://weekly.zisheng.pro/";

  const feedOptions = {
    author: {
      name: "Aaron Young",
      email: "luozhu2021@gmail.com",
      link: site_url,
    },
    description: metadata.description,
    favicon: `https://www.zisheng.pro/favicon.ico`,
    feedLinks: { atom: `${site_url}atom.xml`, rss: `${site_url}rss.xml` },
    generator: "Feed for Node.js",
    id: site_url,
    image: "https://www.zisheng.pro/avatar.png",
    link: site_url,
    title: metadata.title,
  };

  const feed = new Feed(feedOptions);

  for (const post of posts) {
    feed.addItem({
      date: new Date(post.date),
      description: post.description,
      id: `${site_url}${post.slug}/`,
      link: `${site_url}${post.slug}/`,
      title: post.title,
    });
  }

  return feed;
}
