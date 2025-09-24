// src/types/notion.types.ts

export interface NotionTitleProperty {
  title: Array<{
    type: 'text';
    text: {
      content: string;
    };
  }>;
}

export interface NotionDateProperty {
  date: {
    start: string;
  };
}

export interface NotionSelectProperty {
  select: {
    name: string;
  };
}

export interface NotionMultiSelectProperty {
  multi_select: Array<{
    name: string;
  }>;
}

export interface NotionRichTextProperty {
  rich_text: Array<{
    type: 'text';
    text: {
      content: string;
    };
  }>;
}

export interface NotionCheckboxProperty {
  checkbox: boolean;
}

export interface NotionPageProperties {
  Title: NotionTitleProperty;
  Date: NotionDateProperty;
  'Submission Date': NotionDateProperty;
  Type: NotionSelectProperty;
  People: NotionMultiSelectProperty;
  Source: NotionSelectProperty;
  TLDR: NotionRichTextProperty;
  Summary: NotionRichTextProperty;
  'Action Items': NotionRichTextProperty;
  'Due Dates': NotionRichTextProperty;
  'LLM JSON': NotionRichTextProperty;
  'Document ID'?: NotionRichTextProperty;
  'Reviewed Next Day'?: NotionCheckboxProperty;
  'Reviewed Week Later'?: NotionCheckboxProperty;
}

export interface NotionDatabase {
  id: string;
  data_sources?: Array<{
    id: string;
  }>;
}

export interface NotionDataSourceQueryResult {
  results: NotionPage[];
}

export interface NotionPage {
  id: string;
  url?: string;
  properties: NotionPageProperties;
}

export interface NotionPageCreateResult {
  id: string;
  url?: string;
}

export interface NotionBlock {
  type: string;
  [key: string]: any;
}

export interface NotionDocumentElement {
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
        content: NotionDocumentElement[];
      }>;
    }>;
  };
}

export interface NotionDocument {
  title?: string;
  body?: {
    content: NotionDocumentElement[];
  };
}
