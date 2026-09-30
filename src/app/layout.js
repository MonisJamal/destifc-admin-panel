import './globals.css';

export const metadata = {
  title: 'DestiFC - Cloud Admin Portal',
  description: 'Manage custom cards, players, database, and 3D formations directly in the cloud.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen text-neutral-900 selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
