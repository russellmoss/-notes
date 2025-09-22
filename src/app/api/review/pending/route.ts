// src/app/api/review/pending/route.ts
import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { getStartOfDay, getEndOfDay, addDays } from '@/lib/date-utils';

export async function GET() {
  const notion = new Client({ auth: process.env.NOTION_TOKEN! });
  
  const today = new Date();
  const yesterday = addDays(today, -1);
  const weekAgo = addDays(today, -7);
  
  console.log(`📅 Checking for reviews on ${today.toDateString()}`);
  
  try {
    // Get database info to access data sources
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_DB_ID!
    });
    
    const dataSourceId = (database as any).data_sources?.[0]?.id;
    if (!dataSourceId) {
      return NextResponse.json({ error: 'No data source found' }, { status: 500 });
    }

    // Get next-day reviews (submitted yesterday)
    const nextDayReviews = await (notion as any).dataSources.query({
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
    
    // Get week-later reviews (submitted 7 days ago)
    const weekLaterReviews = await (notion as any).dataSources.query({
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
    
    const formatNote = (page: any, reviewType: 'next-day' | 'week-later') => {
      const props = page.properties;
      
      // Parse structured data
      let llmData = {};
      try {
        llmData = JSON.parse(props['LLM JSON']?.rich_text[0]?.text?.content || '{}');
      } catch (e) {
        console.warn('Failed to parse LLM JSON:', e);
      }
      
      // Parse action items
      let actionItems = [];
      try {
        const actionItemsText = props['Action Items']?.rich_text[0]?.text?.content || '';
        if (actionItemsText && actionItemsText !== '-') {
          actionItems = actionItemsText.split('\n')
            .filter((line: string) => line.trim().startsWith('•'))
            .map((line: string) => {
              const match = line.match(/• (.+): (.+?)(?:\s*\(due (.+)\))?$/);
              if (match) {
                return {
                  owner: match[1],
                  task: match[2],
                  due: match[3] || null
                };
              }
              return null;
            })
            .filter(Boolean);
        }
      } catch (e) {
        console.warn('Failed to parse action items:', e);
      }
      
      return {
        id: page.id,
        title: props.Title?.title[0]?.text?.content || 'Untitled',
        date: props.Date?.date?.start || '',
        submissionDate: props['Submission Date']?.date?.start || '',
        tldr: props.TLDR?.rich_text[0]?.text?.content || '',
        summary: props.Summary?.rich_text[0]?.text?.content || '',
        keyTakeaways: (llmData as any).keyTakeaways || [],
        actionItems,
        notionUrl: page.url,
        reviewType,
        reviewed: false,
        edits: ''
      };
    };
    
    const notes = [
      ...nextDayReviews.results.map((p: any) => formatNote(p, 'next-day')),
      ...weekLaterReviews.results.map((p: any) => formatNote(p, 'week-later'))
    ];
    
    console.log(`📊 Found ${notes.length} notes for review today`);
    
    return NextResponse.json({ 
      notes,
      reviewDate: today.toDateString(),
      counts: {
        nextDay: nextDayReviews.results.length,
        weekLater: weekLaterReviews.results.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching pending reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending reviews' },
      { status: 500 }
    );
  }
}
