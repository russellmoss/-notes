import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'
// Support both CJS and ESM export shapes
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pngToIcoModule = require('png-to-ico') as { default?: (input: Buffer[] | Buffer) => Promise<Buffer> } | ((input: Buffer[] | Buffer) => Promise<Buffer>)
const pngToIco: (input: Buffer[] | Buffer) => Promise<Buffer> =
  typeof pngToIcoModule === 'function'
    ? (pngToIcoModule as (input: Buffer[] | Buffer) => Promise<Buffer>)
    : (pngToIcoModule as { default: (input: Buffer[] | Buffer) => Promise<Buffer> }).default!

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

async function createBaseSvg(letter: string, bg: string, fg: string, size: number) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size*0.16)}" fill="${bg}"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${Math.round(size*0.6)}" fill="${fg}">${letter}</text>
</svg>`
  return Buffer.from(svg)
}

async function generateFavicons(publicDir: string, basePng: Buffer) {
  const targets = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-120x120.png', size: 120 },
    { name: 'apple-touch-icon-152x152.png', size: 152 },
    { name: 'apple-touch-icon-167x167.png', size: 167 },
  ]
  await Promise.all(
    targets.map(async (t) => {
      const out = path.join(publicDir, t.name)
      const png = await sharp(basePng).resize(t.size, t.size).png().toBuffer()
      await fs.writeFile(out, png)
    })
  )
}

async function generateSplash(publicDir: string, baseColor: string) {
  const sizes = [
    { name: 'apple-splash-2048x2732.png', w: 2048, h: 2732 }, // iPad Pro 12.9
    { name: 'apple-splash-1668x2388.png', w: 1668, h: 2388 }, // iPad Pro 11/10.5
    { name: 'apple-splash-1536x2048.png', w: 1536, h: 2048 }, // iPad Mini/Air
    { name: 'apple-splash-1290x2796.png', w: 1290, h: 2796 }, // iPhone 15 Pro Max
    { name: 'apple-splash-1179x2556.png', w: 1179, h: 2556 }, // iPhone 15 Pro
    { name: 'apple-splash-1170x2532.png', w: 1170, h: 2532 }, // iPhone 12/13/14
    { name: 'apple-splash-828x1792.png', w: 828, h: 1792 },   // iPhone 11
  ]
  await Promise.all(
    sizes.map(async ({ name, w, h }) => {
      const img = await sharp({ create: { width: w, height: h, channels: 3, background: baseColor } })
        .png()
        .toBuffer()
      await fs.writeFile(path.join(publicDir, name), img)
    })
  )
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..')
  const publicDir = path.join(projectRoot, 'public')
  await ensureDir(publicDir)

  const primaryColor = '#000000'
  const foreground = '#ffffff'

  const baseSvg = await createBaseSvg('R', primaryColor, foreground, 1024)
  const basePng = await sharp(baseSvg).png().toBuffer()

  await generateFavicons(publicDir, basePng)
  await generateSplash(publicDir, '#000000')

  // favicon.ico from 16 and 32 pngs
  const favicon16 = await sharp(basePng).resize(16, 16).png().toBuffer()
  const favicon32 = await sharp(basePng).resize(32, 32).png().toBuffer()
  const icoBuffer = await pngToIco([favicon16, favicon32])
  await fs.writeFile(path.join(publicDir, 'favicon.ico'), icoBuffer)

  console.log('Icons and splash screens generated in /public')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})


