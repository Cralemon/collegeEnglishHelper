import type { Metadata } from 'next';
import { fontVariables } from '@/styles/fonts';
import { ThemeScript } from '@/components/ThemeScript';
import './globals.css';

export const metadata: Metadata = {
  title: '大学英语翻译练习助手',
  description: '卡片式翻译练习 + AI 反馈，帮助大学生提升英语翻译能力',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${fontVariables} h-full antialiased`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col font-body bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}
