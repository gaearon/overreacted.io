import { readFile } from "fs/promises";
import matter from "gray-matter";

export async function PostPreview({ slug }) {
  const fileContent = await readFile("./public/" + slug + "/index.md", "utf8");
  const { data, content } = matter(fileContent);
  const wordCount = content.split(" ").filter(Boolean).length;

  return (
    <section className="rounded-md bg-black/5 p-2">
      <h5 className="font-bold">
        <a href={"/" + slug} target="_blank">
          {data.title}
        </a>
      </h5>
      <i>{wordCount} words</i>
    </section>
  );
}
