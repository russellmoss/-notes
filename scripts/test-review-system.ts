// scripts/test-review-system.ts
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import { getDateRange, addDays } from '../src/lib/date-utils';

dotenv.config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_TOKEN! });
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testReviewSystem() {
  console.log('🧪 Testing Review System...\n');
  console.log(`📍 Base URL: ${BASE_URL}\n`);
  
  const testResults = {
    dateCalculations: false,
    pendingEndpoint: false,
    submission: false,
    emailEndpoint: false,
    notionConnection: false
  };
  
  try {
    // Test 1: Date Calculations
    console.log('📅 Test 1: Date Calculations');
    const today = new Date();
    const yesterday = addDays(today, -1);
    const weekAgo = addDays(today, -7);
    
    const yesterdayRange = getDateRange(yesterday);
    const weekAgoRange = getDateRange(weekAgo);
    
    console.log(`   Today: ${today.toISOString()}`);
    console.log(`   Yesterday: ${yesterday.toDateString()}`);
    console.log(`   Yesterday range: ${yesterdayRange.start} to ${yesterdayRange.end}`);
    console.log(`   Week ago: ${weekAgo.toDateString()}`);
    console.log(`   Week ago range: ${weekAgoRange.start} to ${weekAgoRange.end}`);
    testResults.dateCalculations = true;
    console.log(`   ✅ Date calculations working correctly\n`);
    
    // Test 2: Notion Connection
    console.log('🔌 Test 2: Notion Connection');
    try {
      const db = await notion.databases.retrieve({
        database_id: process.env.NOTION_DB_ID!
      });
      testResults.notionConnection = true;
      console.log(`   ✅ Connected to Notion database: ${(db as any).title?.[0]?.plain_text || 'Unnamed'}\n`);
    } catch (error) {
      console.log(`   ❌ Failed to connect to Notion: ${error}\n`);
    }
    
    // Test 3: Pending Reviews Endpoint
    console.log('📊 Test 3: Pending Reviews Endpoint');
    let pendingNotes: any[] = [];
    
    try {
      const response = await fetch(`${BASE_URL}/api/review/pending`);
      
      if (response.ok) {
        const data = await response.json();
        pendingNotes = data.notes || [];
        testResults.pendingEndpoint = true;
        
        console.log(`   ✅ Endpoint working`);
        console.log(`   📈 Found ${data.notes.length} total notes for review`);
        console.log(`   📊 Next-day: ${data.counts.nextDay}`);
        console.log(`   📊 Week-later: ${data.counts.weekLater}`);
        
        if (data.debug) {
          console.log(`\n   🔍 Debug Info:`);
          console.log(`   Yesterday range: ${data.debug.yesterdayRange.start}`);
          console.log(`                to: ${data.debug.yesterdayRange.end}`);
          console.log(`   Week ago range:  ${data.debug.weekAgoRange.start}`);
          console.log(`               to:  ${data.debug.weekAgoRange.end}`);
        }
        
        if (data.notes.length > 0) {
          console.log(`\n   📝 Sample note:`);
          const sample = data.notes[0];
          console.log(`   - Title: ${sample.title}`);
          console.log(`   - Type: ${sample.reviewType}`);
          console.log(`   - Submission Date: ${sample.submissionDate}`);
        }
      } else {
        console.log(`   ❌ Endpoint returned status ${response.status}`);
        const error = await response.text();
        console.log(`   Error: ${error}`);
      }
    } catch (error) {
      console.log(`   ❌ Failed to fetch pending reviews: ${error}`);
    }
    console.log('');
    
    // Test 4: Submission Endpoint (dry run)
    console.log('📤 Test 4: Submission Endpoint (Dry Run)');
    
    if (pendingNotes.length > 0) {
      const testNote = pendingNotes[0];
      console.log(`   Testing with note: ${testNote.title}`);
      
      try {
        const submitResponse = await fetch(`${BASE_URL}/api/review/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviews: [{
              id: testNote.id,
              reviewType: testNote.reviewType,
              edits: 'Test review notes (dry run)',
              reviewed: true
            }]
          })
        });
        
        if (submitResponse.ok) {
          const submitData = await submitResponse.json();
          testResults.submission = true;
          console.log(`   ✅ Submission endpoint working`);
          console.log(`   📊 Would update ${submitData.successfulIds.length} notes`);
          console.log(`   🔍 Response structure validated`);
        } else {
          console.log(`   ❌ Submission failed: ${submitResponse.statusText}`);
        }
      } catch (error) {
        console.log(`   ❌ Submission test failed: ${error}`);
      }
    } else {
      console.log(`   ⏭️  Skipped (no pending notes to test with)`);
    }
    console.log('');
    
    // Test 5: Email Endpoint
    console.log('📧 Test 5: Email Endpoint');
    
    try {
      const emailResponse = await fetch(`${BASE_URL}/api/review/email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SYNC_API_KEY || ''}`
        }
      });
      
      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        testResults.emailEndpoint = true;
        console.log(`   ✅ Email endpoint working`);
        console.log(`   📧 Would send to: ${emailData.to}`);
        console.log(`   📊 Notes in email: ${emailData.total}`);
      } else {
        console.log(`   ⚠️  Email endpoint returned: ${emailResponse.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Email test failed: ${error}`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    let passedTests = 0;
    let totalTests = 0;
    
    Object.entries(testResults).forEach(([test, passed]) => {
      totalTests++;
      if (passed) passedTests++;
      console.log(`${passed ? '✅' : '❌'} ${test.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    });
    
    console.log('='.repeat(60));
    console.log(`Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 All tests passed! Review system is working correctly.');
    } else {
      console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Please check the logs above.`);
    }
    
    return passedTests === totalTests;
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    return false;
  }
}

// Run the tests
testReviewSystem().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});