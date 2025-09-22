// Simple test route to verify deployment
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Simple test route working',
    timestamp: new Date().toISOString(),
    hasGoogleCredentials: !!process.env.GOOGLE_CREDENTIALS
  });
}

export async function POST() {
  return NextResponse.json({ 
    message: 'Simple test route POST working',
    timestamp: new Date().toISOString(),
    hasGoogleCredentials: !!process.env.GOOGLE_CREDENTIALS
  });
}
