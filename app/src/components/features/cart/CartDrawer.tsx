'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { formatBRL, cn } from '@/lib/utils';
import { STORE } from '@/constants';
import { CartItem } from './CartItem';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

function buildWhatsAppMessage(
  items: { name: string; quantity: number; price: number }[],
  total: number
): string {
  const lines = items.map(
    (item) =>
      `- ${item.quantity}x ${item.name} (${formatBRL(item.price * item.quantity)})`
  );

  const msg = [
    `*Pedido - ${STORE.name}*`,
    '',
    ...lines,
    '',
    `*Subtotal:* ${formatBRL(total)}`,
    `*Entrega:* A combinar`,
    '',
    'Olá! Gostaria de fazer este pedido.',
  ].join('\n');

  return encodeURIComponent(msg);
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotal = useCartStore((s) => s.getTotal);

  const total = getTotal();
  const isEmpty = items.length === 0;

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

  function handleWhatsApp() {
    const message = buildWhatsAppMessage(items, total);
    window.open(`https://wa.me/${STORE.whatsapp}?text=${message}`, '_blank');
  }

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
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed inset-y-0 right-0 z-[70] w-full max-w-md',
              'bg-[var(--color-bg)] border-l border-white/5',
              'flex flex-col'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                Seu Pedido
              </h2>
              <div className="flex items-center gap-2">
                {!isEmpty && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                  >
                    Limpar
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5"
                  aria-label="Fechar carrinho"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
                    <ShoppingCart size={32} className="text-[var(--color-text-muted)]" />
                  </div>
                  <div>
                    <p className="text-[var(--color-text)] font-medium">
                      Carrinho vazio
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      Adicione produtos para continuar
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <CartItem key={item.productId} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {!isEmpty && (
              <div className="border-t border-white/5 px-5 py-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Subtotal</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {formatBRL(total)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Entrega</span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    A calcular
                  </span>
                </div>
                <div className="flex items-center justify-between text-base pt-2 border-t border-white/5">
                  <span className="font-semibold text-[var(--color-text)]">Total</span>
                  <span className="font-bold text-[var(--color-primary)] text-lg">
                    {formatBRL(total)}
                  </span>
                </div>

                <button
                  onClick={handleWhatsApp}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-xl py-3.5',
                    'bg-[var(--color-whatsapp)] text-white font-semibold text-sm',
                    'hover:brightness-110 active:scale-[0.98]',
                    'transition-all duration-150'
                  )}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Finalizar via WhatsApp
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
