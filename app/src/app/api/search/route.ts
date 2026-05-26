import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/search?q=... — Search products
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 8,
      select: {
        id: true,
        name: true,
        emoji: true,
        slug: true,
        price: true,
        category: { select: { slug: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        emoji: p.emoji,
        slug: p.slug,
        price: Number(p.price),
        categorySlug: p.category.slug,
      }))
    );
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json([]);
  }
}
