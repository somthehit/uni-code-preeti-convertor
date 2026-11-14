import type { Metadata } from 'next';
import { Inter, Mukta } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const mukta = Mukta({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['devanagari', 'latin'],
  variable: '--font-mukta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'नेपाली अनुवादक, टाइपिङ मास्टर र टुलकिट (Nepali Unicode ↔ Preeti)',
  description:
    'नेपाली युनिकोड ↔ प्रिती द्वि-दिशात्मक अनुवादक, वर्ड र एक्सेल फाइल रूपान्तरण, १५ तह टाइपिङ मास्टर, ३ क्यानभास गेम र बहुउपयोगी नेपाली टुलकिट।',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ne" className={`${inter.variable} ${mukta.variable}`}>
      <body className="font-sans antialiased text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}

