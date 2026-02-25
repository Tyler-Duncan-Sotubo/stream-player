import PlayerClient from "./PlayerClient";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EmbedPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = (await searchParams) || {};

  const title = typeof sp.title === "string" ? sp.title : "Untitled";
  const artist = typeof sp.artist === "string" ? sp.artist : "";
  const dl = `/api/download/${encodeURIComponent(id)}?title=${encodeURIComponent(title)}`;
  const src = `https://pixeldrain.com/api/file/${encodeURIComponent(id)}`;

  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{`${title} — Player`}</title>
        <style>{`body{margin:0;background:transparent;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial}`}</style>
      </head>
      <body>
        <PlayerClient
          src={src}
          downloadUrl={dl}
          title={title}
          artist={artist}
        />
      </body>
    </html>
  );
}
