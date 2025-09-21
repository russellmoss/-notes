// src/app/api/cron/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // This can be triggered by Vercel Cron or external cron service
  
  // Verify cron secret (for Vercel Cron)
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Trigger the sync
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/sync-drive`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SYNC_API_KEY}`,
      },
    }
  );

  const result = await response.json();
  return NextResponse.json(result);
}
