import type { Metadata } from 'next';
import './globals.css';

const siteOrigin =
  process.env.SITE_TARGET === 'github-pages'
    ? 'https://cheneydesign.top'
    : 'https://cheney-portfolio.comet-crane-1698.chatgpt.site';

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: 'Cheney Design.com',
  description: 'Selected industrial design and visual direction work by Cheney.',
  icons: {
    icon: [{ url: '/cheney-favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/cheney-favicon.svg',
  },
  openGraph: {
    title: 'Cheney Design.com',
    description: 'Selected industrial design and visual direction work by Cheney.',
    url: siteOrigin,
    siteName: 'Cheney Design.com',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Cheney — Industrial Design — Selected Work 2026' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cheney Design.com',
    description: 'Selected industrial design and visual direction work by Cheney.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
