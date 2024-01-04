"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button
      className="dark:color-white rounded-lg bg-purple-700 px-2 py-1 font-sans font-semibold text-white focus:ring active:bg-purple-600"
      onClick={() => setCount(count + 1)}
    >
      You clicked me {count} times
    </button>
  );
}
