import { size, contentType, generateHomeImage } from "../og/generateImage";

export const alt = "Overreacted";
export { size, contentType };

export default async function Image() {
  return generateHomeImage();
}
