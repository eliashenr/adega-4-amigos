'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Flame } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { formatBRL, cn } from '@/lib/utils';

interface PromoCardProps {
  id: string;
  name: string;
  emoji: string;
  originalPrice: number;
  price: number;
  tag: string;
  index?: number;
}

export function PromoCard({
  id,
  name,
  emoji,
  originalPrice,
  price,
  tag,
  index = 0,
}: PromoCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

  function handleAddToCart() {
    addItem({
      productId: Number(id),
      name,
      price,
      image: null,
      emoji,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn(
        'relative flex w-60 shrink-0 flex-col overflow-hidden rounded-2xl',
        'bg-[var(--color-surface)] border border-white/[0.06]',
        'hover:border-[var(--color-primary)]/25 hover:shadow-xl hover:shadow-black/30',
        'hover:-translate-y-0.5 transition-all duration-300',
        'snap-start'
      )}
    >
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex gap-1.5">
        <span className="flex items-center gap-1 rounded-full bg-[var(--color-danger)] px-2.5 py-0.5 text-[10px] font-bold uppercase text-white shadow-lg shadow-red-900/30">
          <Flame size={10} /> Promo
        </span>
        {tag && (
          <span className="rounded-full bg-[var(--color-primary)] px-2.5 py-0.5 text-[10px] font-bold text-black shadow-lg shadow-[var(--color-primary)]/30">
            {tag}
          </span>
        )}
      </div>

      {/* Discount badge */}
      <div className="absolute right-3 top-3 z-10">
        <span className="rounded-full bg-[var(--color-success)] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-green-900/30">
          -{discount}%
        </span>
      </div>

      {/* Emoji area with gradient */}
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-red-900/30 via-orange-900/15 to-red-950/30 overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }} />
        {/* Glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-white/[0.04] blur-2xl" />
        </div>
        <span className="relative text-7xl select-none drop-shadow-lg" role="img" aria-label={name}>
          {emoji}
        </span>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--color-surface)] to-transparent" />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)] line-clamp-2 leading-snug">
          {name}
        </h3>

        <div className="mt-auto flex items-end gap-2">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] line-through decoration-red-400/50">
              {formatBRL(originalPrice)}
            </p>
            <p className="text-lg font-bold text-[var(--color-success)]">
              {formatBRL(price)}
            </p>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className={cn(
            'mt-1 flex items-center justify-center gap-2 rounded-xl py-2.5',
            'bg-[var(--color-primary)] text-black text-sm font-semibold',
            'hover:bg-[var(--color-primary-dark)] active:scale-[0.97]',
            'shadow-lg shadow-[var(--color-primary)]/20',
            'transition-all duration-200'
          )}
        >
          <ShoppingCart size={16} />
          Adicionar
        </button>
      </div>
    </motion.div>
  );
}
