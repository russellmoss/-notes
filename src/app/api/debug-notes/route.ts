import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function GET() {
  try {
    // Check environment variables
    const hasNotionToken = !!process.env.NOTION_TOKEN;
    const hasNotionDbId = !!process.env.NOTION_DB_ID;

    if (!hasNotionToken || !hasNotionDbId) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        hasNotionToken,
        hasNotionDbId 
      }, { status: 500 });
    }

    const notion = new Client({ auth: process.env.NOTION_TOKEN! });

    // Test database access
    const database = await notion.databases.retrieve({ database_id: process.env.NOTION_DB_ID! });
    
    const dataSourceId = (database as any).data_sources?.[0]?.id;
    if (!dataSourceId) {
      return NextResponse.json({ 
        error: 'No data source found',
        databaseTitle: (database as any).title,
        dataSources: (database as any).data_sources 
      }, { status: 500 });
    }

    // Test data source query with cache-busting
    const response = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      filter: {
        property: 'Title',
        title: { is_not_empty: true }
      }
    });

    const totalResults = response.results?.length || 0;
    const nonArchivedResults = response.results?.filter((p: any) => !p.archived).length || 0;

    // Show sample of recent notes
    const recentNotes = response.results
      ?.filter((p: any) => !p.archived)
      ?.slice(0, 5)
      ?.map((page: any) => {
        const props = page.properties;
        return {
          id: page.id,
          title: props.Title?.title?.[0]?.text?.content || 'Untitled',
          submissionDate: props['Submission Date']?.date?.start || '',
          createdTime: page.created_time,
          lastEditedTime: page.last_edited_time,
        };
      }) || [];

    return NextResponse.json({ 
      success: true,
      debug: {
        hasNotionToken,
        hasNotionDbId,
        databaseTitle: (database as any).title,
        dataSourceId,
        totalResults,
        nonArchivedResults,
        recentNotes
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
