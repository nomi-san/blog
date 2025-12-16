/// env: server

import { usePageContext } from 'vike-solid/usePageContext'
import previewImage from './previewImage.jpg'
import iconMobile from './iconMobile.png'
import conf from '$blog-config'

import interRegularWoff2 from '../assets/fonts/Inter-Regular.woff2'
import interSemiBoldWoff2 from '../assets/fonts/Inter-SemiBold.woff2'
import lexendWoff2 from '../assets/fonts/Lexend.woff2'

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

      <link rel="preload" href={interRegularWoff2} as="font" type="font/woff2" crossorigin="anonymous" />
      <link rel="preload" href={interSemiBoldWoff2} as="font" type="font/woff2" crossorigin="anonymous" />
      <link rel="preload" href={lexendWoff2} as="font" type="font/woff2" crossorigin="anonymous" />
    </>
  )
}