
import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import { Lora, Fira_Code } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/layout/AppLayout';

const fontSans = GeistSans;

const fontSerif = Lora({
  variable: '--font-serif',
  subsets: ['latin'],
  display: 'swap',
});

const fontMono = Fira_Code({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'TaskMaster Dashboard | YAV Digital',
  description: 'Dashboard de Acompanhamento de Implementação YAV',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
