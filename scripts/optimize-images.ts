#!/usr/bin/env bun
/**
 * Local authoring tool — deliberately NOT part of `bun run build`.
 *
 * GitHub Pages cannot negotiate image formats or re-encode on the fly, so the
 * WebP and AVIF variants are generated here and committed next to their source
 * as `<name>-<width>.<ext>`. CI only runs `vite build`.
 *
 * Requires `cwebp` and `ffmpeg` (with libsvtav1) on PATH. Run `bun run images`
 * after adding or replacing a raster image in public/images, then commit the
 * originals and the variants together.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { variantWidths } from "../src/imageVariants";

const ROOT = path.resolve(import.meta.dir, "..");
const IMAGES = path.join(ROOT, "public", "images");

const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

/** Social previews stay PNG: several scrapers still ignore WebP/AVIF. */
const SKIP = new Set(["og-preview.png"]);

const AVIF_CRF = "32";
const WEBP_QUALITY = "76";

const run = (command: string, args: string[]) =>
  execFileSync(command, args, { stdio: ["ignore", "ignore", "inherit"] });

/** Recursive listing of candidate source images, relative to public/images. */
function walk(directory: string, prefix = ""): string[] {
  return readdirSync(directory).flatMap(entry => {
    if (entry.startsWith(".")) return [];
    const absolute = path.join(directory, entry);
    const relative = prefix ? `${prefix}/${entry}` : entry;
    if (statSync(absolute).isDirectory()) return walk(absolute, relative);
    return SOURCE_EXTENSIONS.has(path.extname(entry).toLowerCase()) ? [relative] : [];
  });
}

function intrinsicSize(file: string): { width: number; height: number } {
  const [width, height] = execFileSync("ffprobe", [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height", "-of", "csv=p=0", file,
  ], { encoding: "utf8" }).trim().split(",").map(Number);
  return { width, height };
}

const kilobytes = (file: string) => `${Math.round(statSync(file).size / 1024)}K`;

const sources = walk(IMAGES).filter(relative => !SKIP.has(relative));

for (const relative of sources) {
  const source = path.join(IMAGES, relative);
  const directory = path.dirname(source);
  const { name } = path.parse(relative);
  const stem = path.join(directory, name);
  const original = kilobytes(source);

  // Skip any variant that ffprobe cannot read; the source is the contract.
  const { width, height } = intrinsicSize(source);
  const encoded: string[] = [];

  for (const target of variantWidths(width)) {
    const webp = `${stem}-${target}.webp`;
    const avif = `${stem}-${target}.avif`;
    run("cwebp", ["-quiet", "-q", WEBP_QUALITY, "-resize", String(target), "0", source, "-o", webp]);
    run("ffmpeg", [
      "-y", "-loglevel", "error", "-i", source,
      "-vf", `scale=${target}:-2`, "-c:v", "libsvtav1", "-crf", AVIF_CRF,
      "-f", "avif", avif,
    ]);
    encoded.push(`      ${target}px  webp ${kilobytes(webp)}  avif ${kilobytes(avif)}`);
  }

  console.log(`${relative} — ${width}×${height}, ${original} original`);
  console.log(encoded.join("\n"));
}
