
'use client'
export default function CDNImage({ src, alt, ...props }) {
    const isProd = process.env.NODE_ENV === 'production';
    const cdnUrl = 'https://cdn.jsdelivr.net/gh/gaearon/overreacted.io@main/public';
    // Extract the path from the current URL
    const pathname = window.location.pathname; 
    // Extract slug - typically the last part of the path
    const slug = pathname.split('/').filter(Boolean).pop();
    // Construct the final src URL
    const finalSrc = isProd ? `${cdnUrl}/${slug}/${src}` : src;
    console.log(finalSrc);
    return (
        <img src={finalSrc} alt={alt} {...props} />
    )
}
