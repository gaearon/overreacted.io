"use client";

import { Fragment, useState } from "react";

export function GreetingFrontend({ color }) {
  const [yourName, setYourName] = useState("Alice");
  return (
    <div className="font-sans text-xl">
      <input
        className="border-2 mb-1 p-1 rounded-lg"
        placeholder="What's your name?"
        value={yourName}
        onChange={(e) => setYourName(e.target.value)}
      />
      <p className="font-semibold" style={{ color }}>
        Hello, {yourName}!
      </p>
    </div>
  );
}

export function GreetingFrontend_2({ color }) {
  const [yourName, setYourName] = useState("Alice");
  return (
    <div className="font-sans text-xl">
      <input
        className="border-2 mb-1 p-1 rounded-lg"
        placeholder="What's your name?"
        value={yourName}
        onChange={(e) => setYourName(e.target.value)}
        onFocus={() => {
          document.body.style.backgroundColor = color;
        }}
        onBlur={() => {
          document.body.style.backgroundColor = "";
        }}
      />
      <p className="font-semibold">Hello, {yourName}!</p>
    </div>
  );
}

export function SortableList({ items }) {
  const [isReversed, setIsReversed] = useState(false);
  const sortedItems = isReversed ? items.toReversed() : items;
  return (
    <div className="font-sans text-sm">
      <button
        className="mb-4 font-semibold text-md border-2 px-4 py-2 rounded-md bg-purple-500 hover:opacity-95 hover:scale-105 transform text-white"
        onClick={() => setIsReversed(!isReversed)}
      >
        Flip order
      </button>
      <ul className="ml-4">
        {sortedItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function SortableList_2({ items }) {
  const [isReversed, setIsReversed] = useState(false);
  const [filterText, setFilterText] = useState("");
  let filteredItems = items;
  if (filterText !== "") {
    filteredItems = items.filter((item) =>
      item.toLowerCase().startsWith(filterText.toLowerCase()),
    );
  }
  const sortedItems = isReversed ? filteredItems.toReversed() : filteredItems;
  return (
    <div className="font-sans text-sm">
      <button
        className="mb-4 font-semibold text-md border-2 px-4 py-2 rounded-md bg-purple-500 hover:opacity-95 hover:scale-105 transform text-white"
        onClick={() => setIsReversed(!isReversed)}
      >
        Flip order
      </button>
      <input
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="Search..."
        className="block border-2 px-1 mb-4"
      />
      <ul className="ml-4">
        {sortedItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ExpandingSection({ children }) {
  return <section className="rounded-md bg-black/5 p-2">{children}</section>;
}

export function ExpandingSection_2({ children, extraContent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <section
      className="rounded-md bg-black/5 p-2"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {children}
      {isExpanded && extraContent}
    </section>
  );
}

export function SortableList_3({ items }) {
  const [isReversed, setIsReversed] = useState(false);
  const [filterText, setFilterText] = useState("");
  let filteredItems = items;
  if (filterText !== "") {
    filteredItems = items.filter((item) =>
      item.searchText.toLowerCase().startsWith(filterText.toLowerCase()),
    );
  }
  const sortedItems = isReversed ? filteredItems.toReversed() : filteredItems;
  return (
    <div className="font-sans text-sm">
      <>
        <button
          className="mb-4 font-semibold text-md border-2 px-4 py-2 rounded-md bg-purple-500 hover:opacity-95 hover:scale-105 transform text-white"
          onClick={() => setIsReversed(!isReversed)}
        >
          Flip order
        </button>
        <input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Search..."
          className="block border-2 px-1 mb-4"
        />
      </>
      <ul>
        {sortedItems.map((item) => (
          <li key={item.id}>{item.content}</li>
        ))}
      </ul>
    </div>
  );
}

export function SortableList_4({ items }) {
  const [isReversed, setIsReversed] = useState(false);
  const [filterText, setFilterText] = useState("");
  let filteredItems = items;
  if (filterText !== "") {
    filteredItems = items.filter((item) =>
      item.searchText.toLowerCase().startsWith(filterText.toLowerCase()),
    );
  }
  const sortedItems = isReversed ? filteredItems.toReversed() : filteredItems;
  return (
    <>
      <div className="font-sans text-sm">
        <button
          className="mb-4 font-semibold text-md border-2 px-4 py-2 rounded-md bg-purple-500 hover:opacity-95 hover:scale-105 transform text-white"
          onClick={() => setIsReversed(!isReversed)}
        >
          Flip order
        </button>
        <input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Search..."
          className="block border-2 px-1 mb-4"
        />
      </div>
      <ul className="gap-2 flex flex-col">
        {sortedItems.map((item) => (
          <li key={item.id}>{item.content}</li>
        ))}
      </ul>
    </>
  );
}
