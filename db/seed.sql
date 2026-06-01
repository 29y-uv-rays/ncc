-- ============================================================================
-- RINCC Seed Data for Supabase
-- Run AFTER supabase_init.sql in the Supabase SQL editor.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Admin password (ccnir1091) - scrypt hash with random salt
-- ---------------------------------------------------------------------------
INSERT INTO public.admin_auth (password_hash)
VALUES ('scrypt$n=16384,r=8,p=1$c5aef961a15243dde4183cc09506c358$1f4a776907c8579a23cd661f6df16e36bf43d712d5b59e92b36d6adb16d0091bcdfa347130a82d3ba564ffbcddac15a5f9181a8f4186780090f707e5a19b1a89');

-- ---------------------------------------------------------------------------
-- Initial platoon stats (all zeros)
-- ---------------------------------------------------------------------------
INSERT INTO public.platoon_stats (platoon, drills_percent, pt_percent, ifc_percent, roadmap_percent, volunteer_count)
VALUES
  ('P1',  0, 0, 0, 0, 0),
  ('P2',  0, 0, 0, 0, 0),
  ('P3',  0, 0, 0, 0, 0),
  ('SPEC', 0, 0, 0, 0, 0)
ON CONFLICT (platoon) DO UPDATE SET
  drills_percent   = EXCLUDED.drills_percent,
  pt_percent       = EXCLUDED.pt_percent,
  ifc_percent      = EXCLUDED.ifc_percent,
  roadmap_percent  = EXCLUDED.roadmap_percent,
  volunteer_count  = EXCLUDED.volunteer_count,
  updated_at       = now();

-- ---------------------------------------------------------------------------
-- Contact content (editable from admin)
-- ---------------------------------------------------------------------------
INSERT INTO public.content (type, data)
VALUES (
  'contact',
  '{
    "teachers": [
      { "name": "Mr Justin Yap",  "email": "justin.yap@ri.edu.sg" },
      { "name": "Ms Chen Haiqin", "email": "haiqin.chen@ri.edu.sg" },
      { "name": "Ms Dian Farhana","email": "dianfarhana.z@ri.edu.sg" }
    ],
    "exco": [
      { "role": "USM", "name": "Zaffri",   "phone": "97126255" },
      { "role": "ASM", "name": "Ziyi",     "phone": "85128068" },
      { "role": "PS3", "name": "Thaqif",   "phone": "88115941" },
      { "role": "PS2", "name": "Yuvaraj",  "phone": "90216463" },
      { "role": "PS1", "name": "Rithvik",  "phone": "82077607" }
    ]
  }'::jsonb
)
ON CONFLICT (type) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ---------------------------------------------------------------------------
-- Notes content - full NCC notes (see db/notes.json for the source data)
-- The notes JSON is too large to inline here; use the load_notes.sql helper
-- below or paste the JSON directly in the Supabase dashboard.
-- ---------------------------------------------------------------------------
-- placeholder: notes inserted by application / dashboard
