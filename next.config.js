import createMDX from "@next/mdx";
import remarkSmartpants from "remark-smartypants";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { remarkMdxEvalCodeBlock } from "./mdx.js";
import overnight from "overnight/themes/Overnight-Slumber.json" with { type: "json" };

overnight.colors["editor.background"] = "var(--code-bg)";

const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  output: "export",
  trailingSlash: true,
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [
      remarkFrontmatter,
      remarkMdxFrontmatter,
      remarkSmartpants,
      remarkMdxEvalCodeBlock,
    ],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: overnight,
        },
      ],
      [rehypeSlug],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: "linked-heading",
            target: "_self",
          },
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
