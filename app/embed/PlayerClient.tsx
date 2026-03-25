/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IoMdDownload } from "react-icons/io";

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
  const [dragging, setDragging] = useState(false);

  const safeTitle = useMemo(() => title || "Untitled", [title]);
  const safeArtist = useMemo(() => artist || "", [artist]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onLoaded = () => setDur(fmt(a.duration));
    const onTime = () => {
      if (!dragging) {
        setCur(fmt(a.currentTime));
        setPct((a.currentTime / a.duration) * 100 || 0);
      }
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
  }, [src, dragging]);

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

  const getPct = (e: React.MouseEvent<HTMLDivElement>, el: HTMLDivElement) => {
    const r = el.getBoundingClientRect();
    return Math.min(Math.max(0, e.clientX - r.left), r.width) / r.width;
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    const bar = trackRef.current;
    if (!a || !bar || !isFinite(a.duration)) return;
    const p = getPct(e, bar);
    a.currentTime = p * a.duration;
    setPct(p * 100);
  };

  const seekVol = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = volRef.current;
    if (!bar) return;
    setVol(getPct(e, bar));
    setMuted(false);
  };

  const volPct = (muted ? 0 : vol) * 100;

  const restart = () => {
    const a = audioRef.current;
    if (a) {
      a.currentTime = 0;
      if (!isPlaying) a.play();
    }
  };

  const skip = (secs: number) => {
    const a = audioRef.current;
    if (a && isFinite(a.duration)) {
      a.currentTime = Math.min(Math.max(0, a.currentTime + secs), a.duration);
    }
  };

  // Add this handler inside the component, before the return:
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    // 1. Trigger the proxied download
    const dlLink = document.createElement("a");
    dlLink.href = `/api/download?src=${encodeURIComponent(downloadUrl)}&title=${encodeURIComponent(safeTitle)}`;
    dlLink.setAttribute("download", "");
    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
    // 2. Open the ad in a new tab
    window.open("https://omg10.com/4/7803371", "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{
        width: "100%",
        background: "#161616",
        borderRadius: "12px",
        border: "1px solid #2a2a2a",
        overflow: "hidden",
        fontFamily: "system-ui,-apple-system,sans-serif",
        boxSizing: "border-box",
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <div style={{ display: "flex", alignItems: "stretch" }}>
        {/* Album art */}
        <div
          style={{
            width: "140px",
            minHeight: "140px",
            flexShrink: 0,
            background: "#222",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {thumb ? (
            <img
              src={thumb}
              alt={safeTitle}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "140px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#555">
                  <path d="M12 3a9 9 0 100 18A9 9 0 0012 3zm0 2a7 7 0 110 14A7 7 0 0112 5zm0 3a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: "18px 20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Title + artist + download */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  color: "#fff",
                  fontSize: "17px",
                  fontWeight: 700,
                  margin: "0 0 4px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.2,
                }}
              >
                {safeTitle}
              </p>
              <p
                style={{
                  color: "#888",
                  fontSize: "13px",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {safeArtist}
              </p>
            </div>
            <button
              onClick={handleDownload}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "20px",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <IoMdDownload
                size={35}
                className=" hover:text-white text-gray-500"
              />
            </button>
          </div>

          {/* Progress */}
          <div>
            <div
              ref={trackRef}
              onClick={seek}
              style={{
                height: "4px",
                background: "#2a2a2a",
                borderRadius: "2px",
                cursor: "pointer",
                position: "relative",
                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: "#fff",
                  borderRadius: "2px",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${pct}%`,
                  transform: "translate(-50%, -50%)",
                  width: "12px",
                  height: "12px",
                  background: "#fff",
                  borderRadius: "50%",
                  pointerEvents: "none",
                  boxShadow: "0 0 4px rgba(0,0,0,0.5)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "11px", color: "#555" }}>{cur}</span>
              <span style={{ fontSize: "11px", color: "#555" }}>{dur}</span>
            </div>
          </div>

          {/* Controls row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Volume */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flex: 1,
              }}
            >
              <div
                onClick={() => setMuted((m) => !m)}
                style={{ cursor: "pointer", flexShrink: 0, opacity: 0.7 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 5.5H4.5L7.5 3V13L4.5 10.5H2V5.5Z" fill="#888" />
                  {!muted ? (
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
                  ) : (
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
                  width: "70px",
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
                    width: `${volPct}%`,
                    background: "#555",
                    borderRadius: "2px",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${volPct}%`,
                    transform: "translate(-50%,-50%)",
                    width: "9px",
                    height: "9px",
                    background: "#888",
                    borderRadius: "50%",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* Playback controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flex: 1,
                justifyContent: "center",
              }}
            >
              {/* -15s */}
              <button
                onClick={() => skip(-15)}
                title="Back 15s"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  opacity: 0.5,
                  color: "#fff",
                  fontSize: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1px",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="#fff">
                  <path
                    d="M9 2C5.13 2 2 5.13 2 9s3.13 7 7 7 7-3.13 7-7"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M9 2L6 5M9 2l3 3"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span style={{ fontSize: "9px", color: "#666" }}>15</span>
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                aria-label="Play/Pause"
                style={{
                  width: "44px",
                  height: "44px",
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
                  <svg width="14" height="14" viewBox="0 0 13 13" fill="#111">
                    <rect x="0" y="0" width="4" height="13" />
                    <rect x="8" y="0" width="4" height="13" />
                  </svg>
                ) : (
                  <svg width="14" height="16" viewBox="0 0 13 15" fill="#111">
                    <polygon points="0,0 13,7.5 0,15" />
                  </svg>
                )}
              </button>

              {/* +15s */}
              <button
                onClick={() => skip(15)}
                title="Forward 15s"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  opacity: 0.5,
                  color: "#fff",
                  fontSize: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1px",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="#fff">
                  <path
                    d="M9 2C12.87 2 16 5.13 16 9s-3.13 7-7 7-7-3.13-7-7"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M9 2l3 3M9 2L6 5"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span style={{ fontSize: "9px", color: "#666" }}>15</span>
              </button>
            </div>

            {/* Restart — right side balance */}
            <div
              style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}
            >
              <button
                onClick={restart}
                title="Restart"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  opacity: 0.4,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 8a6 6 0 106-6H5"
                    stroke="#fff"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3 5l2-3-3-.5"
                    stroke="#fff"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
