import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get("src") || "";

  if (!src) {
    return new Response("Missing src", { status: 400 });
  }

  // Just redirect directly to the source MP3
  return Response.redirect(src, 302);
}
