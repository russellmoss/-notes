// scripts/verify-notion-schema.ts
import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function verifyNotionSchema() {
  console.log('🔍 Verifying Notion database schema...\n');
  
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DB_ID) {
    console.error('❌ Missing NOTION_TOKEN or NOTION_DB_ID in .env');
    return;
  }
  
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  
  try {
    console.log(`🔗 Connecting to database: ${process.env.NOTION_DB_ID}`);
    
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_DB_ID
    });
    
    console.log('📊 Database retrieved successfully');
    console.log('🔍 Database object keys:', Object.keys(database));
    
    const requiredProps = [
      'Submission Date',
      'Reviewed Next Day',  // You called it "Reviewed 24 Hours"
      'Reviewed Week Later', // You called it "Reviewed 7 Days"
      'Review Notes',
      'Last Review Date',
      'Review Updates'
    ];
    
    // Query the database to get pages and check their properties
    // This is how the app actually works - properties are on pages, not database metadata
    console.log('\n🔍 Checking database contents...');
    console.log('🔍 Available methods on notion.databases:', Object.getOwnPropertyNames(notion.databases));
    
    try {
      // Use the same approach as the existing app - query via data sources
      const database = await notion.databases.retrieve({
        database_id: process.env.NOTION_DB_ID
      });
      
      // Get the first data source (most databases have one)
      const dataSourceId = (database as any).data_sources?.[0]?.id;
      
      if (!dataSourceId) {
        console.log('❌ No data source found in database');
        return;
      }
      
      console.log(`🔍 Querying data source: ${dataSourceId}`);
      
      // Query the data source to get all pages
      const queryResult = await (notion as any).dataSources.query({
        data_source_id: dataSourceId,
        page_size: 5
      });
      
      if (queryResult.results.length > 0) {
        console.log(`📄 Found ${queryResult.results.length} pages in database. Checking properties...`);
        
        // Get properties from the first page (they should be consistent across all pages)
        const firstPage = queryResult.results[0] as any;
        const pageProps = Object.keys(firstPage.properties || {});
        
        if (pageProps.length > 0) {
          console.log('📋 Properties found in pages:');
          pageProps.forEach(prop => console.log(`   ✓ ${prop}`));
          
          console.log('\n🔍 Checking required properties:');
          requiredProps.forEach(prop => {
            if (pageProps.includes(prop)) {
              console.log(`   ✅ ${prop} - Found`);
            } else {
              // Check for alternate names you might have used
              if (prop === 'Reviewed Next Day' && pageProps.includes('Reviewed 24 Hours')) {
                console.log(`   ⚠️  ${prop} - Found as "Reviewed 24 Hours"`);
              } else if (prop === 'Reviewed Week Later' && pageProps.includes('Reviewed 7 Days')) {
                console.log(`   ⚠️  ${prop} - Found as "Reviewed 7 Days"`);
              } else {
                console.log(`   ❌ ${prop} - Missing`);
              }
            }
          });
        } else {
          console.log('❌ No properties found in database pages');
        }
      } else {
        console.log('📭 Database is empty - no pages found');
        console.log('💡 You may need to create some pages or add properties to the database schema');
        
        console.log('\n💡 To add properties to your database:');
        console.log('   1. Go to your Notion database');
        console.log('   2. Click the "+" button to add new properties');
        console.log('   3. Add the required properties listed above');
        return;
      }
    } catch (queryError) {
      console.error('❌ Failed to query database:', queryError);
      return;
    }
    
    console.log('\n✅ Schema verification complete!');
    
  } catch (error) {
    console.error('❌ Failed to verify database:', error);
  }
}

verifyNotionSchema();