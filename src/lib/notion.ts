// src/lib/notion.ts
import { Client } from "@notionhq/client";
import { TNoteJSON } from "./schema";
import { logger } from "./logger";
import {
  NotionPageProperties,
  NotionDatabase,
  NotionDataSourceQueryResult,
  NotionPage,
  NotionPageCreateResult,
  NotionBlock
} from "@/types/notion.types";

const notion = new Client({ auth: process.env.NOTION_TOKEN! });
const DB_ID = process.env.NOTION_DB_ID!;

// Check if a Notion page already exists with the given Google Drive Document ID
export async function checkExistingDocumentId(documentId: string): Promise<string | null> {
  try {
    logger.debug(`Checking for existing Document ID: ${documentId}`);
    
    // First, get the database to find its data sources
    const database = await notion.databases.retrieve({
      database_id: DB_ID
    }) as NotionDatabase;
    
    logger.debug(`Database retrieved`, { databaseId: database.id });
    
    // Get the first data source (most databases have one)
    const dataSourceId = database.data_sources?.[0]?.id;
    
    if (!dataSourceId) {
      logger.warn(`No data source found in database`);
      return null;
    }
    
    logger.debug(`Querying data source`, { dataSourceId });
    
    // Query the data source to get all pages
    const response = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100
    }) as NotionDataSourceQueryResult;
    
    logger.debug(`Query response for ${documentId}`, { resultCount: response?.results?.length || 0 });

    // Search through all pages for the Document ID
    if (response.results && response.results.length > 0) {
      for (const page of response.results) {
        const pageData = page as NotionPage;
        const documentIdProperty = pageData.properties?.['Document ID'];
        
        logger.debug(`Checking page`, { 
          title: pageData.properties?.Title?.title?.[0]?.text?.content || 'Untitled',
          documentIdProperty: documentIdProperty,
          lookingFor: documentId
        });
        
        if (documentIdProperty?.rich_text?.[0]?.text?.content === documentId) {
          const existingUrl = pageData.url || `https://notion.so/${pageData.id.replace(/-/g, '')}`;
          logger.info(`Found existing page for ${documentId}`, { existingUrl });
          return existingUrl;
        }
      }
    }
    
    logger.info(`No existing page found for ${documentId}`);
    return null;
    
  } catch (error) {
    logger.error('Error checking existing Document ID', { error: error instanceof Error ? error.message : 'Unknown error' });
    return null; // If we can't check, proceed anyway
  }
}

export async function createNotePage(note: TNoteJSON, documentId?: string) {
  // Add Submission Date as current timestamp
  const submissionDate = new Date().toISOString();
  const MAX_RICH_TEXT = 2000;
  const truncate = (s: string) => (s || '').length > MAX_RICH_TEXT ? (s || '').slice(0, MAX_RICH_TEXT - 3) + '...' : (s || '');
  
  const props: NotionPageProperties = {
    Title: { title: [{ type: "text", text: { content: note.title } }] },
    Date: { date: { start: note.date_iso } }, // Original date from LLM
    "Submission Date": { date: { start: submissionDate } }, // NEW: Actual submission time
    Type: { select: { name: note.type } },
    People: { multi_select: note.people.map((p: string) => ({ name: p })) },
    Source: { select: { name: note.source } },
    TLDR: { rich_text: [{ type: "text", text: { content: truncate(note.tldr) } }] },
    Summary: { rich_text: [{ type: "text", text: { content: truncate(note.summary) } }] },
    "Action Items": { rich_text: [{ type: "text", text: {
      content: truncate(note.action_items.map((ai: { owner: string; task: string; due?: string | null }) =>
        `• ${ai.owner}: ${ai.task}${ai.due ? ` (due ${ai.due})` : ""}`
      ).join("\n") || "-")
    }}]},
    "Due Dates": { rich_text: [{ type: "text", text: {
      content: truncate(note.action_items.filter((ai: { owner: string; task: string; due?: string | null }) => ai.due).map((ai: { owner: string; task: string; due?: string | null }) =>
        `• ${ai.owner}: ${ai.task} — ${ai.due}`
      ).join("\n") || "-")
    }}]},
    "LLM JSON": { rich_text: [{ type: "text", text: { 
      content: truncate(JSON.stringify({
        title: note.title,
        type: note.type,
        source: note.source,
        people: note.people,
        actionCount: note.action_items.length,
        keyTakeawayCount: note.key_takeaways.length,
        hasTranscript: !!note.full_text?.transcript_summary,
        contentHash: note.content_hash.substring(0, 8) + "...",
        processedAt: new Date().toISOString(),
        submissionDate, // Include submission date in metadata
        originalDate: note.date_iso
      }, null, 2)) 
    }}]},
    "Reviewed Next Day": { checkbox: false }, // Initialize as false
    "Reviewed Week Later": { checkbox: false } // Initialize as false
  };

  // Add Document ID if provided
  if (documentId) {
    props["Document ID"] = { rich_text: [{ type: "text", text: { content: documentId } }] };
  }

  const blocks: NotionBlock[] = [
    h2("TL;DR"), 
    ...parasFromText(note.tldr),
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

  blocks.push(h2("Summary"), ...parasFromText(note.summary || "-"));
  blocks.push(h2("Body"), ...parasFromText(note.full_text?.body || "-"));

  if (note.full_text?.transcript_summary) {
    blocks.push(h2("Transcript Summary"), ...parasFromText(note.full_text.transcript_summary));
  }

  const page = await notion.pages.create({
    parent: { database_id: DB_ID },
    properties: props as any,
    children: blocks as any
  }) as NotionPageCreateResult;

  logger.info(`Created Notion page with submission date`, { submissionDate, pageId: page.id, url: page.url });
  return { pageId: page.id, url: page.url, submissionDate };
}

const h2 = (text: string) => ({
  type: "heading_2" as const,
  heading_2: { rich_text: [{ type: "text" as const, text: { content: text } }] }
});

const para = (text: string) => ({
  type: "paragraph" as const,
  paragraph: { rich_text: [{ type: "text" as const, text: { content: text } }] }
});

// Split long text into multiple Notion paragraphs to avoid block-size issues
const parasFromText = (text: string) => {
  const chunks: string[] = []
  const MAX = 1800
  let remaining = text || ''
  while (remaining.length > 0) {
    chunks.push(remaining.slice(0, MAX))
    remaining = remaining.slice(MAX)
  }
  if (chunks.length === 0) chunks.push('-')
  return chunks.map(t => para(t))
}

// Test function for submission date tracking
export async function testSubmissionDate() {
  const testNote: TNoteJSON = {
    title: "Test Note with Submission Date",
    date_iso: "2025-09-19", // Original date
    type: "Meeting",
    people: ["Test User"],
    source: "Manual",
    tldr: "Testing submission date tracking",
    summary: "This is a test note to verify submission date is tracked separately",
    key_takeaways: ["Submission date should be today", "Original date should be preserved"],
    action_items: [],
    full_text: { body: "Test content" },
    content_hash: JSON.stringify({ test: true })
  };
  
  const result = await createNotePage(testNote, "test-doc-id");
  logger.info('Test page created', { result });
  return result;
}
