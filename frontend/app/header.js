import './globals.css';
import Header from './header';
export const metadata = {
  title: 'Diabetes - Self Management Tool',
  description: 'Self-management app for diabetes tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}