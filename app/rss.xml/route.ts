import { generateFeed } from "../posts";

async function getRssFeed() {
  "use cache";
  const feed = await generateFeed();
  return feed.rss2();
}

export async function GET() {
  return new Response(await getRssFeed());
}
