import { Fragment } from "react";
import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import TextLink from "../TextLink";
import { sans } from "../fonts";
import remarkSmartpants from "remark-smartypants";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { remarkMdxEvalCodeBlock } from "./mdx";
import overnight from "overnight/themes/Overnight-Slumber.json";
import "./markdown.css";
import remarkGfm from "remark-gfm";
import * as markdown from "./markdown";

overnight.colors["editor.background"] = "var(--code-bg)";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filename = "./public/" + slug + "/index.md";
  const file = await readFile(filename, "utf8");
  let postComponents: any = {};
  try {
    postComponents = await import("../../public/" + slug + "/components.js");
  } catch (e: any) {
    if (!e || e.code !== "MODULE_NOT_FOUND") {
      throw e;
    }
  }
  let Wrapper = postComponents.Wrapper ?? Fragment;
  const { content, data } = matter(file);
  const editUrl = `https://tangled.org/@danabra.mov/overreacted/blob/main/public/${encodeURIComponent(
    slug,
  )}/index.md?code=true`;
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
        <div className="markdown flex flex-col gap-8 mt-12">
          {(!data.nocta || data.youtube) && (
            <div className="relative md:-left-6 flex flex-wrap items-baseline gap-4">
              {!data.nocta && (
                <a
                  href="https://ko-fi.com/gaearon"
                  target="_blank"
                  className="tip tip-sm"
                >
                  <span className="tip-bg" />
                  Pay what you like
                </a>
              )}
              {data.youtube && (
                <TextLink href={data.youtube}>
                  <span className="hidden min-[400px]:inline">Watch on </span>
                  YouTube
                </TextLink>
              )}
            </div>
          )}

          <Wrapper>
            <div className="flex flex-col gap-8">
            <MDXRemote
              source={content}
              components={{
                p: markdown.P,
                h2: markdown.H2,
                h3: markdown.H3,
                h4: markdown.H4,
                blockquote: markdown.Blockquote,
                ul: markdown.UL,
                ol: markdown.OL,
                li: markdown.LI,
                pre: markdown.Pre,
                code: markdown.Code,
                table: markdown.Table,
                th: markdown.Th,
                td: markdown.Td,
                hr: markdown.Hr,
                a: (props: React.ComponentProps<"a">) => (
                  <TextLink {...props} href={props.href ?? ""} />
                ),
                img: async ({ src, ...rest }) => {
                  if (
                    src &&
                    !/^https?:\/\//.test(src) &&
                    src.endsWith(".svg")
                  ) {
                    const svgPath = `./public/${slug}/${src}`;
                    const svgContent = await readFile(svgPath, "utf8");
                    const maxWidth = src.endsWith("-full.svg")
                      ? "100%"
                      : "450px";
                    const colorReplacedSvg = svgContent
                      .replace(/#ffffff/gi, "var(--bg-rotated)")
                      .replace(/<metadata>.*?<\/metadata>/s, "")
                      .replace(
                        "<svg",
                        `<svg style="max-width: ${maxWidth}; width: 100%; height: auto;"`,
                      );

                    return (
                      <span
                        dangerouslySetInnerHTML={{ __html: colorReplacedSvg }}
                        style={{
                          filter: "var(--svg-filter)",
                          display: "inline-block",
                          ...rest.style,
                        }}
                        {...rest}
                      />
                    );
                  }

                  let finalSrc = src;
                  if (src && !/^https?:\/\//.test(src)) {
                    // https://github.com/gaearon/overreacted.io/issues/827
                    finalSrc = `/${slug}/${src}`;
                  }

                  return <markdown.Img src={finalSrc} {...rest} />;
                },
                Video: ({ src, poster, ...rest }) => {
                  let finalSrc = src;
                  if (src && !/^https?:\/\//.test(src)) {
                    finalSrc = `/${slug}/${src}`;
                  }
                  let finalPoster = poster;
                  if (poster && !/^https?:\/\//.test(poster)) {
                    finalPoster = `/${slug}/${poster}`;
                  }
                  return <video src={finalSrc} poster={finalPoster} {...rest} />;
                },
                ...postComponents,
              }}
              options={{
                mdxOptions: {
                  useDynamicImport: true,
                  remarkPlugins: [
                    remarkSmartpants,
                    remarkGfm,
                    [remarkMdxEvalCodeBlock, filename],
                  ] as any,
                  rehypePlugins: [
                    [
                      rehypePrettyCode,
                      {
                        theme: overnight,
                        defaultLang: { block: "text" },
                      },
                    ],
                    [rehypeSlug],
                  ] as any,
                } as any,
              }}
            />
            </div>
          </Wrapper>
          {!data.nocta && (
            <div className="flex flex-wrap items-baseline gap-4 relative md:-left-8">
              <a
                href="https://ko-fi.com/gaearon"
                target="_blank"
                className="tip"
              >
                <span className="tip-bg" />
                Pay what you like
              </a>
              <TextLink href="/hire-me-in-japan/">Hire me</TextLink>
            </div>
          )}
          <hr className="opacity-60 dark:opacity-10" />
          <p>
            {data.bluesky && (
              <>
                <TextLink href={data.bluesky}>Discuss on Bluesky</TextLink>
                &nbsp;&nbsp;&middot;&nbsp;&nbsp;
              </>
            )}
            {data.youtube && (
              <>
                <TextLink href={data.youtube}>Watch on YouTube</TextLink>
                &nbsp;&nbsp;&middot;&nbsp;&nbsp;
              </>
            )}
            {/* TODO: This should say Edit when Tangled adds an editor. */}
            <TextLink href={editUrl}>Fork on Tangled</TextLink>
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const file = await readFile("./public/" + slug + "/index.md", "utf8");
  let { data } = matter(file);
  return {
    title: data.title + " — overreacted",
    description: data.spoiler,
  };
}
