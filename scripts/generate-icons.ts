#!/usr/bin/env bun
/**
 * Derives the install-icon set from `public/favicon.svg`.
 *
 * Local authoring tool, deliberately not part of `bun run build`: CI never runs
 * it, and the PNGs it writes are committed. Requires `rsvg-convert` and `ffmpeg`
 * on PATH.
 *
 *   bun run icons
 *
 * Re-run after changing favicon.svg. The manifest and the HTML head both point
 * at these filenames, so the names are part of the contract.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dir, "..");
const PUBLIC = path.join(ROOT, "public");
const SOURCE = path.join(PUBLIC, "favicon.svg");

/** The mark is drawn on a #121413 rounded square. */
const BACKGROUND = "0x121413";
/**
 * Maskable icons must survive an aggressive platform mask, so every pixel that
 * matters belongs inside the W3C safe zone: a circle 80% of the icon's width,
 * i.e. a radius of 40% from the centre. The mark is scaled down until its
 * bounding box fits inside that circle with margin to spare — at 0.78 the
 * monogram's lower-left corner lands at ~231px from the centre of a 512px icon
 * and clips under a round launcher mask.
 */
const MASKABLE_RATIO = 0.68;

const run = (command: string, args: string[]) =>
  execFileSync(command, args, { stdio: ["ignore", "ignore", "inherit"] });

const kilobytes = (file: string) => `${Math.round(statSync(file).size / 1024)}K`;

const scratch = mkdtempSync(path.join(tmpdir(), "portfolio-icons-"));

/** Rasterise the source SVG at a square size. rsvg-convert preserves alpha. */
function rasterise(size: number, output: string) {
  run("rsvg-convert", ["-w", String(size), "-h", String(size), SOURCE, "-o", output]);
}

/** An "any" icon: the mark alone, at the size the manifest advertises. */
function anyIcon(size: number) {
  const output = path.join(PUBLIC, `icon-${size}.png`);
  rasterise(size, output);
  console.log(`icon-${size}.png            ${kilobytes(output)}`);
}

/**
 * A maskable icon: an opaque, full-bleed square with the mark in its safe zone.
 *
 * The SVG rounds its own corners, so a straight rasterisation leaves transparent
 * corners — exactly what a maskable icon must not have. Compositing a *scaled*
 * mark over a solid background fixes both problems at once: the corners get
 * filled, and the mark shrinks into the safe zone. `format=rgb24` guarantees the
 * output really is opaque.
 */
function maskableIcon(size: number) {
  const inner = Math.round(size * MASKABLE_RATIO);
  const offset = Math.round((size - inner) / 2);
  const mark = path.join(scratch, `mark-${inner}.png`);
  const output = path.join(PUBLIC, `icon-maskable-${size}.png`);

  rasterise(inner, mark);
  run("ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "lavfi", "-i", `color=c=${BACKGROUND}:s=${size}x${size}`,
    "-i", mark,
    "-filter_complex", `[0:v][1:v]overlay=${offset}:${offset},format=rgb24`,
    "-frames:v", "1", "-update", "1", output,
  ]);
  console.log(`icon-maskable-${size}.png   ${kilobytes(output)}`);
}

anyIcon(192);
anyIcon(512);
maskableIcon(512);

rmSync(scratch, { recursive: true, force: true });
