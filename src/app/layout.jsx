import 'bootstrap/dist/css/bootstrap.min.css'

export const metadata = {
  title: 'Tune Share Hub',
  description: 'Tune Share Hub',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
