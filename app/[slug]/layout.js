"use client";

import { useEffect, useRef } from "react";
import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import HomeLink from "../HomeLink";
import Footer from '../Footer';

export default function Layout({ children, ...props }) {

  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const images = document.querySelectorAll('.markdown img');
    images.forEach((img) => {
      // 为每个img元素添加data-fancybox属性，并设置其值（这里设置为相同的组名"gallery"，可按需修改）
      img.dataset.fancybox = "gallery";
    });

    const delegate = props.delegate || "[data-fancybox]";
    const options = props.options || {};

    NativeFancybox.bind(container, delegate, options);

    return () => {
      NativeFancybox.unbind(container);
      NativeFancybox.close();
    };
  });

  return (
    <>
      <div ref={containerRef}>
        {children}
      </div>
      <footer className="mt-12 flex justify-between">
        <HomeLink />
        <Footer />
      </footer>
    </>
  );
}
