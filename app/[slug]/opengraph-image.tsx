import { readFile } from "node:fs/promises";
import matter from "gray-matter";
import { size, contentType, generatePostImage } from "../../og/generateImage";
import { getPostDirs } from "./static-params";

export const dynamic = "force-static";
export const alt = "Overreacted";
export { size, contentType };

export default async function Image({ params }) {
  const { slug } = await params;
  const filename = "./public/" + slug + "/index.md";
  const file = await readFile(filename, "utf8");
  const { data } = matter(file);
  return generatePostImage({ title: data.title });
}

export async function generateStaticParams() {
  const dirs = await getPostDirs();
  return dirs.map((dir) => ({ slug: dir }));
}
