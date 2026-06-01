#!/usr/bin/env node
/**
 * Load db/notes.json into the Supabase `content` table (type = 'notes').
 *
 * Reads the same env vars the Next.js app uses:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run:  node scripts/load-notes.mjs
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const filePath = resolve(root, "db/notes.json");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  console.error("Put them in .env (or .env.local) or export them in your shell.");
  process.exit(1);
}

const notes = JSON.parse(await readFile(filePath, "utf8"));

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { error } = await supabase
  .from("content")
  .upsert(
    { type: "notes", data: notes, updated_at: new Date().toISOString() },
    { onConflict: "type" }
  );

if (error) {
  console.error("Failed to load notes:", error.message);
  process.exit(1);
}

console.log(`Loaded notes from ${filePath} into content(type='notes').`);
