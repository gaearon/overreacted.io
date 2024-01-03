
export default function CDNImage({ src, slug, ...props }) {
    const isProd = process.env.NODE_ENV === 'production';
    const cdnUrl = 'https://cdn.jsdelivr.net/gh/gaearon/overreacted.io@main/public';
    const finalSrc = isProd ? `${cdnUrl}/${slug}/${src}` : src;
    return (
        <img src={finalSrc} {...props} />
    )
}
