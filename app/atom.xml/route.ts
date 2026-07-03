import { cacheLife } from "next/cache";
import { generateFeed } from "../posts";

async function getAtom() {
  "use cache";
  cacheLife("max");
  const feed = await generateFeed();
  return feed.atom1();
}

export async function GET() {
  return new Response(await getAtom());
}
