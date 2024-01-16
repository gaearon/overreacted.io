"use client"
import { useEffect, useState } from "react";

export function VideoAsGif(src, ariaLabel) {
    const [mounted, setMounted] = useState(false)
    useEffect(()=>{
        setMounted(true)
    }, [])

    if(!mounted){
        return null
    }
return <video class="mb-5" muted autoPlay loop playsInline aria-label={ariaLabel}><source src={src} type="video/webm"/></video>

}
