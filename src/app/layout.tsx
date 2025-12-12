import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/toaster';

export const metadata: Metadata = {
  title: 'Yarn Map - UK Fiber Arts Directory',
  description: 'Find fiber arts events and yarn shops across the UK',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
