"use client"
import { useEffect, useState } from "react";

export function VideoAsGif(props) {
    const [mounted, setMounted] = useState(false)
    useEffect(()=>{
        setMounted(true)
    }, [])

    if(!mounted){
        return null
    }
return <video className="mb-5" muted autoPlay loop playsInline aria-label={props.ariaLabel}><source src={props.src} type="video/mp4"/></video>

}
