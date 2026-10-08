import './globals.css';
import AuthProvider from '../components/AuthProvider';
import { UserGuardProvider } from '../context/UserGuardContext';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'httpx://qodho.netlify.app';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Qodho Tracker - Aplikasi Hitung dan Pelunas Hutang Sholat Fardhu',
  description: 'Catat dan lunasi utang sholat fardhu secara terstruktur. Dilengkapi kalkulator qodho lifetime dan catatan udzur.',
  keywords: ['qodho sholat', 'sholat fardhu', 'sholat tasbih', 'hitung qodho', 'bacaan sholat', 'pelunas utang sholat'],
  authors: [{ name: 'Qodho App Team' }],
  icons: {
    icon: '/sholat.jpg',
    shortcut: '/sholat.jpg',
    apple: '/sholat.jpg',
  },
  openGraph: {
    title: 'Qodho Tracker - Aplikasi Hitung & Pelunas Sholat Fardhu',
    description: 'Catat dan lunasi utang sholat fardhu secara terstruktur.',
    url: siteUrl,
    siteName: 'Qodho Tracker',
    images: [
      {
        url: '/sholat.jpg',
        width: 1200,
        height: 630,
        alt: 'Qodho Tracker - Aplikasi Hitung & Pelunas Sholat Fardhu',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qodho Tracker - Aplikasi Hitung & Pelunas Sholat Fardhu',
    description: 'Catat dan lunasi utang sholat fardhu secara terstruktur.',
    images: ['/sholat.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <UserGuardProvider>
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-slate-900 text-slate-400 text-xs text-center py-6 border-t border-slate-800">
              <div className="max-w-6xl mx-auto px-4 space-y-1">
                <p className="font-semibold text-slate-300">Qodho Sholat &copy; 2026</p>
                <p className="text-slate-500">Aplikasi bantu hitung & lunasi utang sholat fardhu. Tetap niat dan istiqomah.</p>
              </div>
            </footer>
          </UserGuardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
