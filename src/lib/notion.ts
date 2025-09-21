// src/lib/notion.ts
import { Client } from "@notionhq/client";
import { TNoteJSON } from "./schema";

const notion = new Client({ auth: process.env.NOTION_TOKEN! });
const DB_ID = process.env.NOTION_DB_ID!;

export async function createNotePage(note: TNoteJSON) {
  const props: any = {
    Title: { title: [{ type: "text", text: { content: note.title } }] },
    Date: { date: { start: note.date_iso } },
    Type: { select: { name: note.type } },
    People: { multi_select: note.people.map((p: any) => ({ name: p })) },
    Source: { select: { name: note.source } },
    TLDR: { rich_text: [{ type: "text", text: { content: note.tldr } }] },
    Summary: { rich_text: [{ type: "text", text: { content: note.summary } }] },
    "Action Items": { rich_text: [{ type: "text", text: {
      content: note.action_items.map((ai: any) =>
        `• ${ai.owner}: ${ai.task}${ai.due ? ` (due ${ai.due})` : ""}`
      ).join("\n") || "-"
    }}]},
    "Due Dates": { rich_text: [{ type: "text", text: {
      content: note.action_items.filter((ai: any) => ai.due).map((ai: any) =>
        `• ${ai.owner}: ${ai.task} — ${ai.due}`
      ).join("\n") || "-"
    }}]},
    "LLM JSON": { rich_text: [{ type: "text", text: { content: JSON.stringify({
      title: note.title,
      type: note.type,
      source: note.source,
      people: note.people,
      actionCount: note.action_items.length,
      keyTakeawayCount: note.key_takeaways.length,
      hasTranscript: !!note.full_text?.transcript_summary,
      contentHash: note.content_hash.substring(0, 8) + "...",
      processedAt: new Date().toISOString()
    }, null, 2) } }] },
  };

  const blocks: any[] = [
    h2("TL;DR"), 
    para(note.tldr),
    h2("Key Takeaways")
  ];

  // Add key takeaways as bullet points
  if (note.key_takeaways.length > 0) {
    blocks.push(...note.key_takeaways.map(i => ({
      type: "bulleted_list_item" as const,
      bulleted_list_item: { rich_text: [{ type: "text" as const, text: { content: i } }] }
    })));
  } else {
    blocks.push(para("-"));
  }

  blocks.push(h2("Action Items"));
  
  // Add action items as bullet points
  if (note.action_items.length > 0) {
    blocks.push(...note.action_items.map(ai => ({
      type: "bulleted_list_item" as const,
      bulleted_list_item: { 
        rich_text: [{ type: "text" as const, text: { content: `${ai.owner}: ${ai.task}${ai.due ? ` (due ${ai.due})` : ""}` } }] 
      }
    })));
  } else {
    blocks.push(para("-"));
  }

  blocks.push(h2("Body"), para(note.full_text?.body || "-"));

  if (note.full_text?.transcript_summary) {
    blocks.push(h2("Transcript Summary"), para(note.full_text.transcript_summary));
  }

  const page = await notion.pages.create({
    parent: { database_id: DB_ID },
    properties: props,
    children: blocks
  });

  return { pageId: page.id, url: (page as any).url };
}

const h2 = (text: string) => ({
  type: "heading_2" as const,
  heading_2: { rich_text: [{ type: "text" as const, text: { content: text } }] }
});

const para = (text: string) => ({
  type: "paragraph" as const,
  paragraph: { rich_text: [{ type: "text" as const, text: { content: text } }] }
});
