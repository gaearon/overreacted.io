"use client";

import { sans } from "./fonts";
import { usePathname } from "next/navigation";
import Link from "./Link";

export default function HomeLink() {
  const pathname = usePathname();
  const isActive = pathname === "/";
  return (
    <Link
      href="/"
      className={[
        sans.className,
        "inline-block text-2xl font-black",
        isActive ? "" : "hover:scale-[1.02]",
      ].join(" ")}
    >
      <span
        style={{
          "--myColor1": isActive ? "var(--text)" : "var(--pink)",
          "--myColor2": isActive ? "var(--text)" : "var(--purple)",
          backgroundImage:
            "linear-gradient(45deg, var(--myColor1), var(--myColor2))",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          transition: "--myColor1 0.2s ease-out, --myColor2 0.2s ease-in-out",
        }}
      >
        overreacted
      </span>
    </Link>
  );
}
