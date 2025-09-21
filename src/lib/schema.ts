// src/lib/schema.ts
import { z } from "zod";

export const ActionItem = z.object({
  owner: z.string().min(1),
  task: z.string().min(1),
  due: z.string().nullable().optional(), // ISO or null
});

export const NoteJSON = z.object({
  title: z.string().min(1).max(90),
  date_iso: z.string().min(4), // YYYY-MM-DD
  type: z.enum(["Meeting", "Idea", "Learning", "Other"]),
  people: z.array(z.string()).default([]),
  source: z.enum(["Otter","MyScript","Manual"]),
  tldr: z.string().min(1),
  summary: z.string().min(1),
  action_items: z.array(ActionItem).default([]),
  key_takeaways: z.array(z.string()).default([]),
  full_text: z.object({
    body: z.string().optional(),               // primary text for this entry
    transcript_summary: z.string().optional(), // likely present if source=Otter
  }).optional(),
  content_hash: z.string().min(16),
});
export type TNoteJSON = z.infer<typeof NoteJSON>;

export const IngestBody = z.object({
  meeting_context: z.object({
    default_date_iso: z.string().optional(),
    known_people: z.array(z.string()).optional(),
  }).default({}),
  content: z.object({
    text: z.string(),              // the single source's text (myscript OR transcript)
    transcript_raw: z.string().optional(), // optional raw transcript (Otter)
  }),
  source: z.enum(["Otter","MyScript","Manual"]),
  document_id: z.string().optional(), // Google Drive Document ID for deduplication
  signature: z.string().optional()
});
export type TIngestBody = z.infer<typeof IngestBody>;
