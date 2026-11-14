import type { Metadata, Viewport } from 'next';
import { Inter, Mukta } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { StructuredData } from '@/components/seo/StructuredData';

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://uni-code-preeti-convertor.vercel.app';

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'नेपाली अनुवादक, बृहत् शब्दकोश र टाइपिङ मास्टर | Unicode to Preeti Converter',
    template: '%s | नेपाली अनुवादक र टुलकिट',
  },
  description:
    'नेपालको नम्बर १ अनलाइन नेपाली युनिकोड ↔ प्रिती अनुवादक, १,२३,०००+ बृहत् शब्दकोश, १५-तह टाइपिङ मास्टर प्रो, क्यानभास गेमहरू, वर्ड/एक्सेल रूपान्तरण, र बहुउपयोगी नेपाली टुलकिट।',
  keywords: [
    'Nepali Unicode to Preeti',
    'Preeti to Unicode converter',
    'युनिकोड प्रिती अनुवादक',
    'Nepali Typing Master Pro',
    'नेपाली टाइपिङ मास्टर',
    'Nepali Brihat Sabdakosh',
    'नेपाली बृहत् शब्दकोश',
    'नेपाली हिज्जे जाँच',
    'Typeshala game online',
    'टाइपशाला गेम',
    'Preeti font download',
    'Nepali Romanized typing',
    'Kantipur to Unicode',
    'Nepali date converter',
    'नेपाली मिति रूपान्तरण',
    'Number to words Nepali',
    'अङ्क र अक्षर रूपान्तरण',
  ],
  authors: [{ name: 'Som The Hit' }],
  creator: 'Som The Hit',
  publisher: 'Nepali Technology & Language Initiative',
  applicationName: 'नेपाली डिजिटल अनुवादक र टुलकिट',
  category: 'Utilities & Education',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'नेपाली अनुवादक, बृहत् शब्दकोश र टाइपिङ मास्टर (Nepali Unicode ↔ Preeti)',
    description:
      'नेपालको नम्बर १ अनलाइन नेपाली युनिकोड र प्रिती अनुवादक, १,२३,०००+ शब्दकोश, १५-तह टाइपिङ मास्टर र टुलकिट।',
    url: siteUrl,
    siteName: 'नेपाली डिजिटल अनुवादक र टुलकिट',
    locale: 'ne_NP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'नेपाली अनुवादक, बृहत् शब्दकोश र टाइपिङ मास्टर',
    description:
      'नेपालको नम्बर १ अनलाइन नेपाली युनिकोड र प्रिती अनुवादक, १,२३,०००+ शब्दकोश, १५-तह टाइपिङ मास्टर र टुलकिट।',
    creator: '@somthehit',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="ne" className={`${inter.variable} ${mukta.variable}`}>
      <head>
        <StructuredData />
        {adsenseClientId && (
          <Script
            id="google-adsense"
            async
            strategy="lazyOnload"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          />
        )}
      </head>
      <body className="font-sans antialiased text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
