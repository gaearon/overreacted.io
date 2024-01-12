import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import Link from "./Link";
import Color from "colorjs.io";
import { sans } from "./fonts";

export const metadata = {
  title: "overreacted — A blog by Dan Abramov",
  description: "A personal blog by Dan Abramov",
  alternates: {
    types: {
      "application/atom+xml": "https://overreacted.io/atom.xml",
      "application/rss+xml": "https://overreacted.io/rss.xml",
    },
  },
};

export async function getPosts() {
  const entries = await readdir("./public/", { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const fileContents = await Promise.all(
    dirs.map((dir) => readFile("./public/" + dir + "/index.md", "utf8")),
  );
  const posts = dirs.map((slug, i) => {
    const fileContent = fileContents[i];
    const { data } = matter(fileContent);
    return { slug, ...data };
  });
  posts.sort((a, b) => {
    return Date.parse(a.date) < Date.parse(b.date) ? 1 : -1;
  });
  return posts;
}

export default async function Home() {
  const posts = await getPosts();
  return (
    <div className="relative -top-[10px] flex flex-col gap-8">
      {posts.map((post) => (
        <Link
          key={post.slug}
          className="block py-4 hover:scale-[1.005]"
          href={"/" + post.slug + "/"}
        >
          <article>
            <PostTitle post={post} />
            <PostMeta post={post} />
            <PostSubtitle post={post} />
          </article>
        </Link>
      ))}
    </div>
  );
}

function PostTitle({ post }) {
  let lightStart = new Color("lab(63 59.32 -1.47)");
  let lightEnd = new Color("lab(33 42.09 -43.19)");
  let lightRange = lightStart.range(lightEnd);
  let darkStart = new Color("lab(81 32.36 -7.02)");
  let darkEnd = new Color("lab(78 19.97 -36.75)");
  let darkRange = darkStart.range(darkEnd);
  let today = new Date();
  let timeSinceFirstPost = (today - new Date(2018, 10, 30)).valueOf();
  let timeSinceThisPost = (today - new Date(post.date)).valueOf();
  let staleness = timeSinceThisPost / timeSinceFirstPost;

  return (
    <h2
      className={[
        sans.className,
        "text-[28px] font-black",
        "text-[--lightLink] dark:text-[--darkLink]",
      ].join(" ")}
      style={{
        "--lightLink": lightRange(staleness).toString(),
        "--darkLink": darkRange(staleness).toString(),
      }}
    >
      {post.title}
    </h2>
  );
}

function PostMeta({ post }) {
  return (
    <p className="text-[13px] text-gray-700 dark:text-gray-300">
      {new Date(post.date).toLocaleDateString("en", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </p>
  );
}

function PostSubtitle({ post }) {
  return <p className="mt-1">{post.spoiler}</p>;
}
