"use client"
import { useEffect, useState } from "react";

export function VideoAsGif(props) {
    const {src, ariaLabel} = props
    const [mounted, setMounted] = useState(false)
    useEffect(()=>{
        setMounted(true)
    }, [])

    if(!mounted){
        return null
    }
return <video className="mb-5" src={src} muted autoPlay loop playsInline preload="auto" aria-label={ariaLabel}></video>

}
