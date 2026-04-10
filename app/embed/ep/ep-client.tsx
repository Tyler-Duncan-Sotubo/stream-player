/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { IoMdDownload } from "react-icons/io";

function fmt(t: number) {
  if (!isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Track = {
  src: string;
  title: string;
  artist?: string;
  thumb?: string;
};

export default function EPClient({
  epTitle,
  epArtist,
  epThumb,
  tracks,
  showDownload = true,
}: {
  epTitle: string;
  epArtist?: string;
  epThumb?: string;
  tracks: Track[];
  showDownload?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const volRef = useRef<HTMLDivElement | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cur, setCur] = useState("0:00");
  const [dur, setDur] = useState("0:00");
  const [pct, setPct] = useState(0);
  const [vol, setVol] = useState(0.8);
  const [muted, setMuted] = useState(false);

  const active = tracks[activeIndex];

  // Re-attach listeners whenever src changes
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    setCur("0:00");
    setPct(0);
    setDur("0:00");

    const onLoaded = () => setDur(fmt(a.duration));
    const onTime = () => {
      setCur(fmt(a.currentTime));
      setPct((a.currentTime / a.duration) * 100 || 0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () =>
      setActiveIndex((i) => Math.min(i + 1, tracks.length - 1));

    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
    };
  }, [active.src, tracks.length]);

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

  const selectTrack = (i: number) => {
    setActiveIndex(i);
    // Small delay so the audio element src updates before play
    setTimeout(() => {
      audioRef.current?.play().catch(() => {});
    }, 50);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    const bar = trackRef.current;
    if (!a || !bar || !isFinite(a.duration)) return;
    const r = bar.getBoundingClientRect();
    const p = Math.min(Math.max(0, e.clientX - r.left), r.width) / r.width;
    a.currentTime = p * a.duration;
    setPct(p * 100);
  };

  const seekVol = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = volRef.current;
    if (!bar) return;
    const r = bar.getBoundingClientRect();
    setVol(Math.min(Math.max(0, e.clientX - r.left), r.width) / r.width);
    setMuted(false);
  };

  const skip = (secs: number) => {
    const a = audioRef.current;
    if (a && isFinite(a.duration))
      a.currentTime = Math.min(Math.max(0, a.currentTime + secs), a.duration);
  };

  const volPct = (muted ? 0 : vol) * 100;

  const handleDownload = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    const dlLink = document.createElement("a");
    dlLink.href = `/api/download?src=${encodeURIComponent(track.src)}&title=${encodeURIComponent(track.title)}`;
    dlLink.setAttribute("download", "");
    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
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
      <audio
        key={active.src}
        ref={audioRef}
        src={active.src}
        preload="metadata"
      />

      {/* ── EP Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "16px 16px 14px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            flexShrink: 0,
            borderRadius: "8px",
            overflow: "hidden",
            background: "#222",
          }}
        >
          {epThumb ? (
            <img
              src={epThumb}
              alt={epTitle}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
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
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              color: "#fff",
              fontSize: "16px",
              fontWeight: 700,
              margin: "0 0 4px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {epTitle}
          </p>
          {epArtist && (
            <p
              style={{
                color: "#777",
                fontSize: "13px",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {epArtist}
            </p>
          )}
          <p style={{ color: "#444", fontSize: "11px", margin: "4px 0 0" }}>
            {tracks.length} track{tracks.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Playback Controls ── */}
      <div style={{ padding: "0 16px 14px", borderBottom: "1px solid #222" }}>
        {/* Now playing label */}
        <p
          style={{
            color: "#555",
            fontSize: "11px",
            margin: "0 0 6px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Now playing · {active.title}
        </p>

        {/* Progress bar */}
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
              transform: "translate(-50%,-50%)",
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
            marginBottom: "10px",
          }}
        >
          <span style={{ fontSize: "11px", color: "#555" }}>{cur}</span>
          <span style={{ fontSize: "11px", color: "#555" }}>{dur}</span>
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
              style={{ cursor: "pointer", opacity: 0.7 }}
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

          {/* Play controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => skip(-15)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                opacity: 0.5,
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

            <button
              onClick={togglePlay}
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

            <button
              onClick={() => skip(15)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                opacity: 0.5,
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

          <div style={{ flex: 1 }} />
        </div>
      </div>

      {/* ── Track List ── */}
      <div>
        {tracks.map((track, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={track.src}
              onClick={() => selectTrack(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 16px",
                cursor: "pointer",
                borderBottom:
                  i < tracks.length - 1 ? "1px solid #1e1e1e" : "none",
                background: isActive ? "#1f1f1f" : "transparent",
                borderLeft: isActive
                  ? "2px solid #fff"
                  : "2px solid transparent",
              }}
            >
              {/* Index or playing indicator */}
              <div
                style={{ width: "18px", textAlign: "center", flexShrink: 0 }}
              >
                {isActive && isPlaying ? (
                  <PlayingBars />
                ) : (
                  <span
                    style={{
                      fontSize: "12px",
                      color: isActive ? "#fff" : "#555",
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: isActive ? "#fff" : "#888",
                    fontWeight: isActive ? 600 : 400,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {track.title}
                </p>
                {track.artist && track.artist !== epArtist && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      color: "#555",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {track.artist}
                  </p>
                )}
              </div>

              {/* Download */}
              {showDownload && (
                <button
                  onClick={(e) => handleDownload(e, track)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <IoMdDownload
                    size={20}
                    color="#444"
                    style={{ display: "block" }}
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlayingBars() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12">
      <style>{`
        @keyframes b1{0%,100%{height:4px;y:8px}50%{height:12px;y:0px}}
        @keyframes b2{0%,100%{height:8px;y:4px}50%{height:4px;y:8px}}
        @keyframes b3{0%,100%{height:12px;y:0}50%{height:6px;y:6px}}
        .b1{animation:b1 0.8s ease-in-out infinite}
        .b2{animation:b2 0.8s ease-in-out infinite 0.15s}
        .b3{animation:b3 0.8s ease-in-out infinite 0.3s}
      `}</style>
      <rect className="b1" x="0" width="3" rx="1" fill="#fff" />
      <rect className="b2" x="5" width="3" rx="1" fill="#fff" />
      <rect className="b3" x="10" width="3" rx="1" fill="#fff" />
    </svg>
  );
}
