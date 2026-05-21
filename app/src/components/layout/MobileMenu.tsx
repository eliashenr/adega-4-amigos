'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Wine, Tag, ShoppingCart, User, MapPin, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { label: 'Cardápio', href: '/cardapio', icon: Wine },
  { label: 'Promoções', href: '/promocoes', icon: Tag },
  { label: 'Meu Carrinho', href: '#', icon: ShoppingCart },
  { label: 'Minha Conta', href: '/conta', icon: User },
  { label: 'Localização', href: '/localizacao', icon: MapPin },
  { label: 'Área de Entrega', href: '/#area-entrega', icon: Truck },
];

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed inset-y-0 left-0 z-[70] w-72',
              'bg-[var(--color-surface)] border-r border-white/5',
              'flex flex-col'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]">
                  <span className="text-sm font-bold text-black">4A</span>
                </div>
                <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] bg-clip-text font-bold text-transparent">
                  Adega 4 Amigos
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-2">
              {MENU_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-5 py-3.5',
                        'text-[var(--color-text)] hover:bg-white/5 transition-colors'
                      )}
                    >
                      <Icon size={18} className="text-[var(--color-primary)]" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
