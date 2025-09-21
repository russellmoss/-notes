// Minimal test route without external dependencies
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Minimal sync-drive route working',
    timestamp: new Date().toISOString(),
    hasGoogleCredentials: !!process.env.GOOGLE_CREDENTIALS,
    hasSyncApiKey: !!process.env.SYNC_API_KEY,
    hasCronSecret: !!process.env.CRON_SECRET
  });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Minimal sync-drive route POST working',
    timestamp: new Date().toISOString(),
    hasGoogleCredentials: !!process.env.GOOGLE_CREDENTIALS,
    hasSyncApiKey: !!process.env.SYNC_API_KEY,
    hasCronSecret: !!process.env.CRON_SECRET
  });
}
