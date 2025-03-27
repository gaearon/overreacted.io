"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import Script from "next/script";
import Link from "./Link";
import HomeLink from "./HomeLink";
import Footer from './Footer';
import AutoRefresh from "./AutoRefresh";
import { serif } from "./fonts";
import "./global.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isActive = pathname === "/";

  return (
    <AutoRefresh>
      <html lang="en" className={serif.className}>
        <body className="mx-auto max-w-2xl bg-[--bg] px-5 py-12 text-[--text]">
          <header className="mb-14 flex flex-row place-content-between">
            <HomeLink />
            <span className="relative top-[4px] italic">
              by{" "}
              <Link href="https://zisheng.pro" target="_blank">
                <img
                  alt="Aaron Young"
                  src="https://github.com/youngjuning.png"
                  className="relative -top-1 mx-1 inline h-8 w-8 rounded-full"
                />
              </Link>
            </span>
          </header>
          <main>{children}</main>
          <footer className="flex justify-center">
            {isActive ? <Footer /> : null}
          </footer>
        </body>
      </html>
    </AutoRefresh>
  );
}
