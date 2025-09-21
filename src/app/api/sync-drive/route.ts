// src/app/api/sync-drive/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processNewDocuments, FolderConfig } from '@/lib/document-processor';
import { verifyFolderAccess } from '@/lib/google-drive';

// Your folder IDs from the URLs you provided
const FOLDERS: FolderConfig[] = [
  {
    folderId: '1fXVCBKszZlYeSqH0DxhZa9bFSQmLn0Gs',
    source: 'Otter',
    name: 'Otter Notes',
  },
  {
    folderId: '1-4kyRPpPfnfhlM0_fT4VVP1EInvThL_L',
    source: 'MyScript',
    name: 'MyScript Notes',
  },
];

export async function POST(req: NextRequest) {
  // Optional: Add authentication
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.SYNC_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if Google credentials are available
    if (!process.env.GOOGLE_CREDENTIALS) {
      return NextResponse.json({ 
        error: 'Google credentials not configured',
        hasCredentials: !!process.env.GOOGLE_CREDENTIALS
      }, { status: 500 });
    }
    // Verify folder access first
    for (const folder of FOLDERS) {
      const access = await verifyFolderAccess(folder.folderId);
      if (!access.success) {
        return NextResponse.json({
          error: `Cannot access folder ${folder.name}: ${access.error}`,
        }, { status: 500 });
      }
    }

    // Process new documents
    const results = await processNewDocuments(FOLDERS);
    
    const processed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: `Sync complete: ${processed} processed, ${failed} failed`,
      results,
    });
    
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Allow manual trigger via GET for testing
export async function GET(req: NextRequest) {
  // Check if Google credentials are available
  if (!process.env.GOOGLE_CREDENTIALS) {
    return NextResponse.json({ 
      error: 'Google credentials not configured',
      hasCredentials: !!process.env.GOOGLE_CREDENTIALS
    }, { status: 500 });
  }
  return POST(req);
}
