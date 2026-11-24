// post-x-promote-01 — make.fun entry for the bounty
// "Promote make.fun's make-your-own-bounty post on X".
//
// What this program does, and nothing else:
//   1. Reads POST.json from the repository root.
//   2. Validates that it names one real X post URL.
//   3. Copies POST.json to the output directory.
//   4. Writes a deterministic validation.json next to it.
//
// Node 22, standard library only. No network, no wall clock,
// no files outside the repository and the output directory,
// fully deterministic: the same input always produces the
// same output bytes.
//
// Local run:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// A post URL looks like https://x.com/<handle>/status/<digits>,
// or the same on twitter.com. The handle is 1-15 word characters
// (letters, digits, underscore); the status id is digits only.
const POST_URL_PATTERN = /^https:\/\/(x\.com|twitter\.com)\/([A-Za-z0-9_]{1,15})\/status\/([0-9]+)$/;

interface Checks {
  isObject: boolean;
  hasUrl: boolean;
  urlIsString: boolean;
  urlNotEmpty: boolean;
  urlMatchesPostPattern: boolean;
}

interface Validation {
  url: string;
  valid: boolean;
  checks: Checks;
}

function fail(message: string): never {
  console.error(`post-x-promote-01: ${message}`);
  process.exit(1);
}

function buildValidation(raw: unknown): Validation {
  const isObject =
    typeof raw === 'object' && raw !== null && !Array.isArray(raw);
  const record = (isObject ? raw : {}) as Record<string, unknown>;
  const hasUrl = Object.prototype.hasOwnProperty.call(record, 'url');
  const urlIsString = typeof record.url === 'string';
  const url = urlIsString ? (record.url as string) : '';
  const urlNotEmpty = urlIsString && url.length > 0;
  const urlMatchesPostPattern = urlNotEmpty && POST_URL_PATTERN.test(url);

  const checks: Checks = {
    isObject,
    hasUrl,
    urlIsString,
    urlNotEmpty,
    urlMatchesPostPattern,
  };
  const valid =
    checks.isObject &&
    checks.hasUrl &&
    checks.urlIsString &&
    checks.urlNotEmpty &&
    checks.urlMatchesPostPattern;

  return { url, valid, checks };
}

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const postPath = join(BOT_DIR, 'POST.json');
  let rawText: string;
  try {
    rawText = readFileSync(postPath, 'utf8');
  } catch (err) {
    fail(`could not read ${postPath}: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText as string);
  } catch (err) {
    fail(`POST.json is not valid JSON: ${(err as Error).message}`);
  }

  const validation = buildValidation(parsed);

  // Record the validation result first, so a failed run still
  // leaves a deterministic account of what was wrong.
  const validationText = JSON.stringify(validation, null, 2) + '\n';
  try {
    writeFileSync(join(OUTPUT_DIR, 'validation.json'), validationText, 'utf8');
  } catch (err) {
    fail(`could not write validation.json: ${(err as Error).message}`);
  }

  if (!validation.valid) {
    const failed = (Object.keys(validation.checks) as (keyof Checks)[])
      .filter((key) => !validation.checks[key])
      .join(', ');
    fail(
      `POST.json failed validation (failed checks: ${failed}); ` +
        `url was ${JSON.stringify(validation.url)}`,
    );
  }

  try {
    copyFileSync(postPath, join(OUTPUT_DIR, 'POST.json'));
  } catch (err) {
    fail(`could not copy POST.json to ${OUTPUT_DIR}: ${(err as Error).message}`);
  }
}

main();
