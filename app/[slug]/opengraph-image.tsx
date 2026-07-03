import { readFile } from "node:fs/promises";
import matter from "gray-matter";
import { size, contentType, generatePostImage } from "../../og/generateImage";

export const alt = "Overreacted";
export { size, contentType };

// Rendered on demand: next/og passes font data as a Uint8Array, which can't be
// serialized during Cache Components prerendering, so this route stays dynamic.
export default async function Image({ params }) {
  const { slug } = await params;
  const file = await readFile("./public/" + slug + "/index.md", "utf8");
  const { data } = matter(file);
  return generatePostImage({ title: data.title });
}
