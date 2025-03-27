"use client";

import { useEffect } from "react";
import Script from "next/script";

import HomeLink from "../HomeLink";
import Footer from '../Footer';

export default function Layout({ children }) {

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement({ pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false }, 'google_translate_element');
    };
  }, []);

  return (
    <>
      <head>
        {/* Google Translate */}
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />

        {/* Google Translate CSS */}
        <link
        rel="stylesheet"
        type="text/css"
        href="https://www.gstatic.com/_/translate_http/_/ss/k=translate_http.tr.26tY-h6gH9w.L.W.O/am=CAM/d=0/rs=AN8SPfpIXxhebB2A47D9J-MACsXmFF6Vew/m=el_main_css"
        />
      </head>
      {children}
      <footer className="mt-12 flex justify-between">
        <HomeLink />
        <Footer />
      </footer>
    </>
  );
}
