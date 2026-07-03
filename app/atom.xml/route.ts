
import { generateFeed } from "../posts";

async function getAtom() {
  "use cache";
  const feed = await generateFeed();
  return feed.atom1();
}

export async function GET() {
  return new Response(await getAtom());
}
