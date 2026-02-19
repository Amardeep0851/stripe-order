import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RickCart Secure Checkout',
  description: 'Secure Stripe checkout flow with Next.js + Prisma'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
