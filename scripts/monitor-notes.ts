import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '.env' });

const env = z.object({
  NOTION_TOKEN: z.string(),
  NOTION_DB_ID: z.string(),
  API_URL: z.string().default('http://localhost:3000'),
}).parse(process.env);

const notion = new Client({ auth: env.NOTION_TOKEN });

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
    const database = await notion.databases.retrieve({ database_id: env.NOTION_DB_ID });
    const dataSourceId = (database as any).data_sources?.[0]?.id;
    
    if (dataSourceId) {
      const notionResponse = await (notion as any).dataSources.query({
        data_source_id: dataSourceId,
        page_size: 100,
      });
      result.notionDirectCount = notionResponse.results.length;
    }

    // 2. Notes API count
    const notesResponse = await fetch(`${env.API_URL}/api/notes`);
    if (notesResponse.ok) {
      const notesData = await notesResponse.json();
      result.apiNotesCount = notesData.notes?.length || 0;
    }

    // 3. Chat API count (if exists)
    try {
      const chatResponse = await fetch(`${env.API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'How many notes do we have?' })
      });
      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        result.apiChatCount = chatData.count || null;
      }
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
  console.log('\n📊 Notes Monitoring Dashboard');
  console.log('='.repeat(50));
  
  // Initial check
  const result = await checkCounts();
  
  console.log('\n📈 Current Status:');
  console.log(`  Direct Notion Count: ${result.notionDirectCount}`);
  console.log(`  Notes API Count: ${result.discrepancy ? result.apiNotesCount : result.apiNotesCount}`);
  
  if (result.apiChatCount !== null) {
    console.log(`  Chat API Count: ${result.discrepancy ? result.apiChatCount : result.apiChatCount}`);
  }
  
  console.log('\n📝 Details:');
  result.details.forEach(detail => console.log(`  ${detail}`));
  
  if (result.discrepancy) {
    console.log('\n⚠️  DISCREPANCY DETECTED! Please investigate.');
  } else {
    console.log('\n✅ All systems operational!');
  }
  
  // Continuous monitoring
  if (process.argv.includes('--watch')) {
    console.log('\n👀 Monitoring mode active. Checking every 30 seconds...');
    setInterval(async () => {
      const newResult = await checkCounts();
      if (newResult.discrepancy) {
        console.log(`\n[${new Date().toLocaleTimeString()}] ⚠️  Discrepancy detected!`);
        newResult.details.forEach(detail => console.log(`  ${detail}`));
      }
    }, 30000);
  }
}

// Run monitor
monitor().catch(console.error);
