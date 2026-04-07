import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Premium Calendar',
    short_name: 'Calendar',
    description: 'A responsive, mobile-first calendar PWA built with Next.js.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fdfdfd',
    theme_color: '#fdfdfd',
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'any'
      },
    ],
  }
}
