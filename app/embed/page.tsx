import PlayerClient from "./PlayerClient";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EmbedPage({ searchParams }: Props) {
  const sp = (await searchParams) || {};

  const title = typeof sp.title === "string" ? sp.title : "Untitled";
  const artist = typeof sp.artist === "string" ? sp.artist : "";
  const src = typeof sp.src === "string" ? sp.src : "";
  const thumb = typeof sp.thumb === "string" ? sp.thumb : "";
  const showDownload =
    typeof sp.download === "string" ? sp.download !== "false" : true;

  if (!src) {
    return (
      <html>
        <body style={{ margin: 0, background: "transparent" }}>
          <p
            style={{ color: "red", fontFamily: "sans-serif", padding: "1rem" }}
          >
            Missing src parameter.
          </p>
        </body>
      </html>
    );
  }

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
          downloadUrl={src}
          title={title}
          artist={artist}
          thumb={thumb}
          showDownload={showDownload}
        />
      </body>
    </html>
  );
}
