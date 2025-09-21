// Simple test route to verify deployment
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Simple test route working',
    timestamp: new Date().toISOString(),
    hasGoogleCredentials: !!process.env.GOOGLE_CREDENTIALS
  });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Simple test route POST working',
    timestamp: new Date().toISOString(),
    hasGoogleCredentials: !!process.env.GOOGLE_CREDENTIALS
  });
}
