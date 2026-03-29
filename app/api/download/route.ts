import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get("src");
  const title = searchParams.get("title") || "track";

  if (!src) {
    return new Response("Missing src", { status: 400 });
  }

  const bunnyUrl =
    `https://download-proxy-sq00l.bunny.run/` +
    `?src=${encodeURIComponent(src)}` +
    `&title=${encodeURIComponent(title)}`;

  return Response.redirect(bunnyUrl, 302);
}
