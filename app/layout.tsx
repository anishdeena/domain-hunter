import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Domain Finder',
  description: 'Find available domains',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
