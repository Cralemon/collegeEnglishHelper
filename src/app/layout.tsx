import type { Metadata, Viewport } from 'next';
import { fontVariables } from '@/styles/fonts';
import { ThemeScript } from '@/components/ThemeScript';
import { BottomNav } from '@/components/layout/BottomNav';
import { BlurOverlay } from '@/components/layout/BlurOverlay';
import { ToastProvider } from '@/components/ui';
import './globals.css';

export const metadata: Metadata = {
  title: '大学英语翻译练习助手',
  description: '卡片式翻译练习 + AI 反馈，帮助大学生提升英语翻译能力',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${fontVariables} h-full overflow-hidden antialiased`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="h-full flex flex-col font-body bg-canvas text-ink">
        <ToastProvider>
          <main className="relative flex-1 min-h-0 flex flex-col">
            {/* z-50: Header portal — absolute so content fills full height underneath */}
            <div
              id="app-header"
              className="absolute top-0 inset-x-0 z-50"
              style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
            />

            {/* z-40: Masked blur overlay — hidden on homepage */}
            <BlurOverlay />

            {/* Content: margins keep text inside safe area while backgrounds extend edge-to-edge */}
            <div
              className="flex-1 min-h-0 mx-auto max-w-5xl w-full flex flex-col px-4 md:px-8 md:pl-[88px]"
              style={{
                marginTop: 'env(safe-area-inset-top, 0px)',
                marginBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              {children}
            </div>
          </main>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
