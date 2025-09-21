// src/lib/llm.ts
import OpenAI from "openai";
import crypto from "crypto";
import { NoteJSON, TNoteJSON } from "./schema";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function summarizeSingleSource(input: {
  text: string;
  transcript_raw?: string;
  default_date_iso?: string;
  known_people?: string[];
  source: "Otter" | "MyScript" | "Manual";
}): Promise<TNoteJSON> {
  const defaultDate = input.default_date_iso || new Date().toISOString().slice(0,10);
  const hash = crypto.createHash("sha256").update(input.text).digest("hex");

  const system = `You convert a SINGLE note source into a JSON object for a Notion database.
- Return VALID JSON only.
- title: concise, <= 90 chars.
- date_iso: prefer explicit date; else use provided default_date_iso.
- type: one of ["Meeting","Idea","Learning","Other"].
- people: detect names as array of strings.
- tldr: 1–2 sentences as a single string.
- summary: 3–6 short paragraphs as a single string (not an array).
- action_items: conservative [{owner, task, due|null}].
- key_takeaways: brief bullets as array of strings.
- full_text.body: include the main text provided as a single string.
- If transcript_raw is present (Otter), produce a compressed 'transcript_summary' and include it in full_text.transcript_summary as a single string.
- source is provided and must be preserved as-is.
- CRITICAL: summary and tldr must be strings, not arrays.`;

  const user = JSON.stringify({
    default_date_iso: defaultDate,
    known_people: input.known_people || [],
    source: input.source,
    text: input.text,
    transcript_raw: input.transcript_raw || null
  });

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ]
  });

  const raw = resp.choices[0].message?.content || "{}";
  const json = JSON.parse(raw);

  // Fix common LLM response issues
  if (Array.isArray(json.summary)) {
    json.summary = json.summary.join("\n\n");
  }
  if (Array.isArray(json.tldr)) {
    json.tldr = json.tldr.join(" ");
  }
  
  // Ensure full_text exists and has proper structure
  if (!json.full_text) {
    json.full_text = {};
  }
  if (json.full_text.transcript_summary === null) {
    delete json.full_text.transcript_summary;
  }

  json.content_hash = json.content_hash || hash;
  json.source = input.source;
  if (!json.date_iso) json.date_iso = defaultDate;

  return NoteJSON.parse(json);
}
