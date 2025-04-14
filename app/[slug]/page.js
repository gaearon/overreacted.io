import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import Script from "next/script";
import Link from "../Link";
import { sans } from "../fonts";
import remarkSmartpants from "remark-smartypants";
import rehypePrettyCode from "rehype-pretty-code";
import { remarkMdxEvalCodeBlock } from "./mdx.js";
import overnight from "overnight/themes/Overnight-Slumber.json";
import "./markdown.css";

overnight.colors["editor.background"] = "var(--code-bg)";

export default async function PostPage({ params }) {
  const { slug } = await params;
  const filename = "./public/" + slug + "/index.md";
  const file = await readFile(filename, "utf8");
  let postComponents = {};
  try {
    postComponents = await import("../../public/" + slug + "/components.js");
  } catch (e) {
    if (!e || e.code !== "MODULE_NOT_FOUND") {
      throw e;
    }
  }
  const { content, data } = matter(file);
  const editUrl = `https://github.com/youngjuning/weekly/edit/main/public/${encodeURIComponent(
    slug,
  )}/index.md`;

  return (
    <article>
      {data.cover && <img width="100%" src={data.cover} alt={data.title} data-fancybox />}
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
            img: ({ src, ...rest }) => {
              if (src && !/^https?:\/\//.test(src)) {
                // https://github.com/gaearon/overreacted.io/issues/827
                src = `/${slug}/${src}`;
              }
              return <img src={src} {...rest} />;
            },
            ...postComponents,
          }}
          options={{
            mdxOptions: {
              useDynamicImport: true,
              remarkPlugins: [
                remarkSmartpants,
                [remarkMdxEvalCodeBlock, filename],
              ],
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
          <Link href={editUrl}>Edit on GitHub</Link>
        </p>
        <div className="giscus"></div>
        <Script src="https://giscus.app/client.js"
          data-repo="youngjuning/weekly"
          data-repo-id="R_kgDOOOz8pw"
          data-category="General"
          data-category-id="DIC_kwDOOOz8p84CoqEY"
          data-mapping="title"
          data-strict="0"
          data-reactions-enabled="1"
          data-emit-metadata="0"
          data-input-position="top"
          data-theme="preferred_color_scheme"
          data-lang="en"
          data-loading="lazy"
          crossorigin="anonymous"
          async
        >
        </Script>
      </div>
      <ins
        className="adsbygoogle"
        style={{display: "block"}}
        data-ad-client="ca-pub-5641491107630454"
        data-ad-slot="5702084207"
        data-page-url="https://www.nablepart.com"
        data-override-format="true"
        data-ad-format="auto"
        data-full-width-responsive="true"
      /><Script>
        {`
          (adsbygoogle = window.adsbygoogle || []).push({});
        `}
      </Script>
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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const file = await readFile("./public/" + slug + "/index.md", "utf8");
  let { data } = matter(file);
  return {
    title: data.title + " — Vibe Weekly",
    description: data.description,
    keywords: data.keywords,
  };
}
