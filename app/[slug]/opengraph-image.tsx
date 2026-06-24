import { readdir, readFile } from "node:fs/promises";
import matter from "gray-matter";
import { size, contentType, generatePostImage } from "../../og/generateImage";

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

// Has to be declared locally rather than re-exported from ./page: the build's
// static-paths worker only runs generateStaticParams when it lives directly on
// the metadata route module, so a re-export silently yields zero params.
export async function generateStaticParams() {
  const entries = await readdir("./public/", { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ slug: entry.name }));
}
