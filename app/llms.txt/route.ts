import { getPosts } from "../posts";

export async function GET() {
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

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
