import { prisma } from '@/lib/prisma';
import { CardapioClient } from './CardapioClient';
import type { CategoryFront, ProductFront } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cardápio | Adega 4 Amigos',
  description: 'Veja nosso cardápio completo de bebidas geladas e petiscos para delivery em Sorocaba.',
};

// Revalidate every 60 seconds
export const revalidate = 60;

async function getCategories(): Promise<CategoryFront[]> {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { products: { where: { active: true } } },
      },
    },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    emoji: c.emoji,
    order: c.order,
    productCount: c._count.products,
  }));
}

async function getProducts(): Promise<ProductFront[]> {
  const now = new Date();

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    include: {
      category: { select: { name: true } },
      promotions: {
        where: {
          active: true,
          startsAt: { lte: now },
          endsAt: { gte: now },
        },
        orderBy: { discountPercent: 'desc' },
        take: 1,
      },
    },
  });

  return products.map((p) => {
    const promo = p.promotions[0];
    const basePrice = Number(p.price);
    const promoPrice = promo
      ? basePrice * (1 - Number(promo.discountPercent) / 100)
      : null;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      image: p.image,
      emoji: p.emoji,
      price: promoPrice ? Math.round(promoPrice * 100) / 100 : basePrice,
      originalPrice: promoPrice ? basePrice : (p.originalPrice ? Number(p.originalPrice) : null),
      categoryId: p.categoryId,
      categoryName: p.category.name,
      active: p.active,
      featured: p.featured,
    };
  });
}

interface CardapioPageProps {
  searchParams: Promise<{ categoria?: string; promo?: string }>;
}

export default async function CardapioPage({ searchParams }: CardapioPageProps) {
  const params = await searchParams;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return (
    <CardapioClient
      categories={categories}
      products={products}
      initialCategory={params.categoria}
    />
  );
}
