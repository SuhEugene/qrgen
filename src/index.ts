import { decideRenderer, getQr, getQrOptions, getQrType, type QRRenderer } from "./qr";
import indexText from "./index.txt";
import helpText from "./help.txt";
import { composeHTML, composeText } from "./text";

async function renderPage(text: string, renderer: QRRenderer, isCode=true) {
  const tmpHtml = await Bun.file("./src/tmp.html").text();
  if (renderer === "html")
    return new Response(
      tmpHtml
        .replace("[CODE]", isCode ? "code" : "text")
        .replace("[PAGE]", composeHTML(text, "http://localhost:3000")),
      { headers: { "content-type": "text/html" } },
    );
  return new Response(composeText(text, "http://localhost:3000"));
}

Bun.serve({
  port: 3000,
  hostname: "0.0.0.0",
  routes: {
    "/*": (req) => {
      const url = new URL(req.url);

      const renderer = decideRenderer(url, (req.headers.get("user-agent") || "").toLowerCase());
      if (url.pathname === "/help") return renderPage(helpText, renderer, false);
      if (!url.search || url.search === "?") return renderPage(indexText, renderer, false);

      const data = String(url.searchParams.get("q") || url.search.slice(1));
      const options = getQrOptions(url);
      const type = getQrType(url, renderer);
      const qr = getQr(type, data, options);

      return renderPage(qr, renderer);
    },
  },
});
