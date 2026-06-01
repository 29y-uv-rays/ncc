export interface NotesSection {
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

export interface NotesData {
  title?: string;
  subtitle?: string;
  sections: NotesSection[];
}
