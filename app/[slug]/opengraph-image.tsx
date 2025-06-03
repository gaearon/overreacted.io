import { readFile } from "node:fs/promises";
import matter from "gray-matter";
import { size, contentType, generatePostImage } from "../../og/generateImage";

export const dynamic = "force-static";
export const alt = "Ozipi";
export { size, contentType };

export default async function Image({ params }) {
  const { slug } = await params;
  const filename = "./public/" + slug + "/index.md";
  const file = await readFile(filename, "utf8");
  const { data } = matter(file);
  return generatePostImage({ title: data.title });
}

export { generateStaticParams } from "./page";
