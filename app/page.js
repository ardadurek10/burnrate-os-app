export default function Home() {
  return (
    <html>
      <body>
        <script dangerouslySetInnerHTML={{__html: "window.location.replace('https://burnrate-os-app.vercel.app/landing')"}} />
      </body>
    </html>
  )
}
