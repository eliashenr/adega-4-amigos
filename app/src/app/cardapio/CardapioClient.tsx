'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/features/products/ProductCard';
import type { CategoryFront, ProductFront } from '@/types';

interface CardapioClientProps {
  categories: CategoryFront[];
  products: ProductFront[];
  initialCategory?: string;
}

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'name';

const SORT_LABELS: Record<SortOption, string> = {
  relevance: 'Relevância',
  price_asc: 'Menor preço',
  price_desc: 'Maior preço',
  name: 'A-Z',
};

export function CardapioClient({
  categories,
  products,
  initialCategory,
}: CardapioClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialCategory || null
  );
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('relevance');
  const [showSort, setShowSort] = useState(false);

  const filtered = useMemo(() => {
    let result = products;

    // Filter by category
    if (activeCategory) {
      const cat = categories.find((c) => c.slug === activeCategory);
      if (cat) {
        result = result.filter((p) => p.categoryId === cat.id);
      }
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sort) {
      case 'price_asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'relevance':
      default:
        // Featured first, then promos, then rest
        result = [...result].sort((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          const aPromo = a.originalPrice && a.originalPrice > a.price;
          const bPromo = b.originalPrice && b.originalPrice > b.price;
          if (aPromo !== bPromo) return aPromo ? -1 : 1;
          return 0;
        });
        break;
    }

    return result;
  }, [products, categories, activeCategory, search, sort]);

  const activeCatData = activeCategory
    ? categories.find((c) => c.slug === activeCategory)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
          Cardápio
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {products.length} produtos disponíveis
        </p>
      </div>

      {/* Search + Sort bar */}
      <div className="mb-5 flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              'w-full rounded-xl py-2.5 pl-9 pr-9 text-sm',
              'bg-[var(--color-surface)] border border-white/5',
              'text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]',
              'focus:outline-none focus:border-[var(--color-primary)]/40',
              'transition-colors'
            )}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className={cn(
              'flex h-full items-center gap-1.5 rounded-xl px-3',
              'bg-[var(--color-surface)] border border-white/5',
              'text-sm text-[var(--color-text-muted)]',
              'hover:border-[var(--color-primary)]/30 transition-colors',
              showSort && 'border-[var(--color-primary)]/40'
            )}
          >
            <ArrowUpDown size={14} />
            <span className="hidden sm:inline">{SORT_LABELS[sort]}</span>
          </button>

          <AnimatePresence>
            {showSort && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'absolute right-0 top-full z-30 mt-1 min-w-[160px]',
                  'rounded-xl bg-[var(--color-surface)] border border-white/10',
                  'shadow-xl shadow-black/40 overflow-hidden'
                )}
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSort(key);
                      setShowSort(false);
                    }}
                    className={cn(
                      'flex w-full items-center px-4 py-2.5 text-sm transition-colors',
                      sort === key
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium'
                        : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
                    )}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Category pills */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
            !activeCategory
              ? 'bg-[var(--color-primary)] text-black shadow-md shadow-[var(--color-primary)]/20'
              : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-white/5 hover:border-[var(--color-primary)]/30 hover:text-[var(--color-text)]'
          )}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              setActiveCategory(activeCategory === cat.slug ? null : cat.slug)
            }
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              activeCategory === cat.slug
                ? 'bg-[var(--color-primary)] text-black shadow-md shadow-[var(--color-primary)]/20'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-white/5 hover:border-[var(--color-primary)]/30 hover:text-[var(--color-text)]'
            )}
          >
            {cat.emoji && <span className="mr-1.5">{cat.emoji}</span>}
            {cat.name}
            {cat.productCount != null && (
              <span className="ml-1.5 text-xs opacity-60">
                {cat.productCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active category description */}
      <AnimatePresence mode="wait">
        {activeCatData && activeCatData.description && (
          <motion.div
            key={activeCatData.slug}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 px-4 py-3">
              <p className="text-sm text-[var(--color-text-muted)]">
                {activeCatData.emoji && (
                  <span className="mr-2 text-lg">{activeCatData.emoji}</span>
                )}
                {activeCatData.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 mb-4">
            <Search size={24} className="text-[var(--color-text-muted)]" />
          </div>
          <p className="text-[var(--color-text)] font-medium">
            Nenhum produto encontrado
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Tente buscar por outro termo ou selecione outra categoria
          </p>
          {(search || activeCategory) && (
            <button
              onClick={() => {
                setSearch('');
                setActiveCategory(null);
              }}
              className="mt-4 text-sm text-[var(--color-primary)] hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {(search || activeCategory) && filtered.length > 0 && (
        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          {filtered.length} {filtered.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          {activeCategory && activeCatData && ` em ${activeCatData.name}`}
          {search && ` para "${search}"`}
        </p>
      )}
    </div>
  );
}
