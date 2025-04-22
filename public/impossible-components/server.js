import { readFile, readdir } from "fs/promises";
import matter from "gray-matter";
import {
  GreetingFrontend,
  GreetingFrontend_2,
  SortableList,
  SortableList_2,
  SortableList_3,
  SortableList_4,
  ExpandingSection_2,
} from "./client";

export async function GreetingBackend({
  colorFile = "./public/impossible-components/color.txt",
}) {
  const myColor = await readFile(colorFile, "utf8");
  return <GreetingFrontend color={myColor} />;
}

export function Welcome() {
  return (
    <>
      <GreetingBackend colorFile="./public/impossible-components/color1.txt" />
      <GreetingBackend colorFile="./public/impossible-components/color2.txt" />
      <GreetingBackend colorFile="./public/impossible-components/color3.txt" />
    </>
  );
}

export async function GreetingBackend_2({
  colorFile = "./public/impossible-components/color.txt",
}) {
  const myColor = await readFile(colorFile, "utf8");
  return <GreetingFrontend_2 color={myColor} />;
}

export function Welcome_2() {
  return (
    <>
      <GreetingBackend_2 colorFile="./public/impossible-components/color1.txt" />
      <GreetingBackend_2 colorFile="./public/impossible-components/color2.txt" />
      <GreetingBackend_2 colorFile="./public/impossible-components/color3.txt" />
    </>
  );
}

export async function SortableFileList({ directory }) {
  const files = await readdir(directory);
  return <SortableList items={files} />;
}

export async function SortableFileList_2({ directory }) {
  const files = await readdir(directory);
  return <SortableList_2 items={files} />;
}

export async function PostPreview({ slug }) {
  const fileContent = await readFile("./public/" + slug + "/index.md", "utf8");
  const { data, content } = matter(fileContent);
  const wordCount = content.split(" ").filter(Boolean).length;

  return (
    <section className="rounded-md bg-black/5 p-2">
      <h5 className="font-bold">
        <a href={"/" + slug} target="_blank">
          {data.title}
        </a>
      </h5>
      <i>{wordCount.toLocaleString()} words</i>
    </section>
  );
}

export async function PostPreview_2({ slug }) {
  const fileContent = await readFile("./public/" + slug + "/index.md", "utf8");
  const { data, content } = matter(fileContent);
  const wordCount = content.split(" ").filter(Boolean).length;
  const firstSentence = content.split(/\.|\n\n/)[0];

  return (
    <section className="rounded-md bg-black/5 p-2">
      <h5 className="font-bold">
        <a href={"/" + slug} target="_blank">
          {data.title}
        </a>
      </h5>
      <i>{wordCount.toLocaleString()} words</i>
      <p style={{ marginTop: 20, padding: 0 }}>{firstSentence} [...]</p>
    </section>
  );
}

export async function PostPreview_3({ slug }) {
  const fileContent = await readFile("./public/" + slug + "/index.md", "utf8");
  const { data, content } = matter(fileContent);
  const wordCount = content.split(" ").filter(Boolean).length;
  const firstSentence = content.split(/\.\s|\n\n/)[0];

  return (
    <ExpandingSection_2
      extraContent={
        <p style={{ marginTop: 20, padding: 0 }}>{firstSentence} [...]</p>
      }
    >
      <h5 className="font-bold">
        <a href={"/" + slug} target="_blank">
          {data.title}
        </a>
      </h5>
      <i>{wordCount.toLocaleString()} words</i>
    </ExpandingSection_2>
  );
}

export async function PostList() {
  const entries = await readdir("./public/", { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory());
  return (
    <div className="mb-8 flex h-72 flex-col gap-2 overflow-scroll font-sans">
      {dirs.map((dir) => (
        <PostPreview_3 key={dir.name} slug={dir.name} />
      ))}
    </div>
  );
}

export async function SortableFileList_3({ directory }) {
  const files = await readdir(directory);
  const items = files.map((file) => ({
    id: file,
    content: file,
    searchText: file,
  }));
  return <SortableList_3 items={items} />;
}

export async function SortablePostList() {
  const entries = await readdir("./public/", { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory());
  const items = dirs.map((dir) => ({
    id: dir.name,
    searchText: dir.name.replaceAll("-", " "),
    content: <PostPreview_3 slug={dir.name} />,
  }));
  return (
    <div className="mb-8 flex h-72 flex-col gap-2 overflow-scroll font-sans">
      <SortableList_4 items={items} />
    </div>
  );
}
