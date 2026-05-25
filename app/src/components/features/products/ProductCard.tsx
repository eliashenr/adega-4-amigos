'use client';

import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/stores/cart';
import { formatBRL, cn } from '@/lib/utils';
import type { ProductFront } from '@/types';

interface ProductCardProps {
  product: ProductFront;
  index?: number;
}

// Gradient backgrounds by category emoji for a premium feel
const EMOJI_GRADIENTS: Record<string, string> = {
  '🍺': 'from-amber-900/40 via-yellow-900/20 to-amber-950/40',
  '🍷': 'from-rose-900/40 via-red-900/20 to-rose-950/40',
  '🥃': 'from-orange-900/40 via-amber-900/20 to-orange-950/40',
  '🍸': 'from-emerald-900/30 via-teal-900/20 to-emerald-950/40',
  '🍹': 'from-pink-900/30 via-rose-900/20 to-pink-950/40',
  '🥤': 'from-red-900/30 via-orange-900/20 to-red-950/40',
  '⚡': 'from-cyan-900/30 via-blue-900/20 to-cyan-950/40',
  '🧊': 'from-sky-900/30 via-blue-900/20 to-sky-950/40',
  '🚬': 'from-stone-800/40 via-gray-900/20 to-stone-950/40',
  '💨': 'from-violet-900/30 via-purple-900/20 to-violet-950/40',
  '📜': 'from-lime-900/30 via-green-900/20 to-lime-950/40',
  '🎁': 'from-yellow-900/30 via-amber-900/20 to-yellow-950/40',
  '🍫': 'from-amber-800/40 via-orange-900/20 to-amber-950/40',
};

function getGradient(emoji: string | null) {
  if (!emoji) return 'from-zinc-800/40 via-zinc-900/20 to-zinc-950/40';
  return EMOJI_GRADIENTS[emoji] || 'from-zinc-800/40 via-zinc-900/20 to-zinc-950/40';
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const cartItem = items.find((i) => i.productId === product.id);
  const [justAdded, setJustAdded] = useState(false);

  const hasPromo = product.originalPrice && product.originalPrice > product.price;
  const discount = hasPromo
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      emoji: product.emoji,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
  }

  const gradient = getGradient(product.emoji);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.35 }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl',
        'bg-[var(--color-surface)] border border-white/[0.06]',
        'hover:border-[var(--color-primary)]/25 hover:shadow-xl hover:shadow-black/30',
        'hover:-translate-y-0.5',
        'transition-all duration-300'
      )}
    >
      {/* Badges */}
      {hasPromo && (
        <div className="absolute left-2.5 top-2.5 z-10 flex gap-1.5">
          <span className="rounded-full bg-[var(--color-danger)] px-2.5 py-0.5 text-[10px] font-bold uppercase text-white shadow-lg shadow-red-900/30">
            Promo
          </span>
          <span className="rounded-full bg-[var(--color-success)] px-2 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-green-900/30">
            -{discount}%
          </span>
        </div>
      )}

      {product.featured && !hasPromo && (
        <div className="absolute left-2.5 top-2.5 z-10">
          <span className="rounded-full bg-[var(--color-primary)] px-2.5 py-0.5 text-[10px] font-bold text-black shadow-lg shadow-[var(--color-primary)]/30">
            Destaque
          </span>
        </div>
      )}

      {/* Image / Emoji area — premium gradient background */}
      <div className={cn(
        'relative flex h-36 sm:h-40 items-center justify-center overflow-hidden',
        'bg-gradient-to-br', gradient
      )}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }} />

        {/* Glow effect behind emoji */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-white/[0.04] blur-2xl" />
        </div>

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span
            className={cn(
              'relative text-6xl sm:text-7xl select-none',
              'drop-shadow-lg',
              'transition-transform duration-300 group-hover:scale-110'
            )}
            role="img"
            aria-label={product.name}
          >
            {product.emoji || '🍷'}
          </span>
        )}

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--color-surface)] to-transparent" />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        {/* Category label */}
        {product.categoryName && (
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-primary)]/70">
            {product.categoryName}
          </p>
        )}

        <h3 className="text-xs sm:text-sm font-semibold text-[var(--color-text)] line-clamp-2 leading-snug min-h-[2.5em]">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)] line-clamp-1">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <div>
            {hasPromo && (
              <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)] line-through decoration-red-400/50">
                {formatBRL(product.originalPrice!)}
              </p>
            )}
            <p className={cn(
              'text-base sm:text-lg font-bold',
              hasPromo ? 'text-[var(--color-success)]' : 'text-[var(--color-primary)]'
            )}>
              {formatBRL(product.price)}
            </p>
          </div>

          {/* Add / Qty controls */}
          {cartItem ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  'bg-white/5 text-[var(--color-text-muted)]',
                  'hover:bg-white/10 active:scale-90 transition-all'
                )}
                aria-label="Diminuir quantidade"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-bold text-[var(--color-text)]">
                {cartItem.quantity}
              </span>
              <button
                onClick={handleAdd}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  'bg-[var(--color-primary)] text-black',
                  'hover:bg-[var(--color-primary-dark)] active:scale-90 transition-all'
                )}
                aria-label="Aumentar quantidade"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.85 }}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl',
                'bg-[var(--color-primary)] text-black',
                'hover:bg-[var(--color-primary-dark)]',
                'shadow-lg shadow-[var(--color-primary)]/20',
                'transition-all duration-200',
                justAdded && 'ring-2 ring-[var(--color-primary)]/50 scale-110'
              )}
              aria-label={`Adicionar ${product.name} ao carrinho`}
            >
              <ShoppingCart size={16} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
