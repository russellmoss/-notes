import { NextResponse } from 'next/server'

export async function GET() {
  const body = {
    name: "Russell's Notes",
    short_name: 'Notes',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0b0c',
    theme_color: '#722F37',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
  return new NextResponse(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  })
}


