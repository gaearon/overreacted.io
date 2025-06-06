import Link from "./Link";
import Color from "colorjs.io";
import { metadata, getPosts } from "./posts";
import { sans } from "./fonts";
import EmotionDisplay from "./components/ProgressBars";
import TechIcons from "./components/TechIcons";
import { Suspense } from "react";

export { metadata };

export default async function Home() {
  const posts = await getPosts();
  return (
    <div className="relative max-w-[1000px] mx-auto">
      <div className="relative">
        <div className="absolute right-[-330px] xl:right-[-380px] top-0 w-[330px] transition-all duration-300 ease-in-out max-xl:relative max-xl:right-0 max-xl:mx-auto max-xl:mb-8">
          <div className={sans.className}>
            <h2 className="text-3xl font-bold text-[#efd949] mb-2 relative z-10">Projects</h2>
            <div className="relative -mt-2">
              <Suspense fallback={
                <div className="w-[330px] h-[330px] bg-[#151619] rounded-lg flex items-center justify-center">
                </div>
              }>
                <EmotionDisplay />
              </Suspense>
            </div>
          </div>
        </div>
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
    <div className="flex items-center gap-3">
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
      {post.technologies && <TechIcons technologies={post.technologies} />}
    </div>
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
      <span className="mx-2">·</span>
      <span>{post.readTimeMinutes} min read</span>
    </p>
  );
}

function PostSubtitle({ post }) {
  return <p className="mt-2 text-lg">{post.spoiler}</p>;
}
