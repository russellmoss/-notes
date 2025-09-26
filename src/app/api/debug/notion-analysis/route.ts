import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { z } from 'zod';

// Type definitions
interface NotionProperty {
  id: string;
  type: string;
  [key: string]: any;
}

interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, NotionProperty>;
}

interface AnalysisResult {
  summary: {
    totalNotesNoFilter: number;
    withTitleFilter: number;
    withDocumentIdFilter: number;
    withSubmissionDateFilter: number;
    withAllFilters: number;
    hasMorePages: boolean;
  };
  issues: {
    missingTitles: string[];
    missingDocumentIds: string[];
    missingSubmissionDates: string[];
  };
  allNotes: Array<{
    id: string;
    title: string;
    documentId: string | null;
    submissionDate: string | null;
    hasAllRequiredFields: boolean;
  }>;
  recommendations: string[];
}

// Environment validation
const env = z.object({
  NOTION_TOKEN: z.string().min(1),
  NOTION_DB_ID: z.string().min(1),
}).parse(process.env);

const notion = new Client({ auth: env.NOTION_TOKEN });

// Helper function to get ALL pages with pagination
async function getAllPages(filter?: any): Promise<NotionPage[]> {
  const allPages: NotionPage[] = [];
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
      filter,
      start_cursor: startCursor,
      page_size: 100,
    });

    allPages.push(...(response.results as NotionPage[]));
    hasMore = response.has_more;
    startCursor = response.next_cursor ?? undefined;
  }

  return allPages;
}

// Extract note information safely
function extractNoteInfo(page: NotionPage) {
  const properties = page.properties;
  
  return {
    id: page.id,
    title: properties.Title?.title?.[0]?.text?.content || '',
    documentId: properties['Document ID']?.rich_text?.[0]?.text?.content || null,
    submissionDate: properties['Submission Date']?.date?.start || null,
    date: properties.Date?.date?.start || 
           properties.Date?.rich_text?.[0]?.text?.content || null,
    type: properties.Type?.select?.name || 
          properties.Type?.rich_text?.[0]?.text?.content || null,
  };
}

export async function GET() {
  try {
    console.log('Starting Notion analysis...');

    // 1. Get ALL notes without any filter
    const allNotes = await getAllPages();
    
    // 2. Get notes with title filter
    const withTitle = await getAllPages({
      property: 'Title',
      title: { is_not_empty: true },
    });

    // 3. Get notes with Document ID filter
    const withDocId = await getAllPages({
      property: 'Document ID',
      rich_text: { is_not_empty: true },
    });

    // 4. Get notes with Submission Date filter
    const withSubmission = await getAllPages({
      property: 'Submission Date',
      date: { is_not_empty: true },
    });

    // 5. Get notes with ALL filters (most restrictive)
    const withAllFilters = await getAllPages({
      and: [
        { property: 'Title', title: { is_not_empty: true } },
        { property: 'Document ID', rich_text: { is_not_empty: true } },
        { property: 'Submission Date', date: { is_not_empty: true } },
      ],
    });

    // Analyze all notes
    const allNotesInfo = allNotes.map(extractNoteInfo);
    
    // Find issues
    const missingTitles = allNotesInfo
      .filter(n => !n.title)
      .map(n => n.id);
    
    const missingDocumentIds = allNotesInfo
      .filter(n => !n.documentId)
      .map(n => n.title || `Note ${n.id}`);
    
    const missingSubmissionDates = allNotesInfo
      .filter(n => !n.submissionDate)
      .map(n => n.title || `Note ${n.id}`);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (missingDocumentIds.length > 0) {
      recommendations.push(
        `${missingDocumentIds.length} notes are missing Document IDs. Consider making this field optional or auto-generating IDs.`
      );
    }
    
    if (missingSubmissionDates.length > 0) {
      recommendations.push(
        `${missingSubmissionDates.length} notes are missing Submission Dates. Consider using creation date as fallback.`
      );
    }

    if (allNotes.length !== withTitle.length) {
      recommendations.push(
        'Some notes are missing titles. This should be investigated as titles are typically required.'
      );
    }

    const result: AnalysisResult = {
      summary: {
        totalNotesNoFilter: allNotes.length,
        withTitleFilter: withTitle.length,
        withDocumentIdFilter: withDocId.length,
        withSubmissionDateFilter: withSubmission.length,
        withAllFilters: withAllFilters.length,
        hasMorePages: false,
      },
      issues: {
        missingTitles,
        missingDocumentIds,
        missingSubmissionDates,
      },
      allNotes: allNotesInfo.map(note => ({
        ...note,
        hasAllRequiredFields: !!(note.title && note.documentId && note.submissionDate),
      })),
      recommendations,
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Debug analysis error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to analyze Notion database',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
