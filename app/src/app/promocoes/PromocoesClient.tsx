'use client';

import { motion } from 'framer-motion';
import { Tag, ShoppingCart, Clock, Percent } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { formatBRL, cn } from '@/lib/utils';

interface Promo {
  id: number;
  title: string;
  description: string | null;
  productId: number;
  productName: string;
  productEmoji: string | null;
  productImage: string | null;
  categoryName: string;
  originalPrice: number;
  promoPrice: number;
  discountPercent: number;
  endsAt: string;
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function PromocoesClient({ promos }: { promos: Promo[] }) {
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd(p: Promo) {
    addItem({
      productId: p.productId,
      name: p.productName,
      price: p.promoPrice,
      image: p.productImage,
      emoji: p.productEmoji,
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15">
          <Tag size={28} className="text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Promocoes</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {promos.length > 0
            ? `${promos.length} oferta${promos.length > 1 ? 's' : ''} ativa${promos.length > 1 ? 's' : ''} agora`
            : 'Nenhuma promocao ativa no momento'}
        </p>
      </motion.div>

      {promos.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <Percent size={48} className="text-[var(--color-text-muted)] mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">
            Novas promocoes em breve! Fique de olho.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {promos.map((p, i) => {
            const days = daysUntil(p.endsAt);

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className={cn(
                  'relative overflow-hidden rounded-2xl',
                  'bg-[var(--color-surface)] border border-white/5',
                  'hover:border-[var(--color-primary)]/20 transition-all group'
                )}
              >
                {/* Discount badge */}
                <div className="absolute left-3 top-3 z-10 flex gap-1.5">
                  <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white shadow-lg">
                    -{p.discountPercent}%
                  </span>
                </div>

                {/* Timer badge */}
                {days <= 7 && (
                  <div className="absolute right-3 top-3 z-10">
                    <span className="flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-medium text-yellow-400">
                      <Clock size={10} />
                      {days === 0 ? 'Ultimo dia!' : `${days} dia${days > 1 ? 's' : ''}`}
                    </span>
                  </div>
                )}

                {/* Product visual */}
                <div className="flex h-40 items-center justify-center bg-[var(--color-surface-2)]">
                  <span className="text-7xl select-none transition-transform group-hover:scale-110 duration-300">
                    {p.productEmoji || '🏷️'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] font-medium text-[var(--color-primary)] uppercase tracking-wide">
                      {p.categoryName}
                    </span>
                    <h3 className="text-sm font-semibold text-[var(--color-text)] mt-0.5 line-clamp-1">
                      {p.title}
                    </h3>
                    {p.description && (
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] line-through">
                        {formatBRL(p.originalPrice)}
                      </p>
                      <p className="text-xl font-bold text-[var(--color-primary)]">
                        {formatBRL(p.promoPrice)}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-400">
                      Economize {formatBRL(p.originalPrice - p.promoPrice)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAdd(p)}
                    className={cn(
                      'flex w-full items-center justify-center gap-2 rounded-xl py-2.5',
                      'bg-[var(--color-primary)] text-black text-sm font-semibold',
                      'hover:bg-[var(--color-primary-dark)] active:scale-[0.97] transition-all'
                    )}
                  >
                    <ShoppingCart size={16} />
                    Adicionar ao Carrinho
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
