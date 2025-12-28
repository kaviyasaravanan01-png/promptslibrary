import './globals.css';
import { ReactNode } from 'react';
import Link from 'next/link';
import AuthButton from '../components/AuthButton';

export const metadata = {
  title: 'Prompt Library',
  description: 'Browse and buy high-quality AI prompts and results'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
          <header className="container mx-auto p-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-semibold">Prompt Library</Link>
              <Link href="/favorites" className="text-sm text-gray-300">Favorites</Link>
              <Link href="/my/prompts" className="text-sm text-gray-300">My Prompts</Link>
            </div>
            <div>
              <AuthButton />
            </div>
          </header>
          <main className="container mx-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
