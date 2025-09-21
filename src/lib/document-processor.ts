// src/lib/document-processor.ts
import { getFilesInFolder, getDocumentText } from './google-drive';
import { Client } from '@notionhq/client';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Store processed file IDs to avoid reprocessing
const PROCESSED_FILES_PATH = path.join(process.cwd(), '.processed-files.json');

interface ProcessedFiles {
  [folderId: string]: {
    [fileId: string]: {
      processedAt: string;
      title: string;
    };
  };
}

function getProcessedFiles(): ProcessedFiles {
  if (!fs.existsSync(PROCESSED_FILES_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(PROCESSED_FILES_PATH, 'utf-8'));
}

function saveProcessedFiles(data: ProcessedFiles) {
  fs.writeFileSync(PROCESSED_FILES_PATH, JSON.stringify(data, null, 2));
}

// Check if a Notion page already exists with the given title
async function checkExistingNotionPage(title: string): Promise<string | null> {
  try {
    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    const response = await notion.databases.query({
      database_id: process.env.NOTION_DB_ID!,
      filter: {
        property: 'Title',
        title: {
          equals: title
        }
      },
      page_size: 1
    });

    if (response.results.length > 0) {
      const page = response.results[0] as any;
      return page.url || `https://notion.so/${page.id.replace(/-/g, '')}`;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking existing Notion page:', error);
    return null; // If we can't check, proceed anyway
  }
}

export interface FolderConfig {
  folderId: string;
  source: 'Otter' | 'MyScript';
  name: string;
}

export async function processNewDocuments(folders: FolderConfig[]) {
  const processed = getProcessedFiles();
  const results = [];

  for (const folder of folders) {
    console.log(`Checking folder: ${folder.name}`);
    
    try {
      const files = await getFilesInFolder(folder.folderId);
      
      if (!processed[folder.folderId]) {
        processed[folder.folderId] = {};
      }

      for (const file of files) {
        if (!file.id || processed[folder.folderId][file.id]) {
          continue; // Skip if already processed
        }

        // Skip files older than 1 hour to prevent reprocessing
        const fileAge = Date.now() - new Date(file.modifiedTime || file.createdTime || 0).getTime();
        if (fileAge > 60 * 60 * 1000) { // 1 hour in milliseconds
          console.log(`Skipping old file: ${file.name} (age: ${Math.round(fileAge / 1000 / 60)} minutes)`);
          continue;
        }

        console.log(`Processing new file: ${file.name}`);
        
        try {
          // Get document content
          const docContent = await getDocumentText(file.id);
          
          // Check if a Notion page already exists with this title
          const existingPage = await checkExistingNotionPage(docContent.title);
          if (existingPage) {
            console.log(`Skipping ${file.name} - Notion page already exists: ${existingPage}`);
            // Still mark as processed to avoid checking again
            processed[folder.folderId][file.id] = {
              processedAt: new Date().toISOString(),
              title: file.name || 'Untitled',
            };
            continue;
          }
          
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
          
          // Mark as processed
          processed[folder.folderId][file.id] = {
            processedAt: new Date().toISOString(),
            title: file.name || 'Untitled',
          };
          
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

  saveProcessedFiles(processed);
  return results;
}
