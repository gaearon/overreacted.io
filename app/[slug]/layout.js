"use client";

import HomeLink from "../HomeLink";
import Footer from '../Footer';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <footer className="mt-12 flex justify-between">
        <HomeLink />
        <Footer />
      </footer>
    </>
  );
}
