import Link from "./Link";

export default function TextLink({
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={[
        "underline decoration-[--link] decoration-1 underline-offset-4 text-[--link]",
        className,
      ].join(" ")}
    />
  );
}
