import { cacheLife } from "next/cache";
import { getPosts } from "../posts";

async function getLlmsTxt() {
  "use cache";
  cacheLife("max");
  const posts = await getPosts();
  const lines = [
    "# Overreacted",
    "",
    "> A personal blog by Dan Abramov about React, JavaScript, AT Protocol, Lean, and programming in general.",
    "",
    "## Posts",
    "",
  ];

  for (const post of posts) {
    lines.push(`- [${post.title}](https://overreacted.io/${post.slug}/index.md): ${post.spoiler}`);
  }

  return lines.join("\n");
}

export async function GET() {
  return new Response(await getLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
