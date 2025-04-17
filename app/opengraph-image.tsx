import { size, contentType, generateHomeImage } from "../og/generateImage";

export const dynamic = "force-static";
export const alt = "Overreacted";
export { size, contentType };

export default async function Image() {
  return generateHomeImage();
}
