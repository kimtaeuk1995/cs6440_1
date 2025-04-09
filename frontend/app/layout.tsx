import './globals.css';
import Header from './header';

export const metadata = {
  title: 'Diabetes - Self Management Tool',
  description: 'Track and manage your diabetes effectively',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
