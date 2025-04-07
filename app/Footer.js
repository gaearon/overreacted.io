"use client";
import { Rss } from 'lucide-react';
import { SiGithub, SiDevdotto } from '@icons-pack/react-simple-icons';

import { sans } from "./fonts";
import Link from "./Link";

export default function Footer() {
  return (
    <div className="flex space-x-2">
      <Link
        href="https://weekly.zisheng.pro/rss.xml"
        className={[
          sans.className,
          "inline-block text-2xl font-black",
          "hover:scale-[1.02]",
        ].join(" ")}
      >
        <Rss />
      </Link>
      <Link
        href="https://dev.to/vibeweekly"
        className={[
          sans.className,
          "inline-block text-2xl font-black",
          "hover:scale-[1.02]",
        ].join(" ")}
      >
        <SiDevdotto />
      </Link>
      <Link
        href="https://github.com/youngjuning/weekly"
        className={[
        sans.className,
        "inline-block text-2xl font-black",
        "hover:scale-[1.02]",
        ].join(" ")}
      >
        <SiGithub />
      </Link>
    </div>
  );
}
