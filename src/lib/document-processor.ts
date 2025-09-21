// src/lib/document-processor.ts
import { getFilesInFolder, getDocumentText } from './google-drive';
import { checkExistingDocumentId } from './notion';
import crypto from 'crypto';

// No more file-based tracking - we use Document ID checking instead

export interface FolderConfig {
  folderId: string;
  source: 'Otter' | 'MyScript';
  name: string;
}

export async function processNewDocuments(folders: FolderConfig[]) {
  const results = [];

  for (const folder of folders) {
    console.log(`Checking folder: ${folder.name}`);
    
    try {
      const files = await getFilesInFolder(folder.folderId);

      for (const file of files) {
        if (!file.id) {
          continue; // Skip files without ID
        }

        // Skip files older than 1 hour to prevent reprocessing
        const fileAge = Date.now() - new Date(file.modifiedTime || file.createdTime || 0).getTime();
        if (fileAge > 60 * 60 * 1000) { // 1 hour in milliseconds
          console.log(`Skipping old file: ${file.name} (age: ${Math.round(fileAge / 1000 / 60)} minutes)`);
          continue;
        }

        console.log(`Processing new file: ${file.name}`);
        
        try {
          // Check if this Document ID already exists in Notion
          console.log(`🔍 Processing file: ${file.name} (ID: ${file.id})`);
          const existingPage = await checkExistingDocumentId(file.id);
          if (existingPage) {
            console.log(`⏭️ Skipping ${file.name} - Document ID already exists in Notion: ${existingPage}`);
            continue;
          }
          console.log(`✅ No existing page found, proceeding to process ${file.name}`);

          // Get document content
          const docContent = await getDocumentText(file.id);
          
          // Prepare payload for ingest API
          const payload = {
            meeting_context: {
              default_date_iso: file.createdTime 
                ? new Date(file.createdTime).toISOString().slice(0, 10)
                : new Date().toISOString().slice(0, 10),
              known_people: [] // You can extract these from the doc if needed
            },
            content: {
              text: docContent.text,
              // For Otter, the text IS the transcript summary, not raw
              transcript_raw: folder.source === 'Otter' ? undefined : undefined,
            },
            source: folder.source,
            document_id: file.id, // Pass the Google Drive Document ID
          };

          // Calculate signature
          const secret = process.env.INGEST_SHARED_SECRET || '';
          const signature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload))
            .digest('hex');

          // Send to ingest API
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ingest`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-signature': signature,
              },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) {
            throw new Error(`Ingest API error: ${response.status}`);
          }

          const result = await response.json();
          
          results.push({
            folder: folder.name,
            file: file.name,
            success: true,
            notionUrl: result.url,
          });

          console.log(`✓ Processed: ${file.name} → Notion: ${result.url}`);
          
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          results.push({
            folder: folder.name,
            file: file.name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } catch (error) {
      console.error(`Error accessing folder ${folder.name}:`, error);
    }
  }

  return results;
}
