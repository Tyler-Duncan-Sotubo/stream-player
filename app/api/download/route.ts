import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get("src") || "";
  const rawTitle = searchParams.get("title") || "track";

  if (!src) {
    return new Response("Missing src", { status: 400 });
  }

  const safeTitle = rawTitle.replace(/[^a-z0-9_\- ]/gi, "").trim();

  const upstream = await fetch(src);

  if (!upstream.ok) {
    return new Response("File not found", { status: 404 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "audio/mpeg",
      "Content-Disposition": `attachment; filename="${safeTitle}.mp3"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
