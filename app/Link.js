"use client";

import { useTransition } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

function isModifiedEvent(event) {
  const eventTarget = event.currentTarget;
  const target = eventTarget.getAttribute("target");
  return (
    (target && target !== "_self") ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    (event.nativeEvent && event.nativeEvent.which === 2)
  );
}

export default function Link({
  className,
  children,
  style,
  href,
  target,
  ...rest
}) {
  const router = useRouter();
  const [isNavigating, trackNavigation] = useTransition();
  if (!target && !href.startsWith("/")) {
    target = "_blank";
  }
  return (
    <NextLink
      {...rest}
      target={target}
      href={href}
      onClick={(e) => {
        if (!isModifiedEvent(e)) {
          e.preventDefault();
          trackNavigation(() => {
            router.push(e.currentTarget.href);
          });
        }
      }}
      className={[className, `scale-100 active:scale-100`].join(" ")}
      style={{
        ...style,
        transform: isNavigating ? "scale(1)" : "",
        opacity: isNavigating ? 0.85 : 1,
        transition: "transform 0.2s ease-in-out, opacity 0.2s 0.4s linear",
      }}
    >
      {children}
    </NextLink>
  );
}
