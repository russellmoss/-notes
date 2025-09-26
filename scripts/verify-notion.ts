import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config({ path: '.env' });

// Type-safe environment validation
const EnvSchema = z.object({
  NOTION_TOKEN: z.string().min(1),
  NOTION_DB_ID: z.string().min(1),
});

const env = EnvSchema.parse(process.env);

// Initialize Notion client
const notion = new Client({
  auth: env.NOTION_TOKEN,
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
  console.log('Database ID:', env.NOTION_DB_ID);
  console.log('='.repeat(50));

  try {
    // Get database to find data source
    const database = await notion.databases.retrieve({ database_id: env.NOTION_DB_ID });
    const dataSourceId = (database as any).data_sources?.[0]?.id;
    
    if (!dataSourceId) {
      console.log('❌ No data source found');
      return 0;
    }

    console.log('✅ Data source found:', dataSourceId);

    // Test 1: Raw query with no filters
    console.log('\n📊 Test 1: No filters (raw count)');
    const rawQuery = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
    });
    console.log(`✅ Total notes (no filter): ${rawQuery.results.length}`);

    // Test 2: With Title filter
    console.log('\n📊 Test 2: Title filter only');
    const titleQuery = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      filter: {
        property: 'Title',
        title: { is_not_empty: true },
      },
    });
    console.log(`✅ Notes with titles: ${titleQuery.results.length}`);

    // Test 3: With Document ID filter
    console.log('\n📊 Test 3: Document ID filter');
    const docIdQuery = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      filter: {
        property: 'Document ID',
        rich_text: { is_not_empty: true },
      },
    });
    console.log(`✅ Notes with Document IDs: ${docIdQuery.results.length}`);

    // Test 4: With Submission Date filter
    console.log('\n📊 Test 4: Submission Date filter');
    const dateQuery = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      filter: {
        property: 'Submission Date',
        date: { is_not_empty: true },
      },
    });
    console.log(`✅ Notes with Submission Date: ${dateQuery.results.length}`);

    // Detailed analysis
    console.log('\n📋 Detailed Note Analysis:');
    console.log('='.repeat(50));
    
    rawQuery.results.forEach((page: any, index: number) => {
      const title = page.properties.Title?.title?.[0]?.text?.content || '[NO TITLE]';
      const docId = page.properties['Document ID']?.rich_text?.[0]?.text?.content || '[NO DOC ID]';
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
