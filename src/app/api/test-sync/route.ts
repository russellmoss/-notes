// src/app/api/test-sync/route.ts - Testing endpoint without authentication
import { NextRequest, NextResponse } from 'next/server';
import { processNewDocuments, FolderConfig } from '@/lib/document-processor';
import { verifyFolderAccess, getFilesInFolder } from '@/lib/google-drive';

// Your folder IDs
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

export async function GET(req: NextRequest) {
  console.log('🧪 Test sync started...');
  
  try {
    const results = [];
    
    // First, let's check what files are in each folder
    for (const folder of FOLDERS) {
      console.log(`📁 Checking folder: ${folder.name} (${folder.folderId})`);
      
      try {
        // Verify access
        const access = await verifyFolderAccess(folder.folderId);
        console.log(`   Access check:`, access);
        
        if (access.success) {
          // List files
          const files = await getFilesInFolder(folder.folderId);
          console.log(`   Found ${files.length} files:`, files.map((f: any) => ({ name: f.name, id: f.id })));
          
          results.push({
            folder: folder.name,
            access: access,
            fileCount: files.length,
            files: files.map((f: any) => ({ name: f.name, id: f.id, createdTime: f.createdTime }))
          });
        } else {
          results.push({
            folder: folder.name,
            access: access,
            error: 'Cannot access folder'
          });
        }
      } catch (error) {
        console.error(`   Error with folder ${folder.name}:`, error);
        results.push({
          folder: folder.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      message: 'Folder check complete',
      timestamp: new Date().toISOString(),
      results
    });
    
  } catch (error) {
    console.error('💥 Test sync error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log('🔄 Full sync test started...');
  
  try {
    // Process new documents
    const results = await processNewDocuments(FOLDERS);
    
    const processed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: `Sync complete: ${processed} processed, ${failed} failed`,
      timestamp: new Date().toISOString(),
      results,
    });
    
  } catch (error) {
    console.error('💥 Full sync error:', error);
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
