import './globals.css'

export const metadata = {
  title: 'BurnRate OS',
  description: 'Financial Command Center',
}

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="fireGrad" x1="0.2" y1="1" x2="0.2" y2="0">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="40%" stop-color="#f59e0b"/>
      <stop offset="85%" stop-color="#a78bfa"/>
      <stop offset="100%" stop-color="#c4b5fd"/>
    </linearGradient>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#111120"/>
      <stop offset="100%" stop-color="#0a0a0f"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#4c1d95"/>
    </linearGradient>
    <clipPath id="sq">
      <rect x="0" y="0" width="100" height="100" rx="22"/>
    </clipPath>
  </defs>
  <rect x="0" y="0" width="100" height="100" rx="22" fill="url(#bgGrad)"/>
  <rect x="0" y="0" width="100" height="100" rx="22" fill="none" stroke="url(#borderGrad)" stroke-width="1.5"/>
  <g clip-path="url(#sq)" opacity="0.12">
    <line x1="0" y1="25" x2="100" y2="25" stroke="#7c3aed" stroke-width="0.8"/>
    <line x1="0" y1="50" x2="100" y2="50" stroke="#7c3aed" stroke-width="0.8"/>
    <line x1="0" y1="75" x2="100" y2="75" stroke="#7c3aed" stroke-width="0.8"/>
    <line x1="25" y1="0" x2="25" y2="100" stroke="#7c3aed" stroke-width="0.8"/>
    <line x1="50" y1="0" x2="50" y2="100" stroke="#7c3aed" stroke-width="0.8"/>
    <line x1="75" y1="0" x2="75" y2="100" stroke="#7c3aed" stroke-width="0.8"/>
  </g>
  <path d="M50 88 C32 88 18 76 19 62 C20 52 28 46 27 36 C27 27 22 20 20 12 C32 20 37 31 36 42 C42 30 44 14 39 2 C54 14 58 32 55 48 C61 36 63 18 58 4 C74 20 77 44 71 60 C77 48 79 32 74 18 C88 36 90 60 82 74 C80 62 80 48 76 36 C86 52 85 74 76 84 C68 90 58 88 50 88Z" fill="url(#fireGrad)"/>
  <path d="M50 80 C36 80 28 70 29 60 C30 52 36 47 35 38 C35 30 32 24 30 17 C40 25 43 35 41 45 C47 35 48 22 44 12 C56 22 58 38 54 52 C59 42 60 28 56 18 C66 32 67 50 62 62 C66 54 67 42 63 34 C70 46 69 62 63 72 C57 80 50 80 50 80Z" fill="#fff" opacity="0.07"/>
</svg>`

export default function RootLayout({ children }) {
  const faviconDataUrl = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href={faviconDataUrl} />
        <link rel="shortcut icon" href={faviconDataUrl} />
        <link rel="apple-touch-icon" href={faviconDataUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}