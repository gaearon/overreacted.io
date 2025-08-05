import PlausibleProvider from "next-plausible";
import Link from "./Link";
import HomeLink from "./HomeLink";
import { serif } from "./fonts";
import "./global.css";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import ProgressBars from "./components/ProgressBars";

export const metadata = {
  metadataBase: new URL("https://ozipi.dev"),
};

const Activity = Symbol.for("react.activity");

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={serif.className}>
      <body className="mx-auto max-w-6xl bg-[--bg] px-5 py-12 text-[--text]">
        <PlausibleProvider domain="ozipi.dev">
          <header className="mb-14 flex flex-row place-content-between">
            <HomeLink />
            <span className="relative top-[4px] italic flex items-center gap-4">
              <Link
                href="https://github.com/ozipi"
                target="_blank"
                className="text-[--text] hover:text-gray-600"
              >
                <FaGithub size={30} />
              </Link>
              <Link
                href="https://linkedin.com/in/ozipi"
                target="_blank"
                className="text-[--text] hover:text-gray-600"
              >
                <FaLinkedin size={30} />
              </Link>
              <Link href="https://ozipi.dev" target="_blank">
                <img
                  alt="Oscar"
                  src="/ozipi.jpg"
                  className="relative mx-1 inline h-8 w-8 rounded-full"
                />
              </Link>
            </span>
          </header>
          <div className="mb-8">
            
          </div>
          <main>
            <Activity mode="visible">{children}</Activity>
          </main>
        </PlausibleProvider>
      </body>
    </html>
  );
}
