import Link from 'next/link';
import './globals.css';
export const metadata = {
  title: 'User management',
  description: 'Full-stack assignment: users and projects.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/users">
            User management
          </Link>
          <nav aria-label="Main navigation">
            <Link href="/users">Users</Link>
            <Link href="/projects">Projects</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
