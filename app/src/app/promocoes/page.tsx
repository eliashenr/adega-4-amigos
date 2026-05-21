import { prisma } from '@/lib/prisma';
import { PromocoesClient } from './PromocoesClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Promocoes | Adega 4 Amigos',
  description: 'Confira as promocoes especiais da Adega 4 Amigos em Sorocaba',
};

export default async function PromocoesPage() {
  const now = new Date();

  const promotions = await prisma.promotion.findMany({
    where: {
      active: true,
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    include: {
      product: {
        include: {
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { discountPercent: 'desc' },
  });

  const promos = promotions
    .filter((p) => p.product.active)
    .map((p) => {
      const originalPrice = Number(p.product.price);
      const discount = Number(p.discountPercent);
      const promoPrice = originalPrice * (1 - discount / 100);

      return {
        id: p.id,
        title: p.title,
        description: p.description,
        productId: p.product.id,
        productName: p.product.name,
        productEmoji: p.product.emoji,
        productImage: p.product.image,
        categoryName: p.product.category.name,
        originalPrice,
        promoPrice: Math.round(promoPrice * 100) / 100,
        discountPercent: discount,
        endsAt: p.endsAt.toISOString(),
      };
    });

  return <PromocoesClient promos={promos} />;
}
