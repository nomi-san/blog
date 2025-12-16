/// env: server

import { usePageContext } from 'vike-solid/usePageContext'
import previewImage from './previewImage.jpg'
import iconMobile from './iconMobile.png'
import conf from '$blog-config'

// import interLatin from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'
// import interVietnamese from '@fontsource-variable/inter/files/inter-vietnamese-wght-normal.woff2'
// import lexendLatin from '@fontsource-variable/lexend/files/lexend-latin-wght-normal.woff2'
// import lexendVietnamese from '@fontsource-variable/lexend/files/lexend-vietnamese-wght-normal.woff2'

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
      <meta property="og:type" content="website" />
      <meta property="article:author" content="https://example.com/author" />

      {/* <link rel="preload" href={interLatin} as="font" type="font/woff2" crossorigin="anonymous" />
      <link rel="preload" href={interVietnamese} as="font" type="font/woff2" crossorigin="anonymous" />
      <link rel="preload" href={lexendLatin} as="font" type="font/woff2" crossorigin="anonymous" />
      <link rel="preload" href={lexendVietnamese} as="font" type="font/woff2" crossorigin="anonymous" /> */}
    </>
  )
}