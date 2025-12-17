/// env: server

import { usePageContext } from 'vike-solid/usePageContext'
import conf from '$blog-config'

export default function Head() {

  const ctx = usePageContext()

  return (
    <>
      {/* Icon shown in the browser tab (aka favicon) */}
      {/* <link rel="icon" href="/icon.png" type="image/png" sizes="64x64"> */}

      {/* Icon shown on mobile homescreens (PWA) */}
      {/* <link rel="apple-touch-icon" href={iconMobile} type="image/svg+xml" /> */}

      {/* Image shown when sharing on social sites (Twitter, WhatsApp, ...) */}
      {/* <meta property="og:image" content={previewImage} /> */}
      {/* More Open Graph tags */}
      {/* <meta property="og:type" content="website" />
      <meta property="article:author" content="https://example.com/author" /> */}
    </>
  )
}