import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function POST(req: NextRequest) {
  try {
    const { reviews } = await req.json();
    
    if (!reviews || !Array.isArray(reviews)) {
      return NextResponse.json(
        { error: 'Invalid request: reviews array is required' },
        { status: 400 }
      );
    }

    const notion = new Client({ auth: process.env.NOTION_TOKEN! });
    const results = [];

    for (const review of reviews) {
      try {
        // Update the Notion page with review completion
        const updateData: any = {
          page_id: review.id,
          properties: {}
        };

        // Mark the appropriate review type as completed
        if (review.reviewType === 'next-day') {
          updateData.properties['Reviewed Next Day'] = { checkbox: true };
        } else if (review.reviewType === 'week-later') {
          updateData.properties['Reviewed Week Later'] = { checkbox: true };
        }

        // Add review notes if provided
        if (review.edits && review.edits.trim()) {
          updateData.properties['Review Notes'] = {
            rich_text: [{ type: 'text', text: { content: review.edits } }]
          };
        }

        // Set last review date
        updateData.properties['Last Review Date'] = {
          date: { start: new Date().toISOString() }
        };

        // Update the page
        await notion.pages.update(updateData);
        
        results.push({
          id: review.id,
          success: true,
          reviewType: review.reviewType
        });

        console.log(`✅ Updated review for ${review.id} (${review.reviewType})`);
      } catch (error) {
        console.error(`❌ Failed to update review for ${review.id}:`, error);
        results.push({
          id: review.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: true,
      reviewedCount: successCount,
      totalCount: results.length,
      results,
      message: `Successfully submitted ${successCount} reviews${failureCount > 0 ? ` (${failureCount} failed)` : ''}`
    });

  } catch (error) {
    console.error('❌ Review submission failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit reviews',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
