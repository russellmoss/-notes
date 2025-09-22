import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function GET() {
  try {
    const notion = new Client({ auth: process.env.NOTION_TOKEN! });

    // Get database to find data source
    const database = await notion.databases.retrieve({ database_id: process.env.NOTION_DB_ID! });
    const dataSourceId = (database as any).data_sources?.[0]?.id;
    if (!dataSourceId) {
      return NextResponse.json({ error: 'No data source found' }, { status: 500 });
    }

    const response = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
    });

    const notes = response.results
      .filter((p: any) => !p.archived)
      .map((page: any) => {
        const props = page.properties;
        return {
          id: page.id,
          url: page.url,
          title: props.Title?.title?.[0]?.text?.content || 'Untitled',
          date: props.Date?.date?.start || '',
          submissionDate: props['Submission Date']?.date?.start || '',
          reviewNextDay: props['Reviewed Next Day']?.checkbox || false,
          reviewWeekLater: props['Reviewed Week Later']?.checkbox || false,
          source: props.Source?.select?.name || '',
          tldr: props.TLDR?.rich_text?.[0]?.text?.content || '',
          summary: props.Summary?.rich_text?.[0]?.text?.content || '',
          people: props.People?.multi_select?.map((p: any) => p.name) || [],
          keyTakeaways: props['Key Takeaways']?.rich_text?.[0]?.text?.content || '',
          actionItems: props['Action Items']?.rich_text?.[0]?.text?.content || '',
        };
      });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error listing notes:', error);
    return NextResponse.json({ error: 'Failed to list notes' }, { status: 500 });
  }
}
