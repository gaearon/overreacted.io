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
return <video className="mb-5" muted autoPlay loop playsInline aria-label={ariaLabel}><source src={src} type="video/mp4"/>Your browser does not support the video tag</video>

}