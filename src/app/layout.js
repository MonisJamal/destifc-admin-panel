import './globals.css';

export const metadata = {
  title: 'DestiFC Admin Portal',
  description: 'Manage custom cards, players, database, drop rates, and bot configuration directly in the cloud.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="antialiased min-h-screen bg-[#0d0914] text-neutral-100 selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
        {children}
      </body>
    </html>
  );
}
