import { getPosts, metadata } from "../page";
import { generateFeed } from "../feed";

export const dynamic = "force-static";

export async function GET() {
  const posts = await getPosts();
  const feed = generateFeed(posts, metadata);
  return new Response(feed.rss2());
}
