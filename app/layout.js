import PlausibleProvider from "next-plausible";
import Link from "./Link";
import HomeLink from "./HomeLink";
import { serif } from "./fonts";
import "./global.css";

export const metadata = {
  metadataBase: new URL("https://overreacted.io"),
};

const Activity = Symbol.for("react.activity");

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={serif.className}>
      <body className="mx-auto max-w-2xl bg-[--bg] px-5 py-12 text-[--text]">
        <PlausibleProvider domain="overreacted.io">
          <header className="mb-14 flex flex-row place-content-between">
            <HomeLink />
            <span className="relative top-[4px] italic">
              by{" "}
              <Link href="https://danabra.mov" target="_blank">
                <img
                  alt="Dan Abramov"
                  src="/avi.jpg"
                  className="relative -top-1 mx-1 inline h-8 w-8 rounded-full"
                />
              </Link>
            </span>
          </header>
          <main>
            <Activity mode="visible">{children}</Activity>
          </main>
        </PlausibleProvider>
      </body>
    </html>
  );
}
