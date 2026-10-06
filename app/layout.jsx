import { Bungee, Space_Grotesk, Space_Mono } from 'next/font/google';
import './globals.css';

const bungee = Bungee({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bungee',
  display: 'swap',
});
const grotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
  display: 'swap',
});
const mono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono-x',
  display: 'swap',
});

export const metadata = {
  title: 'TROSC · IT Challenge',
  description:
    'A monster-battle quiz game for freshmen at Suez Canal University.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#140A0E',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bungee.variable} ${grotesk.variable} ${mono.variable}`}
    >
      <body>
        <div className="bg-grid" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
