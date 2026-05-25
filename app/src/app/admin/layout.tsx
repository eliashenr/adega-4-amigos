import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | Adega 4 Amigos',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {children}
    </div>
  );
}
