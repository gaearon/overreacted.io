interface IllustrationProps {
  path: string;
  alt?: string;
}

export default function Illustration({ path, alt }: IllustrationProps) {
  const darkPath = path.replace(/\.svg$/, '.dark.svg');
  
  return (
    <picture>
      <source media="(prefers-color-scheme: dark)" srcSet={darkPath} />
      <img src={path} alt={alt || ''} style={{ maxWidth: '100%', height: 'auto' }} />
    </picture>
  );
}