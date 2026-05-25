'use client';

import { motion } from 'framer-motion';
import { Clock, MapPin, Truck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { STORE } from '@/constants';
import { CategoryCard } from '@/components/features/products/CategoryCard';
import { PromoCard } from '@/components/features/products/PromoCard';

function isStoreOpen(): boolean {
  const now = new Date();
  const day = now.getDay();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  let hours: { open: string; close: string };
  if (day === 0) hours = STORE.hours.sunday;
  else if (day === 6) hours = STORE.hours.saturday;
  else hours = STORE.hours.weekdays;

  return time >= hours.open && time <= hours.close;
}

interface HomeClientProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    emoji: string;
    image: string | null;
    itemCount: number;
  }[];
  promos: {
    id: string;
    name: string;
    emoji: string;
    originalPrice: number;
    price: number;
    tag: string;
    image: string | null;
  }[];
}

export function HomeClient({ categories, promos }: HomeClientProps) {
  const open = isStoreOpen();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, var(--color-primary), transparent)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] shadow-lg shadow-[var(--color-primary)]/20"
          >
            <span className="text-3xl font-black text-black">4A</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] bg-clip-text text-4xl font-black text-transparent sm:text-5xl"
          >
            Adega 4 Amigos
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-3 text-base text-[var(--color-text-muted)] sm:text-lg"
          >
            Delivery de bebidas geladas em Sorocaba
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
          >
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
                open
                  ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                  : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  open ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'
                )}
              />
              {open ? 'Aberto agora' : 'Fechado'}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-[var(--color-text-muted)]">
              <Clock size={12} />
              30-50 min
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-[var(--color-text-muted)]">
              <MapPin size={12} />
              {STORE.city}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-[var(--color-text-muted)]">
              <Truck size={12} />
              A partir de R$&nbsp;5,00
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-8"
          >
            <Link
              href="/cardapio"
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-6 py-3',
                'bg-[var(--color-primary)] text-black font-semibold text-sm',
                'hover:bg-[var(--color-primary-dark)] active:scale-[0.97]',
                'transition-all duration-150 shadow-lg shadow-[var(--color-primary)]/20'
              )}
            >
              Ver Cardápio
              <ChevronRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-text)]">Categorias</h2>
          <Link
            href="/cardapio"
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            Ver todas
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              name={cat.name}
              slug={cat.slug}
              emoji={cat.emoji}
              image={cat.image}
              itemCount={cat.itemCount}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Promos */}
      {promos.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              Ofertas do Dia
            </h2>
            <Link
              href="/cardapio?promo=1"
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              Ver todas
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
            {promos.map((promo, i) => (
              <PromoCard
                key={promo.id}
                id={promo.id}
                name={promo.name}
                emoji={promo.emoji}
                originalPrice={promo.originalPrice}
                price={promo.price}
                tag={promo.tag}
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
