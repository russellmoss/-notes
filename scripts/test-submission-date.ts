// scripts/test-submission-date.ts
import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Define TNoteJSON type directly in this script
interface TNoteJSON {
  title: string;
  date_iso: string;
  type: "Meeting" | "Idea" | "Learning" | "Other";
  people: string[];
  source: "Otter" | "MyScript" | "Manual";
  tldr: string;
  summary: string;
  key_takeaways: string[];
  action_items: Array<{
    owner: string;
    task: string;
    due?: string | null;
  }>;
  full_text: {
    body?: string;
    transcript_summary?: string;
  };
  content_hash: string;
}

// Create Notion client directly in this script
console.log('🔍 Environment check:');
console.log('- NOTION_TOKEN:', process.env.NOTION_TOKEN ? 'Set' : 'Missing');
console.log('- NOTION_DB_ID:', process.env.NOTION_DB_ID ? 'Set' : 'Missing');

if (!process.env.NOTION_TOKEN || !process.env.NOTION_DB_ID) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const notion = new Client({ auth: process.env.NOTION_TOKEN! });
const DB_ID = process.env.NOTION_DB_ID!;

async function testSubmissionDate() {
  console.log('🔍 Testing Notion API connectivity...');
  try {
    // Test connectivity by retrieving database info
    const database = await notion.databases.retrieve({
      database_id: DB_ID
    });
    console.log('✅ Notion API connected successfully');
    console.log(`📊 Database: ${(database as any).title?.[0]?.text?.content || 'Untitled'}`);
  } catch (error) {
    console.error('❌ Notion API connection failed:', error);
    throw error;
  }

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
  
  // Add Submission Date as current timestamp
  const submissionDate = new Date().toISOString();
  
  const props: any = {
    Title: { title: [{ type: "text", text: { content: testNote.title } }] },
    Date: { date: { start: testNote.date_iso } }, // Original date from LLM
    "Submission Date": { date: { start: submissionDate } }, // NEW: Actual submission time
    Type: { select: { name: testNote.type } },
    People: { multi_select: testNote.people.map((p: any) => ({ name: p })) },
    Source: { select: { name: testNote.source } },
    TLDR: { rich_text: [{ type: "text", text: { content: testNote.tldr } }] },
    Summary: { rich_text: [{ type: "text", text: { content: testNote.summary } }] },
    "Action Items": { rich_text: [{ type: "text", text: {
      content: testNote.action_items.map((ai: any) =>
        `• ${ai.owner}: ${ai.task}${ai.due ? ` (due ${ai.due})` : ""}`
      ).join("\n") || "-"
    }}]},
    "Due Dates": { rich_text: [{ type: "text", text: {
      content: testNote.action_items.filter((ai: any) => ai.due).map((ai: any) =>
        `• ${ai.owner}: ${ai.task} — ${ai.due}`
      ).join("\n") || "-"
    }}]},
    "LLM JSON": { rich_text: [{ type: "text", text: { 
      content: JSON.stringify({
        title: testNote.title,
        type: testNote.type,
        source: testNote.source,
        people: testNote.people,
        actionCount: testNote.action_items.length,
        keyTakeawayCount: testNote.key_takeaways.length,
        hasTranscript: !!testNote.full_text?.transcript_summary,
        contentHash: testNote.content_hash.substring(0, 8) + "...",
        processedAt: new Date().toISOString(),
        submissionDate, // Include submission date in metadata
        originalDate: testNote.date_iso
      }, null, 2) 
    }}]},
    "Reviewed Next Day": { checkbox: false }, // Initialize as false
    "Reviewed Week Later": { checkbox: false }, // Initialize as false
    "Document ID": { rich_text: [{ type: "text", text: { content: "test-doc-id" } }] }
  };

  const blocks: any[] = [
    { type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: "TL;DR" } }] } },
    { type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: testNote.tldr } }] } },
    { type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: "Key Takeaways" } }] } },
    ...testNote.key_takeaways.map(i => ({
      type: "bulleted_list_item",
      bulleted_list_item: { rich_text: [{ type: "text", text: { content: i } }] }
    })),
    { type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: "Action Items" } }] } },
    { type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: "-" } }] } },
    { type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: "Body" } }] } },
    { type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: testNote.full_text?.body || "-" } }] } }
  ];
  
  const page = await notion.pages.create({
    parent: { database_id: DB_ID },
    properties: props,
    children: blocks
  });

  console.log(`📝 Created Notion page with submission date: ${submissionDate}`);
  return { pageId: page.id, url: (page as any).url, submissionDate };
}

async function runTest() {
  console.log('🧪 Testing Submission Date Tracking...\n');
  
  try {
    const result = await testSubmissionDate();
    console.log('\n✅ Submission date test completed successfully!');
    console.log('📊 Results:', {
      pageId: result.pageId,
      url: result.url,
      submissionDate: result.submissionDate
    });
    
    console.log('\n🔍 What to check in Notion:');
    console.log('1. "Date" field should show: 2025-09-19 (original date)');
    console.log('2. "Submission Date" field should show: today\'s date');
    console.log('3. "Reviewed Next Day" should be: false');
    console.log('4. "Reviewed Week Later" should be: false');
    console.log('5. LLM JSON should contain both originalDate and submissionDate');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTest();
