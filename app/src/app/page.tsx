import { prisma } from '@/lib/prisma';
import { HomeClient } from './HomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Adega 4 Amigos | Delivery de Bebidas em Sorocaba',
  description:
    'Delivery de bebidas geladas em Sorocaba. Cervejas, gins, whiskies, vodkas e petiscos com entrega rápida.',
};

export const dynamic = 'force-dynamic';

async function getHomeData() {
  const now = new Date();

  const [categories, promos] = await Promise.all([
    prisma.category.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: { where: { active: true } } },
        },
      },
    }),
    prisma.promotion.findMany({
      where: {
        active: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            emoji: true,
            price: true,
            image: true,
          },
        },
      },
      orderBy: { discountPercent: 'desc' },
      take: 6,
    }),
  ]);

  return {
    categories: categories.map((c) => ({
      id: String(c.id),
      name: c.name,
      slug: c.slug,
      emoji: c.emoji || '📦',
      image: c.image,
      itemCount: c._count.products,
    })),
    promos: promos.map((p) => {
      const basePrice = Number(p.product.price);
      const discountedPrice =
        basePrice * (1 - Number(p.discountPercent) / 100);
      return {
        id: String(p.product.id),
        name: p.product.name,
        emoji: p.product.emoji || '🍷',
        originalPrice: basePrice,
        price: Math.round(discountedPrice * 100) / 100,
        tag: p.title,
        image: p.product.image,
      };
    }),
  };
}

export default async function Home() {
  const { categories, promos } = await getHomeData();

  return <HomeClient categories={categories} promos={promos} />;
}
