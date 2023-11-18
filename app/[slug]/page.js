import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "../Link";
import { sans } from "../fonts";
import remarkSmartpants from "remark-smartypants";
import rehypePrettyCode from "rehype-pretty-code";
import overnight from "overnight/themes/Overnight-Slumber.json";
import "./markdown.css";

overnight.colors["editor.background"] = "var(--code-bg)";

export default async function PostPage({ params }) {
  const file = await readFile("./public/" + params.slug + "/index.md", "utf8");
  let postComponents = {};
  try {
    postComponents = await import(
      "../../public/" + params.slug + "/components.js"
    );
  } catch (e) {
    if (!e || e.code !== "MODULE_NOT_FOUND") {
      throw e;
    }
  }
  const { content, data } = matter(file);
  const discussUrl = `https://x.com/search?q=${encodeURIComponent(
    `https://overreacted.io/${params.slug}/`,
  )}`;
  const editUrl = `https://github.com/gaearon/overreacted.io/edit/main/public/${encodeURIComponent(
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
        <Defs>
          <MDXRemote
            source={content}
            components={{
              a: Link,
              Server: Server,
              Client: Client,
              ...postComponents,
            }}
            options={{
              mdxOptions: {
                useDynamicImport: true,
                remarkPlugins: [remarkSmartpants],
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
        </Defs>
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

function Defs({ children }) {
  return (
    <div
      style={{
        "--jaggedTopPath": `polygon(${generateJaggedTopPath()})`,
        "--jaggedBottomPath": `polygon(${generateJaggedBottomPath()})`,
      }}
    >
      {children}
    </div>
  );
}

function Server({ children }) {
  return (
    <div
      style={{
        "--path": "var(--jaggedBottomPath)",
        "--radius-bottom": 0,
        "--padding-bottom": "1.2rem",
      }}
    >
      {children}
    </div>
  );
}

function Client({ children, glued }) {
  return (
    <div
      style={{
        "--path": "var(--jaggedTopPath)",
        "--radius-top": 0,
        "--padding-top": "1.2rem",
        position: "relative",
        marginTop: glued ? -30 : 0,
      }}
    >
      {children}
    </div>
  );
}

const jaggedSliceCount = 50;

function generateJaggedBottomPath() {
  let path = [
    ["0%", "0%"],
    ["100%", "0%"],
    ["100%", "100%"],
  ];
  let left = 100;
  let top = 100;
  for (let i = 0; i < jaggedSliceCount; i++) {
    left -= 100 / jaggedSliceCount;
    path.push([`${left}%`, i % 2 === 0 ? `calc(${top}% - 5px)` : `${top}%`]);
  }
  path.push(["0%", "100%"]);
  return path.map((pair) => pair.join(" ")).join(",");
}

function generateJaggedTopPath() {
  let path = [["0%", "5px"]];
  let left = 0;
  for (let i = 0; i < jaggedSliceCount; i++) {
    left += 100 / jaggedSliceCount;
    path.push([`${left}%`, i % 2 === 1 ? "5px" : "0"]);
  }
  path.push(["100%", "5px"]);
  path.push(["100%", "100%"]);
  path.push(["0%", "100%"]);
  return path.map((pair) => pair.join(" ")).join(",");
}

export async function generateStaticParams() {
  const entries = await readdir("./public/", { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  return dirs.map((dir) => ({ slug: dir }));
}

export async function generateMetadata({ params }) {
  const file = await readFile("./public/" + params.slug + "/index.md", "utf8");
  let { data } = matter(file);
  return {
    title: data.title + " — overreacted",
    description: data.spoiler,
  };
}
