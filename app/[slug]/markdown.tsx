"use client";

export function P(props: React.ComponentProps<"p">) {
  return <p {...props} />;
}

export function H2({ id, children, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      id={id}
      className="group relative text-3xl font-bold mt-2"
      {...props}
    >
      <a href={`#${id}`} className="no-underline text-inherit">
        <span
          aria-hidden
          className="absolute -translate-x-[1em] opacity-0 group-hover:opacity-70 group-focus-within:opacity-70 group-[:target]:opacity-70"
        >
          #
        </span>
        {children}
      </a>
    </h2>
  );
}

export function H3({ id, children, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      id={id}
      className="group relative text-2xl font-bold mt-2"
      {...props}
    >
      <a href={`#${id}`} className="no-underline text-inherit">
        <span
          aria-hidden
          className="absolute -translate-x-[1em] opacity-0 group-hover:opacity-70 group-focus-within:opacity-70 group-[:target]:opacity-70"
        >
          #
        </span>
        {children}
      </a>
    </h3>
  );
}

export function H4({ id, children, ...props }: React.ComponentProps<"h4">) {
  return (
    <h4
      id={id}
      className="group relative text-xl font-bold mt-2"
      {...props}
    >
      <a href={`#${id}`} className="no-underline text-inherit">
        <span
          aria-hidden
          className="absolute -translate-x-[1em] opacity-0 group-hover:opacity-70 group-focus-within:opacity-70 group-[:target]:opacity-70"
        >
          #
        </span>
        {children}
      </a>
    </h4>
  );
}

export function Blockquote(props: React.ComponentProps<"blockquote">) {
  return (
    <blockquote
      className="relative -left-2 -ml-4 pl-4 italic opacity-80 border-l-[3px] border-current"
      {...props}
    />
  );
}

export function UL(props: React.ComponentProps<"ul">) {
  return <ul className="list-inside md:list-outside list-disc" {...props} />;
}

export function OL(props: React.ComponentProps<"ol">) {
  return (
    <ol className="list-inside md:list-outside list-decimal" {...props} />
  );
}

export function LI(props: React.ComponentProps<"li">) {
  return <li className="mb-3 last:mb-0" {...props} />;
}

export function Pre({
  style,
  ...props
}: React.ComponentProps<"pre">) {
  return (
    <pre
      className="-mx-4 overflow-y-auto p-4 text-sm"
      {...props}
      style={{
        ...style,
        clipPath: "var(--path, none)",
        borderTopLeftRadius: "var(--radius-top, 12px)",
        borderTopRightRadius: "var(--radius-top, 12px)",
        borderBottomLeftRadius: "var(--radius-bottom, 12px)",
        borderBottomRightRadius: "var(--radius-bottom, 12px)",
        paddingTop: "var(--padding-top, 1rem)",
        paddingBottom: "var(--padding-bottom, 1rem)",
      }}
    />
  );
}

export function Code({
  className,
  ...props
}: React.ComponentProps<"code"> & { "data-language"?: string }) {
  // Code blocks have data-language from rehype-pretty-code (defaultLang ensures all blocks have it)
  if ("data-language" in props) {
    return <code className={className} {...props} />;
  }
  // Inline code styling
  return (
    <code
      className="rounded-[10px] bg-[--inlineCode-bg] text-[--inlineCode-text] px-[0.2em] py-[0.15em] whitespace-normal"
      {...props}
    />
  );
}

export function Table(props: React.ComponentProps<"table">) {
  return <table className="w-full border-collapse" {...props} />;
}

export function Th(props: React.ComponentProps<"th">) {
  return (
    <th
      className="border border-gray-300 dark:border-gray-600 p-2 text-left"
      {...props}
    />
  );
}

export function Td(props: React.ComponentProps<"td">) {
  return (
    <td
      className="border border-gray-300 dark:border-gray-600 p-2 text-left"
      {...props}
    />
  );
}

export function Hr(props: React.ComponentProps<"hr">) {
  return <hr className="opacity-60 dark:opacity-10 mt-4" {...props} />;
}

export function Img(props: React.ComponentProps<"img">) {
  return <img className="max-w-full" {...props} />;
}

export function A(props: React.ComponentProps<"a">) {
  return (
    <a
      className="border-b border-[--link] text-[--link]"
      {...props}
    />
  );
}
