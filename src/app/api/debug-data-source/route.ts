import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function GET() {
  try {
    const notion = new Client({ auth: process.env.NOTION_TOKEN! });

    // Get database to find data source
    const database = await notion.databases.retrieve({ database_id: process.env.NOTION_DB_ID! });
    const dataSourceId = (database as any).data_sources?.[0]?.id;
    
    return NextResponse.json({ 
      databaseId: process.env.NOTION_DB_ID,
      dataSourceId: dataSourceId,
      database: {
        id: database.id,
        title: (database as any).title?.[0]?.text?.content || 'Untitled',
        dataSources: (database as any).data_sources || []
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get data source info' }, { status: 500 });
  }
}
