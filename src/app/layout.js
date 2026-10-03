import './globals.css';

export const metadata = {
  title: 'DestiFC Admin Portal',
  description: 'Manage custom cards, players, database, drop rates, and bot configuration directly in the cloud.',
  referrer: 'no-referrer',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
        {children}
      </body>
    </html>
  );
}
