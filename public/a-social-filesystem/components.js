"use client";

import { useEffect, useRef, useState } from "react";

export function RecentPlays() {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [plays, setPlays] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | error
  const wsRef = useRef(null);

  // Intersection Observer to toggle visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "2500px 0px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // WebSocket connection when visible
  useEffect(() => {
    if (!isVisible) return;

    setStatus("connecting");

    const url =
      "wss://jetstream1.us-east.bsky.network/subscribe?wantedCollections=fm.teal.alpha.feed.play";
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.kind === "commit" &&
          data.commit?.operation === "create" &&
          data.commit?.record
        ) {
          const record = data.commit.record;
          const play = {
            id: `${data.did}/${data.commit.rkey}`,
            trackName: record.trackName || "Unknown",
            artistNames: record.artists?.map((a) => a.artistName) ||
              record.artistNames || ["Unknown artist"],
            did: data.did,
            rkey: data.commit.rkey,
          };
          setPlays((prev) => [play, ...prev].slice(0, 5));
        }
      } catch (e) {
        console.error("Failed to parse event:", e);
      }
    };

    ws.onerror = () => {
      setStatus("error");
    };

    ws.onclose = () => {
      if (status !== "error") {
        setStatus("idle");
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [isVisible]);

  return (
    <div ref={containerRef} className="my-6" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
      <p className="mb-3 flex items-center gap-2 text-[--text-secondary]" style={{ marginLeft: '-0.75rem' }}>
        {status === "connecting" && "tuning in..."}
        {status === "connected" && (
          <>
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            live from the atmosphere
          </>
        )}
        {status === "error" && "couldn't connect"}
        {status === "idle" && "waiting to connect"}
      </p>

      {plays.length === 0 ? (
        status === "connected" && (
          <p className="text-[--text-secondary]">listening...</p>
        )
      ) : (
        <ul className="space-y-1 -mx-2">
          {plays.map((play) => (
            <li key={play.id}>
              <a
                href={`https://pdsls.dev/at://${play.did}/fm.teal.alpha.feed.play/${play.rkey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="font-semibold">{play.trackName}</div>
                <div className="text-[--text-secondary]">{play.artistNames.join(", ")}</div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
