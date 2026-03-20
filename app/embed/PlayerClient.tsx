/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaDownload } from "react-icons/fa";

function fmt(t: number) {
  if (!isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function PlayerClient({
  src,
  downloadUrl,
  title,
  artist,
  thumb,
}: {
  src: string;
  downloadUrl: string;
  title: string;
  artist: string;
  thumb?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const volRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [cur, setCur] = useState("0:00");
  const [dur, setDur] = useState("0:00");
  const [pct, setPct] = useState(0);
  const [vol, setVol] = useState(0.8);
  const [muted, setMuted] = useState(false);

  const safeTitle = useMemo(() => title || "Untitled", [title]);
  const safeArtist = useMemo(() => artist || "", [artist]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onLoaded = () => setDur(fmt(a.duration));
    const onTime = () => {
      setCur(fmt(a.currentTime));
      setPct((a.currentTime / a.duration) * 100 || 0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);

    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, [src]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = muted ? 0 : vol;
  }, [vol, muted]);

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      if (a.paused) await a.play();
      else a.pause();
    } catch {}
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    const bar = trackRef.current;
    if (!a || !bar || !isFinite(a.duration)) return;
    const r = bar.getBoundingClientRect();
    a.currentTime =
      (Math.min(Math.max(0, e.clientX - r.left), r.width) / r.width) *
      a.duration;
  };

  const seekVol = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = volRef.current;
    if (!bar) return;
    const r = bar.getBoundingClientRect();
    const v = Math.min(Math.max(0, e.clientX - r.left), r.width) / r.width;
    setVol(v);
    setMuted(false);
  };

  const toggleMute = () => setMuted((m) => !m);

  const volPct = (muted ? 0 : vol) * 100;

  return (
    <div
      style={{
        width: "100%",
        background: "#111",
        fontFamily: "sans-serif",
        boxSizing: "border-box",
        borderTop: "1px solid #222",
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Mobile progress bar — top border style */}
      <div
        onClick={seek}
        style={{
          height: "3px",
          background: "#2a2a2a",
          cursor: "pointer",
          display: "block",
        }}
        className="sm:hidden"
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "#fff",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Main row */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          height: "72px",
        }}
      >
        {/* Controls — left */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "0 20px",
            borderRight: "1px solid #222",
            flexShrink: 0,
          }}
        >
          {/* Prev */}
          <button
            onClick={() => {
              const a = audioRef.current;
              if (a) {
                a.currentTime = 0;
              }
            }}
            aria-label="Restart"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              opacity: 0.5,
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#fff">
              <polygon points="14,2 4,8 14,14" />
              <rect x="2" y="2" width="2" height="12" fill="#fff" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            aria-label="Play/Pause"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {isPlaying ? (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="#111">
                <rect x="0" y="0" width="4" height="13" />
                <rect x="8" y="0" width="4" height="13" />
              </svg>
            ) : (
              <svg width="13" height="15" viewBox="0 0 13 15" fill="#111">
                <polygon points="0,0 13,7.5 0,15" />
              </svg>
            )}
          </button>

          {/* Next / Download on mobile */}
          <a
            href={`/api/download?src=${encodeURIComponent(downloadUrl)}&title=${encodeURIComponent(safeTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              opacity: 0.5,
              display: "flex",
              alignItems: "center",
              color: "#fff",
            }}
          >
            <FaDownload size={14} />
          </a>
        </div>

        {/* Middle — image + meta */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            flex: 1,
            minWidth: 0,
            borderRight: "1px solid #222",
          }}
        >
          {/* Thumbnail */}
          {thumb ? (
            <img
              src={thumb}
              alt={safeTitle}
              style={{
                width: "72px",
                height: "100%",
                objectFit: "cover",
                flexShrink: 0,
                display: "block",
                background: "#222",
              }}
            />
          ) : (
            <div
              style={{
                width: "72px",
                height: "100%",
                flexShrink: 0,
                background: "#222",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#444">
                <path d="M12 3a9 9 0 100 18A9 9 0 0012 3zm0 2a7 7 0 110 14A7 7 0 0112 5zm0 3a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z" />
              </svg>
            </div>
          )}

          {/* Meta */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              padding: "0 16px",
            }}
          >
            {/* Top row — title, artist, time */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                minWidth: 0,
                borderBottom: "1px solid #1a1a1a",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                  minWidth: 0,
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flexShrink: 1,
                    minWidth: 0,
                  }}
                >
                  {safeTitle}
                </span>
                <span
                  style={{
                    color: "#888",
                    fontSize: "11px",
                    margin: 0,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {safeArtist}
                </span>
              </div>
              <span
                style={{
                  color: "#aaa",
                  fontSize: "12px",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {cur} / {dur}
              </span>
            </div>

            {/* Bottom row — progress bar */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
              }}
              className="hidden sm:flex"
            >
              <div
                ref={trackRef}
                onClick={seek}
                style={{
                  height: "3px",
                  background: "#2a2a2a",
                  borderRadius: "2px",
                  cursor: "pointer",
                  width: "100%",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "#fff",
                    borderRadius: "2px",
                    width: `${pct}%`,
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Volume — desktop only */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "0 18px",
            flexShrink: 0,
          }}
          className="hidden sm:flex"
        >
          <div
            onClick={toggleMute}
            style={{ cursor: "pointer", opacity: 0.7, flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 5.5H4.5L7.5 3V13L4.5 10.5H2V5.5Z" fill="#888" />
              {!muted && (
                <>
                  <path
                    d="M10 6C10.9 6.9 11.4 7.4 11.4 8C11.4 8.6 10.9 9.1 10 10"
                    stroke="#888"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 4C13.7 5.5 14.5 6.7 14.5 8C14.5 9.3 13.7 10.5 12 12"
                    stroke="#888"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </>
              )}
              {muted && (
                <path
                  d="M10 6L14 10M14 6L10 10"
                  stroke="#888"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>
          <div
            ref={volRef}
            onClick={seekVol}
            style={{
              width: "72px",
              height: "3px",
              background: "#2a2a2a",
              borderRadius: "2px",
              position: "relative",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "#888",
                borderRadius: "2px",
                width: `${volPct}%`,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: `${volPct}%`,
                transform: "translate(-50%, -50%)",
                width: "11px",
                height: "11px",
                background: "#fff",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Download — desktop */}
        <a
          href={`/api/download?src=${encodeURIComponent(downloadUrl)}&title=${encodeURIComponent(safeTitle)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 16px",
            color: "#444",
            flexShrink: 0,
            textDecoration: "none",
          }}
          className="hidden sm:flex"
        >
          <FaDownload size={14} />
        </a>
      </div>
    </div>
  );
}
