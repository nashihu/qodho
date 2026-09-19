import './globals.css';
import AuthProvider from '../components/AuthProvider';

export const metadata = {
  title: 'Qodho Tracker - Aplikasi Hitung dan Pelunas Hutang Sholat Fardhu',
  description: 'Aplikasi prototype pelacak qodho sholat fardhu lifetime dan karena udzur, dilengkapi artikel panduan sholat dan sholat tasbih.',
  keywords: ['qodho sholat', 'sholat fardhu', 'sholat tasbih', 'hitung qodho', 'bacaan sholat'],
  authors: [{ name: 'Qodho App Team' }],
  openGraph: {
    title: 'Qodho Tracker - Aplikasi Hitung & Pelunas Sholat Fardhu',
    description: 'Catat dan lunasi utang sholat fardhu secara terstruktur.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-slate-900 text-slate-400 text-xs text-center py-6 border-t border-slate-800">
            <div className="max-w-6xl mx-auto px-4 space-y-1">
              <p className="font-semibold text-slate-300">Qodho Sholat Prototype &copy; 2026</p>
              <p className="text-slate-500">Aplikasi bantu hitung & lunasi utang sholat fardhu. Tetap niat dan istiqomah.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
