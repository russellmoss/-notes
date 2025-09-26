import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { z } from 'zod';

// Types matching the current frontend interface
interface NoteItem {
  id: string;
  url: string;
  title: string;
  date: string;
  submissionDate: string;
  reviewNextDay: boolean;
  reviewWeekLater: boolean;
  source: string;
  tldr: string;
  summary: string;
  people: string[];
  keyTakeaways: string;
  actionItems: string;
}

// Environment validation
const env = z.object({
  NOTION_TOKEN: z.string().min(1),
  NOTION_DB_ID: z.string().min(1),
}).parse(process.env);

const notion = new Client({ auth: env.NOTION_TOKEN });

// Fetch all notes with proper pagination
async function fetchAllNotes(includeDebug: boolean = false) {
  const allNotes = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  // Get database to find data source
  const database = await notion.databases.retrieve({ database_id: env.NOTION_DB_ID });
  const dataSourceId = (database as any).data_sources?.[0]?.id;
  
  if (!dataSourceId) {
    throw new Error('No data source found');
  }

  while (hasMore) {
    const response: any = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      // Only filter by Title to get maximum results
      filter: {
        property: 'Title',
        title: { is_not_empty: true },
      },
      start_cursor: startCursor,
      page_size: 100,
      sorts: [
        {
          property: 'Submission Date',
          direction: 'descending',
        },
      ],
    });

    allNotes.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor ?? undefined;
  }

  if (includeDebug) {
    console.log(`Fetched ${allNotes.length} notes from Notion`);
  }

  return allNotes;
}

// Process a single note with safe property access
function processNote(page: any): NoteItem {
  const props = page.properties;
  
  // Helper to safely extract text
  const getText = (prop: any): string => {
    if (!prop) return '';
    if (prop.title?.[0]?.text?.content) return prop.title[0].text.content;
    if (prop.rich_text?.[0]?.text?.content) return prop.rich_text[0].text.content;
    if (prop.select?.name) return prop.select.name;
    return '';
  };

  // Helper to safely extract date
  const getDate = (prop: any): string => {
    if (!prop) return '';
    if (prop.date?.start) return prop.date.start;
    if (prop.rich_text?.[0]?.text?.content) return prop.rich_text[0].text.content;
    return '';
  };

  // Use creation time as fallback for submission date
  const submissionDate = props['Submission Date']?.date?.start || 
                        page.created_time.split('T')[0];

  return {
    id: page.id,
    url: page.url || '',
    title: getText(props.Title) || 'Untitled Note',
    date: getDate(props.Date) || submissionDate,
    submissionDate: submissionDate,
    reviewNextDay: props['Reviewed Next Day']?.checkbox || false,
    reviewWeekLater: props['Reviewed Week Later']?.checkbox || false,
    source: getText(props.Source),
    tldr: getText(props.TLDR),
    summary: getText(props.Summary),
    people: props.People?.multi_select?.map((p: any) => p.name) || [],
    keyTakeaways: getText(props['Key Takeaways']),
    actionItems: getText(props['Action Items']),
  };
}

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const includeDebug = searchParams.get('debug') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');

    // Fetch all notes from Notion
    const rawNotes = await fetchAllNotes(includeDebug);
    
    // Process all notes
    const processedNotes = rawNotes.map(processNote);
    
    // Apply limit if specified
    const finalNotes = limit > 0 
      ? processedNotes.slice(0, limit)
      : processedNotes;

    // Prepare response
    const response = {
      notes: finalNotes,
      metadata: {
        total: finalNotes.length,
        timestamp: new Date().toISOString(),
        ...(includeDebug && {
          debug: {
            rawCount: rawNotes.length,
            processedCount: processedNotes.length,
            limitApplied: limit > 0 ? limit : 'none',
            notesWithAutoSubmissionDate: processedNotes.filter(n => !rawNotes.find((r: any) => 
              r.id === n.id && r.properties['Submission Date']?.date?.start
            )).length,
          },
        }),
      },
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Total-Count': finalNotes.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error fetching notes:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch notes',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
