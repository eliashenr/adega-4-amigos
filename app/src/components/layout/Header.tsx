'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cart';
import { cn } from '@/lib/utils';
import { MobileMenu } from './MobileMenu';
import { CartDrawer } from '@/components/features/cart/CartDrawer';

const SEARCH_PRODUCTS = [
  { id: 1, name: 'Heineken 330ml', emoji: '🍺', slug: 'cervejas' },
  { id: 2, name: 'Brahma 350ml', emoji: '🍺', slug: 'cervejas' },
  { id: 3, name: 'Coca-Cola 2L', emoji: '🥤', slug: 'refrigerantes' },
  { id: 4, name: 'Tanqueray 750ml', emoji: '🍸', slug: 'gin' },
  { id: 5, name: 'Jack Daniels 1L', emoji: '🥃', slug: 'whisky' },
  { id: 6, name: 'Smirnoff 998ml', emoji: '🍹', slug: 'vodka' },
  { id: 7, name: 'Amendoim Japonês', emoji: '🥜', slug: 'petiscos' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const itemCount = useCartStore((s) => s.getItemCount());

  const filteredProducts = searchQuery.trim().length >= 2
    ? SEARCH_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
      setSearchOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 h-16',
          'bg-[var(--color-bg)]/80 backdrop-blur-xl',
          'border-b border-white/5'
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4">
          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/5 md:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>

            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]">
                <span className="text-sm font-bold text-black">4A</span>
              </div>
              <span className="hidden bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] bg-clip-text text-lg font-bold text-transparent sm:inline">
                Adega 4 Amigos
              </span>
            </Link>
          </div>

          {/* Center: search (desktop) */}
          <div ref={searchRef} className="relative hidden flex-1 max-w-md md:block">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                className={cn(
                  'w-full rounded-full py-2 pl-10 pr-4 text-sm',
                  'bg-[var(--color-surface)] text-[var(--color-text)]',
                  'placeholder:text-[var(--color-text-muted)]',
                  'border border-white/5 outline-none',
                  'focus:border-[var(--color-primary)]/40 focus:ring-1 focus:ring-[var(--color-primary)]/20',
                  'transition-colors'
                )}
              />
            </div>

            <AnimatePresence>
              {searchOpen && filteredProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden',
                    'bg-[var(--color-surface)] border border-white/10 shadow-xl'
                  )}
                >
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/cardapio?categoria=${product.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <span className="text-lg">{product.emoji}</span>
                      <span className="text-sm text-[var(--color-text)]">
                        {product.name}
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: cart + account */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/5 transition-colors"
              aria-label="Abrir carrinho"
            >
              <ShoppingCart size={22} />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className={cn(
                      'absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center',
                      'rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-black'
                    )}
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <Link
              href="/conta"
              className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-white/5 transition-colors"
              aria-label="Minha conta"
            >
              <User size={22} />
            </Link>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
