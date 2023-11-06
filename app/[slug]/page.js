import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "../Link";
import { sans } from "../fonts";
import rehypePrettyCode from "rehype-pretty-code";
import overnight from "overnight/themes/Overnight-Slumber.json";
import "./markdown.css";

export async function generateMetadata({ params }) {
  const file = await readFile("./public/" + params.slug + "/index.md", "utf8");
  let { data } = matter(file);
  return {
    title: data.title + " — overreacted",
    description: data.spoiler,
  };
}

export default async function PostPage({ params }) {
  const file = await readFile("./public/" + params.slug + "/index.md", "utf8");
  let { content, data } = matter(file);
  // TODO: change the source instead of this hack.
  content = content.replaceAll("```jsx{", "```jsx {");
  const discussUrl = `https://x.com/search?q=${encodeURIComponent(
    `https://overreacted.io/${params.slug}/`,
  )}`;
  const editUrl = `https://github.com/gaearon/overreacted.io/edit/master/public/${encodeURIComponent(
    params.slug,
  )}/index.md`;
  return (
    <article>
      <h1
        className={[
          sans.className,
          "text-[40px] font-black leading-[44px] text-[--title]",
        ].join(" ")}
      >
        {data.title}
      </h1>
      <p className="mt-2 text-[13px] text-gray-700 dark:text-gray-300">
        {new Date(data.date).toLocaleDateString("en", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <div className="markdown mt-10">
        <MDXRemote
          source={content}
          components={{
            a: Link,
          }}
          options={{
            mdxOptions: {
              rehypePlugins: [
                [
                  rehypePrettyCode,
                  {
                    theme: overnight,
                  },
                ],
              ],
            },
          }}
        />
        <hr />
        <p>
          <Link href={discussUrl}>Discuss on 𝕏</Link>
          &nbsp;&nbsp;&middot;&nbsp;&nbsp;
          <Link href={editUrl}>Edit on GitHub</Link>
        </p>
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  const entries = await readdir("./public/", { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  return dirs.map((dir) => ({ slug: dir }));
}
