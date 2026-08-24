import type { Metadata } from 'next';
import './globals.css';
import TopStrip from '@/components/TopStrip';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Distant CS | No Fear, No Favor Computational Theory',
  description: 'Resource-Agnostic Computational Theory, Systems Architecture, and Empirical Latency Audits.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="wrapper">
            <TopStrip />
            <Header />
            <Navbar />
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
