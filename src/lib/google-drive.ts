// src/lib/google-drive.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

// Initialize auth from service account
function getAuth() {
  // Check if we have environment variables for production deployment
  if (process.env.GOOGLE_CREDENTIALS) {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/documents.readonly'
      ],
    });
    return auth;
  }

  // Fallback to local file for development
  const credentialsPath = path.join(process.cwd(), 'google-credentials.json');
  
  if (!fs.existsSync(credentialsPath)) {
    throw new Error('Google credentials not found. Please set GOOGLE_CREDENTIALS environment variable or add google-credentials.json to project root');
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/documents.readonly'
    ],
  });

  return auth;
}

// Lazy-loaded instances to avoid build-time errors
let _drive: any = null;
let _docs: any = null;

function getDrive() {
  if (!_drive) {
    _drive = google.drive({ version: 'v3', auth: getAuth() });
  }
  return _drive;
}

function getDocs() {
  if (!_docs) {
    _docs = google.docs({ version: 'v1', auth: getAuth() });
  }
  return _docs;
}

// Get list of files in a folder
export async function getFilesInFolder(folderId: string) {
  const drive = getDrive();
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`,
    fields: 'files(id, name, createdTime, modifiedTime)',
    orderBy: 'createdTime desc',
  });
  
  return response.data.files || [];
}

// Get document content as plain text
export async function getDocumentText(documentId: string) {
  const docs = getDocs();
  const doc = await docs.documents.get({
    documentId,
  });

  // Extract text from the document
  let text = '';
  
  function extractText(element: any): string {
    if (element.paragraph) {
      return element.paragraph.elements
        .map((el: any) => el.textRun?.content || '')
        .join('');
    }
    if (element.table) {
      return element.table.tableRows
        .map((row: any) => 
          row.tableCells
            .map((cell: any) => 
              cell.content
                .map((content: any) => extractText(content))
                .join('')
            )
            .join('\t')
        )
        .join('\n');
    }
    return '';
  }

  if (doc.data.body?.content) {
    text = doc.data.body.content
      .map((element: any) => extractText(element))
      .join('')
      .trim();
  }

  return {
    text,
    title: doc.data.title || 'Untitled',
    documentId,
  };
}

// Check if we have access to a folder
export async function verifyFolderAccess(folderId: string) {
  try {
    const drive = getDrive();
    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, mimeType',
    });
    
    if (response.data.mimeType !== 'application/vnd.google-apps.folder') {
      throw new Error('ID does not point to a folder');
    }
    
    return {
      success: true,
      folderName: response.data.name,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
