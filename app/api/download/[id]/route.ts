import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const { searchParams } = new URL(req.url);
  const rawTitle = searchParams.get("title") || id;

  // Clean filename (remove weird characters)
  const safeTitle = rawTitle.replace(/[^a-z0-9_\- ]/gi, "").trim();

  const upstream = await fetch(
    `https://pixeldrain.com/api/file/${encodeURIComponent(id)}`,
  );

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
