export default function LazyLoadVideo() {
    return (
      <Script id="show-banner" strategy="afterInteractive">
        {`!function(){var e=[].slice.call(document.querySelectorAll("video.lazy"));if("IntersectionObserver"in window){var r=new IntersectionObserver(function(e,t){e.forEach(function(e){if(e.isIntersecting){for(var t in e.target.children){var a=e.target.children[t];"string"==typeof a.tagName&&"SOURCE"===a.tagName&&(a.src=a.dataset.src)}e.target.load(),e.target.classList.remove("lazy"),r.unobserve(e.target)}})});e.forEach(function(e){r.observe(e)})}}();`}
      </Script>
    );
  }