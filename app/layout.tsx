import './globals.css'

export const metadata = {
  title: 'BurnRate OS',
  description: 'Financial Command Center',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}