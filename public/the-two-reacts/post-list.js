import { PostPreview } from "./post-preview";
import { readdir } from "fs/promises";

export async function PostList() {
  const entries = await readdir("./public/", { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory()  && !entry.name.endsWith('.webm'));
  return (
    <div className="mb-8 flex h-72 flex-col gap-2 overflow-scroll font-sans">
      {dirs.map((dir) => (
        <PostPreview key={dir.name} slug={dir.name} />
      ))}
    </div>
  );
}
