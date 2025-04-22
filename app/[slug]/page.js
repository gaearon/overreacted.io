import { Fragment } from "react";
import { readdir, readFile } from "fs/promises";
import Link from "../Link";
import matter from "gray-matter";
import { sans } from "../fonts";
import "./markdown.css";

export default async function PostPage({ params }) {
  const { slug } = await params;
  let postComponents = {};
  try {
    postComponents = await import("../../public/" + slug + "/components.js");
  } catch (e) {
    if (!e || e.code !== "MODULE_NOT_FOUND") {
      throw e;
    }
  }
  let Wrapper = postComponents.Wrapper ?? Fragment;
  const { default: Post, frontmatter: data } = await import(
    `../../public/${slug}/index.md`
  );
  const discussUrl = `https://bsky.app/search?q=${encodeURIComponent(
    `https://overreacted.io/${slug}/`,
  )}`;
  const editUrl = `https://github.com/gaearon/overreacted.io/edit/main/public/${encodeURIComponent(
    slug,
  )}/index.md`;
  return (
    <>
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
          <a
            href="https://ko-fi.com/gaearon"
            target="_blank"
            className="tip tip-sm"
          >
            <span className="tip-bg" />
            Pay what you like
          </a>
          <Wrapper>
            <Post
              components={{
                a: Link,
                img: ({ src, ...rest }) => {
                  if (src && !/^https?:\/\//.test(src)) {
                    // https://github.com/gaearon/overreacted.io/issues/827
                    src = `/${slug}/${src}`;
                  }
                  return <img src={src} {...rest} />;
                },
                ...postComponents,
              }}
            />
          </Wrapper>
          <a href="https://ko-fi.com/gaearon" target="_blank" className="tip">
            <span className="tip-bg" />
            Pay what you like
          </a>
          <hr />
          <p>
            <Link href={discussUrl}>Discuss on Bluesky</Link>
            &nbsp;&nbsp;&middot;&nbsp;&nbsp;
            <Link href={editUrl}>Edit on GitHub</Link>
          </p>
        </div>
      </article>
    </>
  );
}

export async function generateStaticParams() {
  const entries = await readdir("./public/", { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  return dirs.map((dir) => ({ slug: dir }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const file = await readFile("./public/" + slug + "/index.md", "utf8");
  let { data } = matter(file);
  return {
    title: data.title + " — overreacted",
    description: data.spoiler,
  };
}
