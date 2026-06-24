export * from "../react-for-two-computers/components";
export * from "./server";
// Not `export *`: Turbopack builds a non-extensible namespace Proxy when a
// "use client" module is re-exported by star, which then throws on spread
// (...postComponents in app/[slug]/page.tsx). Naming the exports avoids it.
export {
  GreetingFrontend,
  GreetingFrontend_2,
  SortableList,
  SortableList_2,
  ExpandingSection,
  ExpandingSection_2,
  SortableList_3,
  SortableList_4,
} from "./client";
