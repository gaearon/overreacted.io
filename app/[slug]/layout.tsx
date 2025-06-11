import HomeLink from "../HomeLink";

export default function Layout({ children }: any) {
  return (
    <>
      {children}
      <footer className="mt-12">
        <HomeLink />
      </footer>
    </>
  );
}
