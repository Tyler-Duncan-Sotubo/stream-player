"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaPause, FaPlay, FaDownload, FaVolumeUp } from "react-icons/fa";

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
}: {
  src: string;
  downloadUrl: string;
  title: string;
  artist: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [cur, setCur] = useState("0:00");
  const [dur, setDur] = useState("0:00");
  const [pct, setPct] = useState(0);
  const [vol, setVol] = useState(1);

  const safeTitle = useMemo(() => title || "Untitled", [title]);
  const safeArtist = useMemo(() => artist || "", [artist]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onLoaded = () => setDur(fmt(a.duration));
    const onTime = () => {
      setCur(fmt(a.currentTime));
      const p = (a.currentTime / a.duration) * 100 || 0;
      setPct(p);
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
    if (a) a.volume = vol;
  }, [vol]);

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      if (a.paused) await a.play();
      else a.pause();
    } catch {
      // autoplay restrictions etc.
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    const bar = progRef.current;
    if (!a || !bar || !isFinite(a.duration)) return;

    const r = bar.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - r.left), r.width);
    a.currentTime = (x / r.width) * a.duration;
  };

  return (
    <div className="w-full max-w-225 border border-white/10 bg-black px-5 py-4 text-white shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-4">
        <audio ref={audioRef} src={src} preload="metadata" />

        {/* Play/Pause */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play/Pause"
          className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white text-black transition hover:scale-105 active:scale-95"
        >
          {isPlaying ? (
            <FaPause className="text-[18px]" />
          ) : (
            <FaPlay className="ml-0.5 text-[18px]" />
          )}
        </button>

        {/* Meta + Progress */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-col">
            <div
              className="truncate text-[16px] font-semibold leading-tight text-white"
              title={safeTitle}
            >
              {safeTitle}
            </div>
            <div
              className="truncate text-[13px] text-white/60"
              title={safeArtist}
            >
              {safeArtist}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-10 text-center text-[12px] text-white/50">
              {cur}
            </span>

            <div
              ref={progRef}
              onClick={seek}
              aria-label="Seek"
              className="group relative h-2 flex-1 cursor-pointer rounded-full bg-white/20"
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-white"
                style={{ width: `${pct}%` }}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-lg opacity-0 transition-opacity group-hover:opacity-100"
                style={{ left: `${pct}%`, transform: "translate(-50%, -50%)" }}
              />
            </div>

            <span className="w-10 text-center text-[12px] text-white/50">
              {dur}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden items-center gap-2 sm:flex">
          <FaVolumeUp className="text-[14px] text-white/60" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={vol}
            onChange={(e) => setVol(parseFloat(e.target.value))}
            aria-label="Volume"
            className="w-24 accent-white"
          />
        </div>

        {/* Download */}
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white text-black transition hover:scale-105 active:scale-95"
        >
          <FaDownload className="text-[16px]" />
        </a>
      </div>
    </div>
  );
}
