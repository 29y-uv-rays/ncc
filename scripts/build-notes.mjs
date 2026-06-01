#!/usr/bin/env node
/**
 * Build db/notes.json from db/notes.source.json.
 *
 * The website renders notes through <NotesRenderer />, which consumes the
 * NotesData schema defined in lib/notes.ts. The source JSON is organised by
 * topic (overview, physical_training, drills, gsk, ifc, cheers, resources) and
 * must be flattened into an array of collapsible sections with stable ids.
 *
 * Run:  node scripts/build-notes.mjs
 * Out:  db/notes.json  (paste into Supabase `content` table, type = 'notes')
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const sourcePath = resolve(root, "db/notes.source.json");
const outputPath = resolve(root, "db/notes.json");

const source = JSON.parse(await readFile(sourcePath, "utf8"));

const out = {
  title: source.title,
  subtitle: "Support understanding of NCC concepts for Specialist Assessment and cadet leadership.",
  sections: buildSections(source.sections),
};

await writeFile(outputPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");
console.log(`Wrote ${outputPath}`);

function buildSections(s) {
  const sections = [];

  // 1. Overview -----------------------------------------------------------
  sections.push({
    id: "overview",
    title: "Overview",
    content: [s.overview.purpose],
    subsections: [buildSpecialistAssessment(s.overview.specialist_assessment)],
  });

  // 2. Physical Training --------------------------------------------------
  sections.push({
    id: "physical-training",
    title: "Physical Training",
    content: [
      `Cadet Strong: ${s.physical_training.cadet_strong_definition}`,
    ],
    items: s.physical_training.importance,
    subsections: [
      buildExpectedStandards(s.physical_training.expected_standards),
      {
        id: "training-notes",
        title: "Training Notes",
        items: s.physical_training.training_notes,
      },
      buildExercises(s.physical_training.exercises),
    ],
  });

  // 3. Drills -------------------------------------------------------------
  sections.push({
    id: "drills",
    title: "Drills",
    content: ["General rules to follow during all drill practice:"],
    items: s.drills.general_rules,
    subsections: [
      buildKeyValueTable({
        id: "drill-legend",
        title: "Drill Legend",
        caption: "Category colour codes used on the parade square.",
        entries: s.drills.legend,
      }),
      buildKeyValueTable({
        id: "key-commands",
        title: "Key Commands",
        caption: "Bahasa commands and their meaning.",
        entries: s.drills.key_commands,
      }),
      {
        id: "marching-drills",
        title: "Marching Drills",
        items: s.drills.marching_drills,
      },
    ],
  });

  // 4. GSK ----------------------------------------------------------------
  sections.push({
    id: "gsk",
    title: "General Specialist Knowledge (GSK)",
    content: [
      `Purpose: ${s.gsk.purpose}`,
      `Vision: ${s.gsk.vision}`,
      `NCC Mission: ${s.gsk.mission_ncc}`,
      `SAF Mission: ${s.gsk.mission_saf}`,
      `Pledge: ${s.gsk.pledge_summary}`,
    ],
    subsections: [
      {
        id: "core-values",
        title: "Core Values",
        items: s.gsk.values,
      },
      {
        id: "saf-branches",
        title: "SAF Branches",
        items: s.gsk.saF_branches,
      },
      buildSar21(s.gsk.sar21_facts),
    ],
  });

  // 5. IFC ----------------------------------------------------------------
  sections.push({
    id: "ifc",
    title: "Individual Field Craft (IFC)",
    content: ["Core skills every cadet must demonstrate:"],
    items: s.ifc.skills,
    subsections: [
      {
        id: "field-signals",
        title: "Field Signals",
        items: s.ifc.field_signals,
      },
      buildNavigation(s.ifc.navigation),
      {
        id: "distance-judging",
        title: "Distance Judging",
        content: ["Factors that affect how accurately you can judge range:"],
        items: s.ifc.distance_judging.factors,
      },
    ],
  });

  // 6. Cheers -------------------------------------------------------------
  sections.push({
    id: "cheers",
    title: "Cheers",
    content: ["Sing these at the end of a good day on the parade square:"],
    items: s.cheers,
  });

  // 7. Resources ----------------------------------------------------------
  sections.push({
    id: "resources",
    title: "Resources",
    links: buildResourceLinks(s.resources.links),
    subsections: [
      {
        id: "credits",
        title: "Credits",
        items: s.resources.credits,
      },
    ],
  });

  return sections;
}

function buildSpecialistAssessment(sa) {
  const rows = sa.components.map((c) => [
    c.name,
    String(c.weightage),
    c.details.join(" / "),
  ]);
  return {
    id: "specialist-assessment",
    title: "Specialist Assessment",
    metadata: `Required for ${sa.required_for} · Promotes to ${sa.promotion}`,
    table: {
      headers: ["Component", "Weightage", "Details"],
      rows,
    },
  };
}

function buildExpectedStandards(standards) {
  const headers = ["Year", "Pushups", "Situps", "Plank (s)", "Running"];
  const rows = ["Y1", "Y2", "Y3"].map((year) => {
    const r = standards[year];
    return [year, String(r.pushups), String(r.situps), String(r.plank_seconds), r.running];
  });
  return {
    id: "expected-standards",
    title: "Expected Standards",
    table: { headers, rows },
  };
}

function buildExercises(exercises) {
  const order = ["pushups", "situps", "crunches", "planks"];
  const labels = {
    pushups: "Pushups",
    situps: "Situps",
    crunches: "Crunches",
    planks: "Planks",
  };
  return {
    id: "exercises",
    title: "Exercises",
    subsections: order
      .filter((k) => exercises[k])
      .map((k) => {
        const ex = exercises[k];
        const subs = [];
        if (ex.key_points?.length) {
          subs.push({
            id: `${k}-form`,
            title: "Form",
            items: ex.key_points,
          });
        }
        if (ex.tips?.length) {
          subs.push({
            id: `${k}-tips`,
            title: "Tips",
            items: ex.tips,
          });
        }
        return { id: `exercise-${k}`, title: labels[k] ?? k, subsections: subs };
      }),
  };
}

function buildKeyValueTable({ id, title, caption, entries }) {
  return {
    id,
    title,
    metadata: caption,
    table: {
      headers: ["Term", "Meaning"],
      rows: Object.entries(entries).map(([k, v]) => [k, v]),
    },
  };
}

function buildSar21(sar) {
  return {
    id: "sar21-facts",
    title: "SAR-21 Facts",
    table: {
      headers: ["Spec", "Value"],
      rows: [
        ["Range", sar.range],
        ["Magazine capacity", String(sar.magazine_capacity)],
        ["Scope", sar.scope],
      ],
    },
    items: sar.characteristics,
    content_after: [`Immediate action: ${sar.immediate_action}`],
  };
}

function buildNavigation(nav) {
  return {
    id: "navigation",
    title: "Navigation",
    content: [
      `Military Grid Reference format: ${nav.mgr_format}`,
      "Rules:",
    ],
    items: nav.rules,
  };
}

function buildResourceLinks(urls) {
  const labels = {
    "https://sites.google.com/view/adc-oal/home?authuser=0": {
      title: "ADC OAL Resources",
      description: "Officer Cadet Course Officer Advanced Learning portal.",
    },
    "https://sites.google.com/view/hqncc-learning-hub-2020/home?authuser=0": {
      title: "HQ NCC Learning Hub 2020",
      description: "Official NCC HQ learning resources site.",
    },
  };
  return urls.map((href) => ({
    href,
    title: labels[href]?.title ?? href,
    description: labels[href]?.description ?? "Open link",
  }));
}
