Looking at your CSV files, you have **11 notes total** in your Notion database. Let's fix this issue with a systematic approach that includes verification, type checking, and proper testing.Perfect! I can see the issue now. You have **11 notes** but only **2 have Document IDs** and **1 lacks a Submission Date**. Let's fix this systematically.

# 📋 Fix Notion Notes Count Issue - Complete Solution

## 🔍 Problem Diagnosis
- **Total notes in database:** 11
- **Notes API returns:** 8
- **Chat API returns:** 10
- **Issues found:**
  - 9 notes missing Document IDs
  - 1 note missing Submission Date
  - APIs are filtering inconsistently

## Step-by-Step Solution with Verification

### **Step 1: Verify Notion Database Access via Terminal**

#### Cursor Prompt:
```markdown
Run these terminal commands to verify our Notion API access and see what data we're actually getting. Create a test script at scripts/verify-notion.ts
```

#### Terminal Commands:
```bash
# First, let's verify our Notion connection with curl
curl -X POST https://api.notion.com/v1/databases/YOUR_DATABASE_ID/query \
  -H "Authorization: Bearer YOUR_NOTION_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  -d '{"page_size": 100}' | jq '.results | length'

# Create verification script
mkdir -p scripts
touch scripts/verify-notion.ts
```

#### Implementation - scripts/verify-notion.ts:
```typescript
import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Type-safe environment validation
const EnvSchema = z.object({
  NOTION_API_KEY: z.string().min(1),
  NOTION_DATABASE_ID: z.string().min(1),
});

const env = EnvSchema.parse(process.env);

// Initialize Notion client
const notion = new Client({
  auth: env.NOTION_API_KEY,
});

interface NotionNote {
  id: string;
  properties: {
    Title?: any;
    'Document ID'?: any;
    'Submission Date'?: any;
    Date?: any;
    Type?: any;
  };
}

async function verifyNotionAccess() {
  console.log('🔍 Verifying Notion Database Access\n');
  console.log('Database ID:', env.NOTION_DATABASE_ID);
  console.log('='.repeat(50));

  try {
    // Test 1: Raw query with no filters
    console.log('\n📊 Test 1: No filters (raw count)');
    const rawQuery = await notion.databases.query({
      database_id: env.NOTION_DATABASE_ID,
      page_size: 100,
    });
    console.log(`✅ Total notes (no filter): ${rawQuery.results.length}`);

    // Test 2: With Title filter
    console.log('\n📊 Test 2: Title filter only');
    const titleQuery = await notion.databases.query({
      database_id: env.NOTION_DATABASE_ID,
      filter: {
        property: 'Title',
        title: { is_not_empty: true },
      },
      page_size: 100,
    });
    console.log(`✅ Notes with titles: ${titleQuery.results.length}`);

    // Test 3: With Document ID filter
    console.log('\n📊 Test 3: Document ID filter');
    const docIdQuery = await notion.databases.query({
      database_id: env.NOTION_DATABASE_ID,
      filter: {
        property: 'Document ID',
        rich_text: { is_not_empty: true },
      },
      page_size: 100,
    });
    console.log(`✅ Notes with Document IDs: ${docIdQuery.results.length}`);

    // Test 4: With Submission Date filter
    console.log('\n📊 Test 4: Submission Date filter');
    const dateQuery = await notion.databases.query({
      database_id: env.NOTION_DATABASE_ID,
      filter: {
        property: 'Submission Date',
        date: { is_not_empty: true },
      },
      page_size: 100,
    });
    console.log(`✅ Notes with Submission Date: ${dateQuery.results.length}`);

    // Detailed analysis
    console.log('\n📋 Detailed Note Analysis:');
    console.log('='.repeat(50));
    
    rawQuery.results.forEach((page: any, index: number) => {
      const title = page.properties.Title?.title?.[0]?.plain_text || '[NO TITLE]';
      const docId = page.properties['Document ID']?.rich_text?.[0]?.plain_text || '[NO DOC ID]';
      const submissionDate = page.properties['Submission Date']?.date?.start || '[NO DATE]';
      
      console.log(`${index + 1}. ${title}`);
      console.log(`   Doc ID: ${docId}`);
      console.log(`   Submission: ${submissionDate}`);
      console.log('');
    });

    return rawQuery.results.length;

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run verification
verifyNotionAccess().then(count => {
  console.log('='.repeat(50));
  console.log(`\n✅ Verification complete. Total notes: ${count}`);
  process.exit(0);
});
```

#### Run Script:
```bash
# Install dependencies
npm install --save-dev @types/node dotenv zod

# Run verification
npx tsx scripts/verify-notion.ts

# Type check
npx tsc scripts/verify-notion.ts --noEmit --strict
```

### **Step 2: Create Debug API Endpoint**

#### Cursor Prompt:
```markdown
Create a comprehensive debug API endpoint at app/api/debug/notion-analysis/route.ts that:
1. Queries Notion with different filter combinations
2. Returns detailed analysis
3. Is fully type-safe
4. Handles pagination properly
```

#### Implementation:
```typescript
// app/api/debug/notion-analysis/route.ts
import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { z } from 'zod';

// Type definitions
interface NotionProperty {
  id: string;
  type: string;
  [key: string]: any;
}

interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, NotionProperty>;
}

interface AnalysisResult {
  summary: {
    totalNotesNoFilter: number;
    withTitleFilter: number;
    withDocumentIdFilter: number;
    withSubmissionDateFilter: number;
    withAllFilters: number;
    hasMorePages: boolean;
  };
  issues: {
    missingTitles: string[];
    missingDocumentIds: string[];
    missingSubmissionDates: string[];
  };
  allNotes: Array<{
    id: string;
    title: string;
    documentId: string | null;
    submissionDate: string | null;
    hasAllRequiredFields: boolean;
  }>;
  recommendations: string[];
}

// Environment validation
const env = z.object({
  NOTION_API_KEY: z.string().min(1),
  NOTION_DATABASE_ID: z.string().min(1),
}).parse(process.env);

const notion = new Client({ auth: env.NOTION_API_KEY });

// Helper function to get ALL pages with pagination
async function getAllPages(filter?: any): Promise<NotionPage[]> {
  const allPages: NotionPage[] = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: env.NOTION_DATABASE_ID,
      filter,
      start_cursor: startCursor,
      page_size: 100,
    });

    allPages.push(...(response.results as NotionPage[]));
    hasMore = response.has_more;
    startCursor = response.next_cursor ?? undefined;
  }

  return allPages;
}

// Extract note information safely
function extractNoteInfo(page: NotionPage) {
  const properties = page.properties;
  
  return {
    id: page.id,
    title: properties.Title?.title?.[0]?.plain_text || '',
    documentId: properties['Document ID']?.rich_text?.[0]?.plain_text || null,
    submissionDate: properties['Submission Date']?.date?.start || null,
    date: properties.Date?.date?.start || 
           properties.Date?.rich_text?.[0]?.plain_text || null,
    type: properties.Type?.select?.name || 
          properties.Type?.rich_text?.[0]?.plain_text || null,
  };
}

export async function GET() {
  try {
    console.log('Starting Notion analysis...');

    // 1. Get ALL notes without any filter
    const allNotes = await getAllPages();
    
    // 2. Get notes with title filter
    const withTitle = await getAllPages({
      property: 'Title',
      title: { is_not_empty: true },
    });

    // 3. Get notes with Document ID filter
    const withDocId = await getAllPages({
      property: 'Document ID',
      rich_text: { is_not_empty: true },
    });

    // 4. Get notes with Submission Date filter
    const withSubmission = await getAllPages({
      property: 'Submission Date',
      date: { is_not_empty: true },
    });

    // 5. Get notes with ALL filters (most restrictive)
    const withAllFilters = await getAllPages({
      and: [
        { property: 'Title', title: { is_not_empty: true } },
        { property: 'Document ID', rich_text: { is_not_empty: true } },
        { property: 'Submission Date', date: { is_not_empty: true } },
      ],
    });

    // Analyze all notes
    const allNotesInfo = allNotes.map(extractNoteInfo);
    
    // Find issues
    const missingTitles = allNotesInfo
      .filter(n => !n.title)
      .map(n => n.id);
    
    const missingDocumentIds = allNotesInfo
      .filter(n => !n.documentId)
      .map(n => n.title || `Note ${n.id}`);
    
    const missingSubmissionDates = allNotesInfo
      .filter(n => !n.submissionDate)
      .map(n => n.title || `Note ${n.id}`);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (missingDocumentIds.length > 0) {
      recommendations.push(
        `${missingDocumentIds.length} notes are missing Document IDs. Consider making this field optional or auto-generating IDs.`
      );
    }
    
    if (missingSubmissionDates.length > 0) {
      recommendations.push(
        `${missingSubmissionDates.length} notes are missing Submission Dates. Consider using creation date as fallback.`
      );
    }

    if (allNotes.length !== withTitle.length) {
      recommendations.push(
        'Some notes are missing titles. This should be investigated as titles are typically required.'
      );
    }

    const result: AnalysisResult = {
      summary: {
        totalNotesNoFilter: allNotes.length,
        withTitleFilter: withTitle.length,
        withDocumentIdFilter: withDocId.length,
        withSubmissionDateFilter: withSubmission.length,
        withAllFilters: withAllFilters.length,
        hasMorePages: false,
      },
      issues: {
        missingTitles,
        missingDocumentIds,
        missingSubmissionDates,
      },
      allNotes: allNotesInfo.map(note => ({
        ...note,
        hasAllRequiredFields: !!(note.title && note.documentId && note.submissionDate),
      })),
      recommendations,
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Debug analysis error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to analyze Notion database',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

### **Step 3: Fix the Notes API**

#### Cursor Prompt:
```markdown
Update app/api/notes/route.ts to:
1. Remove problematic filters
2. Handle missing fields gracefully
3. Return all 11 notes
4. Add proper TypeScript types
5. Include debug information
```

#### Implementation:
```typescript
// app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { z } from 'zod';

// Types
interface ProcessedNote {
  id: string;
  title: string;
  date: string;
  type: string;
  people: string;
  source: string;
  tldr: string;
  summary: string;
  actionItems: string;
  dueDates: string;
  documentId: string;
  submissionDate: string;
  reviewedNextDay: boolean;
  reviewedWeekLater: boolean;
  reviewNotes: string;
  lastReviewDate: string;
  reviewUpdates: number;
}

// Environment validation
const env = z.object({
  NOTION_API_KEY: z.string().min(1),
  NOTION_DATABASE_ID: z.string().min(1),
}).parse(process.env);

const notion = new Client({ auth: env.NOTION_API_KEY });

// Fetch all notes with proper pagination
async function fetchAllNotes(includeDebug: boolean = false) {
  const allNotes = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: env.NOTION_DATABASE_ID,
      // Only filter by Title to get maximum results
      filter: {
        property: 'Title',
        title: { is_not_empty: true },
      },
      start_cursor: startCursor,
      page_size: 100,
      sorts: [
        {
          property: 'Submission Date',
          direction: 'descending',
        },
      ],
    });

    allNotes.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor ?? undefined;
  }

  if (includeDebug) {
    console.log(`Fetched ${allNotes.length} notes from Notion`);
  }

  return allNotes;
}

// Process a single note with safe property access
function processNote(page: any): ProcessedNote {
  const props = page.properties;
  
  // Helper to safely extract text
  const getText = (prop: any): string => {
    if (!prop) return '';
    if (prop.title?.[0]?.plain_text) return prop.title[0].plain_text;
    if (prop.rich_text?.[0]?.plain_text) return prop.rich_text[0].plain_text;
    if (prop.select?.name) return prop.select.name;
    return '';
  };

  // Helper to safely extract date
  const getDate = (prop: any): string => {
    if (!prop) return '';
    if (prop.date?.start) return prop.date.start;
    if (prop.rich_text?.[0]?.plain_text) return prop.rich_text[0].plain_text;
    return '';
  };

  // Use creation time as fallback for submission date
  const submissionDate = props['Submission Date']?.date?.start || 
                        page.created_time.split('T')[0];

  return {
    id: page.id,
    title: getText(props.Title) || 'Untitled Note',
    date: getDate(props.Date) || submissionDate,
    type: getText(props.Type) || 'Note',
    people: getText(props.People),
    source: getText(props.Source),
    tldr: getText(props.TLDR),
    summary: getText(props.Summary),
    actionItems: getText(props['Action Items']),
    dueDates: getText(props['Due Dates']),
    documentId: getText(props['Document ID']) || `auto-${page.id.slice(0, 8)}`,
    submissionDate: submissionDate,
    reviewedNextDay: props['Reviewed Next Day']?.checkbox || false,
    reviewedWeekLater: props['Reviewed Week Later']?.checkbox || false,
    reviewNotes: getText(props['Review Notes']),
    lastReviewDate: getDate(props['Last Review Date']),
    reviewUpdates: props['Review Updates']?.number || 0,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const includeDebug = searchParams.get('debug') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');

    // Fetch all notes from Notion
    const rawNotes = await fetchAllNotes(includeDebug);
    
    // Process all notes
    const processedNotes = rawNotes.map(processNote);
    
    // Apply limit if specified
    const finalNotes = limit > 0 
      ? processedNotes.slice(0, limit)
      : processedNotes;

    // Prepare response
    const response = {
      notes: finalNotes,
      metadata: {
        total: finalNotes.length,
        timestamp: new Date().toISOString(),
        ...(includeDebug && {
          debug: {
            rawCount: rawNotes.length,
            processedCount: processedNotes.length,
            limitApplied: limit > 0 ? limit : 'none',
            notesWithoutDocId: processedNotes.filter(n => n.documentId.startsWith('auto-')).length,
            notesWithAutoSubmissionDate: processedNotes.filter(n => !rawNotes.find((r: any) => 
              r.id === n.id && r.properties['Submission Date']?.date?.start
            )).length,
          },
        }),
      },
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Total-Count': finalNotes.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error fetching notes:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch notes',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

### **Step 4: Create Test Suite**

#### Cursor Prompt:
```markdown
Create a test file at __tests__/api/notes.test.ts that:
1. Tests the notes API endpoint
2. Verifies all 11 notes are returned
3. Checks data integrity
4. Is fully typed with TypeScript
```

#### Implementation:
```typescript
// __tests__/api/notes.test.ts
import { describe, it, expect, beforeAll } from '@jest/globals';
import axios from 'axios';
import { z } from 'zod';

// Schema for response validation
const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  type: z.string(),
  people: z.string(),
  source: z.string(),
  tldr: z.string(),
  summary: z.string(),
  actionItems: z.string(),
  dueDates: z.string(),
  documentId: z.string(),
  submissionDate: z.string(),
  reviewedNextDay: z.boolean(),
  reviewedWeekLater: z.boolean(),
  reviewNotes: z.string(),
  lastReviewDate: z.string(),
  reviewUpdates: z.number(),
});

const ResponseSchema = z.object({
  notes: z.array(NoteSchema),
  metadata: z.object({
    total: z.number(),
    timestamp: z.string(),
  }),
});

describe('Notes API', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3000';
  
  it('should return all 11 notes', async () => {
    const response = await axios.get(`${API_URL}/api/notes`);
    
    // Validate response schema
    const data = ResponseSchema.parse(response.data);
    
    // Check we have all 11 notes
    expect(data.notes.length).toBe(11);
    expect(data.metadata.total).toBe(11);
  });

  it('should include debug information when requested', async () => {
    const response = await axios.get(`${API_URL}/api/notes?debug=true`);
    
    expect(response.data.metadata.debug).toBeDefined();
    expect(response.data.metadata.debug.rawCount).toBeGreaterThanOrEqual(11);
  });

  it('should have valid data for all notes', async () => {
    const response = await axios.get(`${API_URL}/api/notes`);
    const data = ResponseSchema.parse(response.data);
    
    data.notes.forEach((note, index) => {
      // Every note should have a title
      expect(note.title).toBeTruthy();
      
      // Every note should have a document ID (real or auto-generated)
      expect(note.documentId).toBeTruthy();
      
      // Every note should have a submission date
      expect(note.submissionDate).toBeTruthy();
      
      console.log(`✅ Note ${index + 1}: ${note.title}`);
    });
  });

  it('should handle limit parameter correctly', async () => {
    const response = await axios.get(`${API_URL}/api/notes?limit=5`);
    const data = ResponseSchema.parse(response.data);
    
    expect(data.notes.length).toBe(5);
  });
});
```

### **Step 5: Create Monitoring Script**

#### Cursor Prompt:
```markdown
Create scripts/monitor-notes.ts that continuously monitors the notes count and alerts on issues
```

#### Implementation:
```typescript
// scripts/monitor-notes.ts
import { Client } from '@notionhq/client';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { z } from 'zod';
import chalk from 'chalk';

dotenv.config({ path: '.env.local' });

const env = z.object({
  NOTION_API_KEY: z.string(),
  NOTION_DATABASE_ID: z.string(),
  API_URL: z.string().default('http://localhost:3000'),
}).parse(process.env);

const notion = new Client({ auth: env.NOTION_API_KEY });

interface MonitoringResult {
  timestamp: string;
  notionDirectCount: number;
  apiNotesCount: number;
  apiChatCount: number | null;
  discrepancy: boolean;
  details: string[];
}

async function checkCounts(): Promise<MonitoringResult> {
  const result: MonitoringResult = {
    timestamp: new Date().toISOString(),
    notionDirectCount: 0,
    apiNotesCount: 0,
    apiChatCount: null,
    discrepancy: false,
    details: [],
  };

  try {
    // 1. Direct Notion count
    const notionResponse = await notion.databases.query({
      database_id: env.NOTION_DATABASE_ID,
      page_size: 100,
    });
    result.notionDirectCount = notionResponse.results.length;

    // 2. Notes API count
    const notesResponse = await axios.get(`${env.API_URL}/api/notes`);
    result.apiNotesCount = notesResponse.data.notes.length;

    // 3. Chat API count (if exists)
    try {
      const chatResponse = await axios.get(`${env.API_URL}/api/chat`);
      result.apiChatCount = chatResponse.data.notes?.length || null;
    } catch {
      // Chat API might not exist
    }

    // Check for discrepancies
    if (result.notionDirectCount !== result.apiNotesCount) {
      result.discrepancy = true;
      result.details.push(
        `⚠️ Notes API (${result.apiNotesCount}) doesn't match Notion (${result.notionDirectCount})`
      );
    }

    if (result.apiChatCount !== null && result.apiChatCount !== result.notionDirectCount) {
      result.discrepancy = true;
      result.details.push(
        `⚠️ Chat API (${result.apiChatCount}) doesn't match Notion (${result.notionDirectCount})`
      );
    }

    if (!result.discrepancy) {
      result.details.push('✅ All counts match!');
    }

  } catch (error) {
    result.details.push(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    result.discrepancy = true;
  }

  return result;
}

async function monitor() {
  console.log(chalk.blue.bold('\n📊 Notes Monitoring Dashboard'));
  console.log(chalk.gray('=' .repeat(50)));
  
  // Initial check
  const result = await checkCounts();
  
  console.log(chalk.yellow('\n📈 Current Status:'));
  console.log(`  Direct Notion Count: ${chalk.green(result.notionDirectCount)}`);
  console.log(`  Notes API Count: ${result.discrepancy ? chalk.red(result.apiNotesCount) : chalk.green(result.apiNotesCount)}`);
  
  if (result.apiChatCount !== null) {
    console.log(`  Chat API Count: ${result.discrepancy ? chalk.red(result.apiChatCount) : chalk.green(result.apiChatCount)}`);
  }
  
  console.log(chalk.yellow('\n📝 Details:'));
  result.details.forEach(detail => console.log(`  ${detail}`));
  
  if (result.discrepancy) {
    console.log(chalk.red.bold('\n⚠️  DISCREPANCY DETECTED! Please investigate.'));
  } else {
    console.log(chalk.green.bold('\n✅ All systems operational!'));
  }
  
  // Continuous monitoring
  if (process.argv.includes('--watch')) {
    console.log(chalk.gray('\n👀 Monitoring mode active. Checking every 30 seconds...'));
    setInterval(async () => {
      const newResult = await checkCounts();
      if (newResult.discrepancy) {
        console.log(chalk.red(`\n[${new Date().toLocaleTimeString()}] ⚠️  Discrepancy detected!`));
        newResult.details.forEach(detail => console.log(`  ${detail}`));
      }
    }, 30000);
  }
}

// Run monitor
monitor().catch(console.error);
```

### **Step 6: Setup & Deployment Commands**

#### Cursor Prompt:
```markdown
Create a Makefile with all necessary commands for setup, testing, and deployment
```

#### Makefile:
```makefile
# Makefile
.PHONY: help install verify test debug fix-all deploy monitor clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "%-15s %s\n", $$1, $$2}'

install: ## Install all dependencies
	npm install
	npm install --save-dev @types/node dotenv zod axios chalk jest @jest/globals tsx typescript

verify: ## Verify Notion connection
	npx tsx scripts/verify-notion.ts

test: ## Run all tests
	npm test

lint: ## Lint all TypeScript files
	npx eslint . --ext .ts,.tsx --fix

typecheck: ## Type check all TypeScript files
	npx tsc --noEmit --strict

debug: ## Run debug analysis
	curl -s http://localhost:3000/api/debug/notion-analysis | jq '.'

test-api: ## Test notes API
	@echo "Testing Notes API..."
	@curl -s http://localhost:3000/api/notes | jq '.metadata'
	@echo "\nWith debug info:"
	@curl -s http://localhost:3000/api/notes?debug=true | jq '.metadata.debug'

monitor: ## Start monitoring dashboard
	npx tsx scripts/monitor-notes.ts --watch

fix-all: typecheck lint ## Fix all issues (type check + lint)
	@echo "✅ All checks passed!"

deploy: fix-all test ## Deploy to production
	@echo "🚀 Deploying..."
	npm run build
	# Add your deployment command here

clean: ## Clean build artifacts
	rm -rf .next node_modules
	npm install
```

### **Step 7: Package.json Scripts**

#### Cursor Prompt:
```markdown
Update package.json with all necessary scripts
```

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit --strict",
    "test": "jest",
    "test:watch": "jest --watch",
    "verify": "tsx scripts/verify-notion.ts",
    "monitor": "tsx scripts/monitor-notes.ts",
    "monitor:watch": "tsx scripts/monitor-notes.ts --watch",
    "debug:api": "curl -s http://localhost:3000/api/debug/notion-analysis | jq",
    "fix": "npm run typecheck && npm run lint"
  }
}
```

## 🚀 Implementation Steps

1. **Install dependencies:**
   ```bash
   make install
   ```

2. **Verify Notion connection:**
   ```bash
   make verify
   ```

3. **Run type checking:**
   ```bash
   make typecheck
   ```

4. **Test the current API:**
   ```bash
   make test-api
   ```

5. **Deploy the fixes:**
   ```bash
   make deploy
   ```

6. **Monitor continuously:**
   ```bash
   make monitor
   ```

## 🎯 Expected Result
After implementing these changes, your Notes API should return all 11 notes by:
1. Removing restrictive filters
2. Handling missing fields gracefully
3. Using pagination properly
4. Auto-generating missing Document IDs
5. Using creation date as fallback for Submission Date

The monitoring script will ensure everything stays in sync!