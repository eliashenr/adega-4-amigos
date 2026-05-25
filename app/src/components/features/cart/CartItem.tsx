'use client';

import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { formatBRL, cn } from '@/lib/utils';
import type { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const lineTotal = item.price * item.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 rounded-xl bg-[var(--color-surface-2)] p-3"
    >
      {/* Emoji / image */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/5">
        <span className="text-2xl select-none">
          {item.emoji ?? '📦'}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-[var(--color-text)] line-clamp-2 leading-snug">
            {item.name}
          </h4>
          <button
            onClick={() => removeItem(item.productId)}
            className="shrink-0 rounded-md p-1 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-danger)] transition-colors"
            aria-label={`Remover ${item.name}`}
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg',
                'bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10 transition-colors'
              )}
              aria-label="Diminuir quantidade"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-medium text-[var(--color-text)]">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg',
                'bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10 transition-colors'
              )}
              aria-label="Aumentar quantidade"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-muted)]">
              {formatBRL(item.price)} un.
            </p>
            <p className="text-sm font-semibold text-[var(--color-primary)]">
              {formatBRL(lineTotal)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
