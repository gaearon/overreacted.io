import HomeLink from "../HomeLink";

export default function Layout({ children }) {
  return (
    <>
      {children}
      <footer className="mt-12">
        <HomeLink />
      </footer>
    </>
  );
}
