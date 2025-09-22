// src/app/api/review/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function POST(req: NextRequest) {
  try {
    const { pageId, reviewType, edits } = await req.json();
    
    if (!pageId || !reviewType) {
      return NextResponse.json(
        { error: 'Missing pageId or reviewType' },
        { status: 400 }
      );
    }
    
    const notion = new Client({ auth: process.env.NOTION_TOKEN! });
    
    // Determine which checkbox to update based on review type
    const propertyToUpdate = reviewType === 'next-day' 
      ? 'Reviewed Next Day' 
      : 'Reviewed Week Later';
    
    // Update the review checkbox
    await notion.pages.update({
      page_id: pageId,
      properties: {
        [propertyToUpdate]: {
          checkbox: true
        },
        'Last Review Date': {
          date: {
            start: new Date().toISOString()
          }
        },
        'Review Updates': {
          rich_text: [
            {
              type: 'text',
              text: {
                content: edits || `Marked as reviewed on ${new Date().toDateString()}`
              }
            }
          ]
        }
      },
      archived: true
    });
    
    console.log(`✅ Marked ${reviewType} review as complete for page ${pageId}`);
    
    return NextResponse.json({ 
      success: true,
      message: `${reviewType} review marked as complete`
    });
    
  } catch (error) {
    console.error('❌ Error completing review:', error);
    return NextResponse.json(
      { error: 'Failed to complete review' },
      { status: 500 }
    );
  }
}
