import './globals.css';
import { ClientShell } from './components/ClientShell';

export const metadata = {
  title: 'Markazi Darul Ifta - Bareilly Shareef | فتاویٰ پورٹل',
  description: 'Official digital platform for seeking authentic Islamic rulings, researching published works, and raising queries under Hanafi jurisprudence. Under the aegis of Imam Ahmad Raza Trust, Bareilly Shareef.',
  keywords: 'Darul Ifta, Bareilly Shareef, Fatwa, Islam, Hanafi, Fiqh, Ala Hazrat, Imam Ahmad Raza, Ask Fatwa',
  authors: [{ name: 'Markazi Darul Ifta' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ur" dir="rtl">
      <head>
        {/* We can add a link to google fonts for typography */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
