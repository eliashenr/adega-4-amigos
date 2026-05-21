import Link from 'next/link';
import { STORE } from '@/constants';
import { cn } from '@/lib/utils';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('bg-[var(--color-surface)] border-t border-white/5')}>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Store info */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]">
                <span className="text-xs font-bold text-black">4A</span>
              </div>
              <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] bg-clip-text font-bold text-transparent">
                {STORE.name}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {STORE.address}
              <br />
              {STORE.city} - {STORE.state}
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {STORE.phone}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
              Links
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Cardápio', href: '/cardapio' },
                { label: 'Promoções', href: '/promocoes' },
                { label: 'Localização', href: '/localizacao' },
                { label: 'Minha Conta', href: '/conta' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
              Horários
            </h3>
            <ul className="space-y-1.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex justify-between">
                <span>Seg - Sex</span>
                <span>{STORE.hours.weekdays.open} - {STORE.hours.weekdays.close}</span>
              </li>
              <li className="flex justify-between">
                <span>Sábado</span>
                <span>{STORE.hours.saturday.open} - {STORE.hours.saturday.close}</span>
              </li>
              <li className="flex justify-between">
                <span>Domingo</span>
                <span>{STORE.hours.sunday.open} - {STORE.hours.sunday.close}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-[var(--color-text-muted)]">
          &copy; {currentYear} {STORE.name}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
