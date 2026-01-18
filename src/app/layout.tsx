import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Almarai } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import '@/styles/globals.css';

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ['arabic', 'latin'],
  variable: '--font-ibm-plex',
  display: 'swap',
});

const almarai = Almarai({
  weight: ['300', '400', '700', '800'],
  subsets: ['arabic'],
  variable: '--font-almarai',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'البيروني - Al-Biruni EDU',
  description:
    'منصة تعليمية ذكية بالذكاء الاصطناعي - AI-powered educational platform for Arabic speakers',
  keywords: [
    'تعليم',
    'ذكاء اصطناعي',
    'عربي',
    'البيروني',
    'education',
    'AI',
    'Arabic',
    'Al-Biruni',
  ],
  authors: [{ name: 'Al-Biruni EDU Team' }],
  creator: 'Al-Biruni EDU',
  publisher: 'Al-Biruni EDU',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: ['en_US'],
    url: 'https://albiruni.edu',
    siteName: 'Al-Biruni EDU',
    title: 'البيروني - منصة تعليمية ذكية',
    description: 'تعلم مع 18 وكيل ذكاء اصطناعي متخصص',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Al-Biruni EDU',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'البيروني - Al-Biruni EDU',
    description: 'منصة تعليمية ذكية بالذكاء الاصطناعي',
    images: ['/og-image.jpg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${ibmPlexArabic.variable} ${almarai.variable}`}
    >
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
