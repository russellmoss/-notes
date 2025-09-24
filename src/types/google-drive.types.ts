// src/types/google-drive.types.ts

export interface GoogleDriveFile {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
  mimeType?: string;
}

export interface GoogleDriveFileList {
  files?: GoogleDriveFile[];
}

export interface GoogleDriveFileResponse {
  data: GoogleDriveFile;
}

export interface GoogleDriveFileListResponse {
  data: GoogleDriveFileList;
}

export interface GoogleDocsResponse {
  data: {
    title?: string;
    body?: {
      content: GoogleDocsElement[];
    };
  };
}

export interface GoogleDocsElement {
  paragraph?: {
    elements: Array<{
      textRun?: {
        content: string;
      };
    }>;
  };
  table?: {
    tableRows: Array<{
      tableCells: Array<{
        content: GoogleDocsElement[];
      }>;
    }>;
  };
}

export interface GoogleDriveService {
  files: {
    list: (params: {
      q: string;
      fields: string;
      orderBy: string;
    }) => Promise<GoogleDriveFileListResponse>;
    get: (params: {
      fileId: string;
      fields: string;
    }) => Promise<GoogleDriveFileResponse>;
  };
}

export interface GoogleDocsService {
  documents: {
    get: (params: {
      documentId: string;
    }) => Promise<GoogleDocsResponse>;
  };
}


export interface DocumentTextResult {
  text: string;
  title: string;
  documentId: string;
}

export interface FolderAccessResult {
  success: boolean;
  folderName?: string;
  error?: string;
}
