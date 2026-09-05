const COLORS = {
  RST: "\x1b[0m",
  CYN: "\x1b[36m",
  YLW: "\x1b[33m",
  GRN: "\x1b[32m",
  MGT: "\x1b[35m",
  GRY: "\x1b[37m",
};

const HTML_COLORS = {
  RST: "</span>",
  CYN: "<span class='cyan'>",
  YLW: "<span class='yellow'>",
  GRN: "<span class='green'>",
  MGT: "<span class='magenta'>",
  GRY: "<span class='gray'>",
};

function addColors(text: string): string {
  for (const [color, code] of Object.entries(COLORS))
    text = text.replace(new RegExp(`\\[${color}\\]`, "g"), code);
  return text;
}

function addSite(text: string, site: string): string {
  return text.replaceAll("SITE", site);
}

export function composeText(text: string, site: string): string {
  return addSite(addColors(text), site);
}

const COLOR_REGEX = /\[(\w+)\]/g;
function addHTMLColors(text: string): string {
  if (!text.includes("[")) return text;

  const matches = text.matchAll(COLOR_REGEX);

  let lastColor = "RST";
  for (const match of matches) {
    const color = match[1] as keyof typeof COLORS;
    if (!color || !HTML_COLORS[color]) continue;
    let span = HTML_COLORS[color];
    if (lastColor !== "RST") span = "</span>" + span;
    text = text.replace(match[0], span);
    lastColor = color;
  }
  return text;
}

export function composeHTML(text: string, site: string): string {
  return addSite(addHTMLColors(text), site);
}