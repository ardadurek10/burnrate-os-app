import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'BurnRate OS — Financial Command Center',
  description: 'Track subscriptions, spending, investments. Stop the leak.',
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BurnRate OS',
  },
  icons: {
    apple: 'https://burnrate-os.com/logo.svg',
    icon: 'https://burnrate-os.com/logo.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BurnRate OS" />
        <link rel="apple-touch-icon" href="https://burnrate-os.com/logo.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function() { console.log('SW registered'); })
                  .catch(function(err) { console.log('SW error:', err); });
              });
            }
          `
        }} />
      </head>
      <body className={inter.className} style={{margin:0,padding:0,background:'#0a0a0f'}}>
        {children}
      </body>
    </html>
  )
}