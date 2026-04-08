import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Office Dashboard',
    short_name: 'Dashboard',
    description: 'A modern, mobile-first office hub and calendar PWA.',
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
