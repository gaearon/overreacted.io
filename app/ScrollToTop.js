"use client";

import { useState, useEffect } from "react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const scrollHandler = () => {
    if (window.scrollY > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    window.addEventListener('scroll', scrollHandler)
    return () => {
      window.removeEventListener('scroll', scrollHandler)
    }
  }, [])
  
  return (
    <button
      type="button"
      aria-label="Scroll to top"
      className={`fixed bottom-4 right-4 w-8 h-8 shadow-lg rounded-full bg-gray-800 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100 transition-transform active:scale-80 cursor-pointer select-none ${isVisible ? '' : 'hidden'}`}
      onClick={scrollToTop}
    >
      ↑
    </button>
  );
}
