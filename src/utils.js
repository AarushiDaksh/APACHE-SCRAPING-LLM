import fs from "fs-extra";

export const writeJSONL = (file, obj) =>
  fs.appendFileSync(file, JSON.stringify(obj) + "\n");

export function ensureDirs(...dirs) {
  dirs.forEach((d) => fs.ensureDirSync(d));
}

export const htmlToText = (html = "") =>
  html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
