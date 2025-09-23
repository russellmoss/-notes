'use client';

export type SplashDimension = {
  width: number
  height: number
  name: string
}

export function generateSplashScreens(): SplashDimension[] {
  // This would typically be handled by a build script
  // Splash screen dimensions for various iOS devices
  const dimensions: SplashDimension[] = [
    { width: 2048, height: 2732, name: 'iPad Pro 12.9"' },
    { width: 1668, height: 2388, name: 'iPad Pro 11"' },
    { width: 1536, height: 2048, name: 'iPad Mini/Air' },
    { width: 1290, height: 2796, name: 'iPhone 15 Pro Max' },
    { width: 1179, height: 2556, name: 'iPhone 15 Pro' },
    { width: 1170, height: 2532, name: 'iPhone 12/13/14' },
    { width: 828, height: 1792, name: 'iPhone 11' },
  ]
  
  return dimensions
}

export default generateSplashScreens


