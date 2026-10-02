import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Suchi — Life Operating System',
  description: 'Suchi — Autonomous AI Chief of Staff & Life Operating System. Minimum attention, maximum life clarity.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon-192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Suchi',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Suchi" />
        <meta name="apple-mobile-web-app-title" content="Suchi" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=window.location.pathname;var d=false;if(p.startsWith('/admin')){var a=localStorage.getItem('admin_theme');d=a?a==='dark':true;}else{var u=localStorage.getItem('suchi_theme');d=u?u==='dark':(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);}if(d){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">{children}</body>
    </html>
  );
}

