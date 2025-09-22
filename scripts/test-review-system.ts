// scripts/test-review-system.ts
import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Date utility functions
function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function testReviewSystem() {
  console.log('🔄 Testing calendar-based review system...\n');
  
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DB_ID) {
    console.error('❌ Missing NOTION_TOKEN or NOTION_DB_ID in .env');
    return;
  }
  
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  
  try {
    // Test 1: Check if database has review-related properties
    console.log('📋 Checking database schema for review properties...');
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_DB_ID
    });
    
    const dbProps = Object.keys((database as any).properties || {});
    const reviewProps = [
      'Submission Date',
      'Reviewed Next Day',
      'Reviewed Week Later',
      'Last Review Date',
      'Review Updates'
    ];
    
    console.log('   Required review properties:');
    reviewProps.forEach(prop => {
      const found = dbProps.includes(prop);
      
      if (found) {
        console.log(`   ✅ ${prop}`);
      } else {
        console.log(`   ❌ ${prop} - Missing`);
      }
    });
    
    // Test 2: Test calendar-based review queries
    console.log('\n📅 Testing calendar-based review queries...');
    const today = new Date();
    const yesterday = addDays(today, -1);
    const weekAgo = addDays(today, -7);
    
    console.log(`   Today: ${today.toDateString()}`);
    console.log(`   Yesterday: ${yesterday.toDateString()}`);
    console.log(`   Week ago: ${weekAgo.toDateString()}`);
    
    // Get database info to access data sources
    const dbInfo = await notion.databases.retrieve({
      database_id: process.env.NOTION_DB_ID
    });
    
    const dataSourceId = (dbInfo as any).data_sources?.[0]?.id;
    if (!dataSourceId) {
      console.log('   ❌ No data source found in database');
      return;
    }
    
    console.log(`   🔍 Using data source: ${dataSourceId}`);
    
    // Check for pages that need next-day review (submitted yesterday)
    const nextDayQuery = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        and: [
          {
            property: 'Submission Date',
            date: {
              after: getStartOfDay(yesterday).toISOString(),
              before: getEndOfDay(yesterday).toISOString()
            }
          },
          {
            property: 'Reviewed Next Day',
            checkbox: { equals: false }
          }
        ]
      }
    });
    
    console.log(`   📊 Pages needing next-day review: ${nextDayQuery.results.length}`);
    
    // Check for pages that need week-later review (submitted 7 days ago)
    const weekLaterQuery = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        and: [
          {
            property: 'Submission Date',
            date: {
              after: getStartOfDay(weekAgo).toISOString(),
              before: getEndOfDay(weekAgo).toISOString()
            }
          },
          {
            property: 'Reviewed Next Day',
            checkbox: { equals: true }
          },
          {
            property: 'Reviewed Week Later',
            checkbox: { equals: false }
          }
        ]
      }
    });
    
    console.log(`   📊 Pages needing week-later review: ${weekLaterQuery.results.length}`);
    
    // Test 3: Show sample pages with review status
    console.log('\n📄 Sample pages in database:');
    const recentPages = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      sorts: [
        {
          property: 'Submission Date',
          direction: 'descending'
        }
      ],
      page_size: 5
    });
    
    recentPages.results.forEach((page: any, index: number) => {
      const title = page.properties?.Title?.title?.[0]?.text?.content || 'Untitled';
      const submissionDate = page.properties?.['Submission Date']?.date?.start || 'No date';
      const reviewedNext = page.properties?.['Reviewed Next Day']?.checkbox || false;
      const reviewedWeek = page.properties?.['Reviewed Week Later']?.checkbox || false;
      
      console.log(`   ${index + 1}. "${title}"`);
      console.log(`      Submitted: ${submissionDate}`);
      console.log(`      Next day reviewed: ${reviewedNext ? '✅' : '❌'}`);
      console.log(`      Week later reviewed: ${reviewedWeek ? '✅' : '❌'}`);
    });
    
    // Test 4: Test API endpoint
    console.log('\n🔌 Testing review API endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/review/pending');
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ API endpoint working - found ${data.notes.length} notes for review`);
        console.log(`   📊 Next day: ${data.counts.nextDay}, Week later: ${data.counts.weekLater}`);
      } else {
        console.log(`   ⚠️  API endpoint returned status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ⚠️  API endpoint not available (dev server not running?): ${error}`);
    }
    
    console.log('\n✅ Calendar-based review system test complete!');
    
  } catch (error) {
    console.error('❌ Failed to test review system:', error);
  }
}

testReviewSystem();
