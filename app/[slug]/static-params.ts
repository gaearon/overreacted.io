import { readdir } from "fs/promises";

export async function getPostDirs() {
  const entries = await readdir("./public/", { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}
