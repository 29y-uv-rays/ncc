"use client";

import { useState } from "react";

interface NotesSection {
  id: string;
  title: string;
  content?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  items?: string[];
  subsections?: NotesSection[];
  links?: { title: string; description: string; href: string }[];
  metadata?: string;
  content_after?: string[];
}

interface NotesRendererProps {
  sections: NotesSection[];
}

export default function NotesRenderer({ sections }: NotesRendererProps) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <Section key={section.id} section={section} level={0} />
      ))}
    </div>
  );
}

function Section({ section, level }: { section: NotesSection; level: number }) {
  const [open, setOpen] = useState(level === 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <div>
          <p className="text-xs font-medium text-gray-500">Section</p>
          <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
          {section.metadata ? (
            <p className="text-xs font-medium text-gray-500 mt-1">
              {section.metadata}
            </p>
          ) : null}
        </div>
        <span className="text-gray-400">{open ? "˅" : ">"}</span>
      </button>
      {open ? (
        <div className="border-t border-gray-200 px-6 py-4 space-y-4">
          {section.content?.map((paragraph) => (
            <p key={paragraph} className="text-sm font-normal text-gray-600">
              {paragraph}
            </p>
          ))}
          {section.items ? (
            <div className="space-y-1">
              {section.items.map((item) => (
                <p key={item} className="text-sm font-normal text-gray-600">
                  <span className="text-gray-400 mr-2">-</span>
                  {item}
                </p>
              ))}
            </div>
          ) : null}
          {section.table ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs font-medium text-gray-500">
                  <tr>
                    {section.table.headers.map((header) => (
                      <th key={header} className="px-3 py-2 border-b border-gray-200">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row, rowIndex) => (
                    <tr key={`${section.id}-row-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${section.id}-cell-${rowIndex}-${cellIndex}`}
                          className="px-3 py-2 border-b border-gray-200"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {section.links ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {section.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300"
                >
                  <p className="text-sm font-semibold text-gray-900">{link.title}</p>
                  <p className="text-xs font-medium text-gray-500">{link.description}</p>
                </a>
              ))}
            </div>
          ) : null}
          {section.content_after?.map((paragraph) => (
            <p key={paragraph} className="text-sm font-normal text-gray-600">
              {paragraph}
            </p>
          ))}
          {section.subsections?.map((subsection) => (
            <Section key={subsection.id} section={subsection} level={level + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
