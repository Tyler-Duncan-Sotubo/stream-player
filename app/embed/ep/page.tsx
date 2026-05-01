import EPClient from "./ep-client";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getStr(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

export default async function EPEmbedPage({ searchParams }: Props) {
  const sp = (await searchParams) || {};

  const epTitle = getStr(sp.epTitle) || "Untitled EP";
  const epArtist = getStr(sp.epArtist);
  const epThumb = getStr(sp.epThumb) || undefined;
  const showDownload = getStr(sp.download) !== "false";
  const showAd = typeof sp.ad === "string" ? sp.ad !== "false" : true;

  const tracks: {
    src: string;
    title: string;
    artist?: string;
    thumb?: string;
  }[] = [];

  for (let i = 1; i <= 20; i++) {
    const src = getStr(sp[`src${i}`]);
    if (!src) break;
    tracks.push({
      src,
      title: getStr(sp[`title${i}`]) || `Track ${i}`,
      artist: getStr(sp[`artist${i}`]) || undefined,
      thumb: getStr(sp[`thumb${i}`]) || undefined,
    });
  }

  if (!tracks.length) {
    return (
      <html>
        <body style={{ margin: 0 }}>
          <p
            style={{ color: "red", padding: "1rem", fontFamily: "sans-serif" }}
          >
            No tracks found. Provide numbered <code>src1</code>,{" "}
            <code>title1</code>, <code>src2</code>... params.
          </p>
        </body>
      </html>
    );
  }

  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{`${epTitle} — Player`}</title>
        <style>{`body{margin:0;background:transparent;font-family:system-ui,-apple-system,sans-serif}`}</style>
      </head>
      <body>
        <EPClient
          epTitle={epTitle}
          epArtist={epArtist}
          epThumb={epThumb}
          tracks={tracks}
          showDownload={showDownload}
          showAd={showAd} // 👈 new
        />
      </body>
    </html>
  );
}
