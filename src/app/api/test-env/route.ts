// src/app/api/test-env/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const envCheck = {
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasNotionToken: !!process.env.NOTION_TOKEN,
    hasNotionDB: !!process.env.NOTION_DB_ID,
    hasSecret: !!process.env.INGEST_SHARED_SECRET,
    openaiLength: process.env.OPENAI_API_KEY?.length || 0,
    notionTokenLength: process.env.NOTION_TOKEN?.length || 0,
    notionDBLength: process.env.NOTION_DB_ID?.length || 0,
    secretLength: process.env.INGEST_SHARED_SECRET?.length || 0,
  };

  return NextResponse.json({ 
    message: "Environment variable check", 
    env: envCheck 
  });
}
