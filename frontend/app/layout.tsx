'use client'; 
import { ReactNode } from 'react';
import './globals.css';
import Header from './header'; // ✅ import your Header component

export const metadata = {
  title: 'Diabetes - Self Management Tool',
  description: 'Track and manage your diabetes effectively',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header /> {/* ✅ this will render the title/header */}
        {children}
      </body>
    </html>
  );
}