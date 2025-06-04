import Link from "./Link";
import Color from "colorjs.io";
import { metadata, getPosts } from "./posts";
import { sans } from "./fonts";
import EmotionDisplay from "./components/ProgressBars";
import { Suspense } from "react";

export { metadata };

export default async function Home() {
  const posts = await getPosts();
  return (
    <div className="relative max-w-[1000px] mx-auto">
      <div className="flex flex-col gap-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            className="block py-4 hover:scale-[1.005] will-change-transform"
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
      <div className="hidden lg:block fixed right-56 top-12">
        <div className={sans.className}>
          <Suspense fallback={
            <div className="w-[300px] h-[300px] bg-[#1c1c1c] rounded-lg flex items-center justify-center">
            </div>
          }>
            <EmotionDisplay />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function PostTitle({ post }) {
  let lightStart = new Color("#9FEF00");
  let lightEnd = new Color("lab(33 42.09 -43.19)");
  let lightRange = lightStart.range(lightEnd);
  let darkStart = new Color("#9FEF00");
  let darkEnd = new Color("#efd949");
  let darkRange = darkStart.range(darkEnd);
  let today = new Date();
  let timeSinceFirstPost = (today - new Date(2018, 10, 30)).valueOf();
  let timeSinceThisPost = (today - new Date(post.date)).valueOf();
  let staleness = timeSinceThisPost / timeSinceFirstPost;

  return (
    <h2
      className={[
        sans.className,
        "text-[36px] font-black leading-tight mb-3",
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
    <p className="text-[15px] text-gray-700 dark:text-gray-300">
      {new Date(post.date).toLocaleDateString("en", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </p>
  );
}

function PostSubtitle({ post }) {
  return <p className="mt-2 text-lg">{post.spoiler}</p>;
}
