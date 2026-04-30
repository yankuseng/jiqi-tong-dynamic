import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '济企通 - 济南求职避坑指南',
  description: '济企通是济南企业点评平台，让求职者少踩坑，让好企业被看见',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
