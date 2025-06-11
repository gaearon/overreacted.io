import { generateFeed } from "../posts";

export const dynamic = "force-static";

export async function GET() {
  const feed = await generateFeed();
  return new Response(feed.rss2());
}
