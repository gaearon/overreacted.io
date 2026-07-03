import { readFile, readdir } from "node:fs/promises";
import matter from "gray-matter";
import { size, contentType, generatePostImage } from "../../og/generateImage";

export const alt = "Overreacted";
export { size, contentType };

export default async function Image({ params }) {
  const { slug } = await params;
  const title = await getTitle(slug)
  return generatePostImage({ title });
}

async function getTitle(slug: string) {
  'use cache'
  const file = await readFile("./public/" + slug + "/index.md", "utf8");
  const { data } = matter(file);
  return data.title
}

export async function generateStaticParams() {
  const entries = await readdir("./public/", { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  return dirs.map((dir) => ({ slug: dir }));
}
