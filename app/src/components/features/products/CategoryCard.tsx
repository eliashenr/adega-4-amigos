'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  name: string;
  slug: string;
  emoji: string;
  image?: string | null;
  itemCount: number;
  index?: number;
}

export function CategoryCard({
  name,
  slug,
  emoji,
  image,
  itemCount,
  index = 0,
}: CategoryCardProps) {
  return (
    <Link href={`/cardapio?categoria=${slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.05, 0.5), duration: 0.35 }}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'group relative overflow-hidden rounded-2xl',
          'border border-white/10',
          'hover:border-[var(--color-primary)]/40 hover:shadow-xl hover:shadow-[var(--color-primary)]/10',
          'cursor-pointer transition-all duration-300',
          image ? 'h-36 sm:h-44' : 'p-5 bg-[var(--color-surface)]'
        )}
      >
        {image ? (
          <>
            {/* Banner image — full quality, no compression */}
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
              quality={95}
              priority={index < 5}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              unoptimized
            />

            {/* Item count badge — bottom right */}
            <div className="absolute bottom-2 right-2 z-10">
              <span className="rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[10px] sm:text-xs font-medium text-white/90">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Fallback: emoji style */}
            <span
              className="absolute -right-2 -top-2 text-7xl opacity-10 transition-opacity group-hover:opacity-20 select-none"
              aria-hidden="true"
            >
              {emoji}
            </span>
            <div className="relative z-10">
              <span className="text-3xl" role="img" aria-label={name}>
                {emoji}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-[var(--color-text)]">
                {name}
              </h3>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </p>
            </div>
          </>
        )}
      </motion.div>
    </Link>
  );
}
