import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/promocoes
export async function GET() {
  try {
    await requireAdmin();

    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, emoji: true, price: true } },
      },
    });

    return NextResponse.json(
      promotions.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        productId: p.productId,
        productName: p.product.name,
        productEmoji: p.product.emoji,
        productPrice: Number(p.product.price),
        discountPercent: Number(p.discountPercent),
        active: p.active,
        startsAt: p.startsAt.toISOString(),
        endsAt: p.endsAt.toISOString(),
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST /api/admin/promocoes
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { title, description, productId, discountPercent, startsAt, endsAt } = body;

    if (!title || !productId || !discountPercent || !startsAt || !endsAt) {
      return NextResponse.json({ error: 'Campos obrigatorios faltando' }, { status: 400 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        title,
        description: description || null,
        productId: parseInt(productId),
        discountPercent: parseFloat(discountPercent),
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
      },
      include: {
        product: { select: { name: true } },
      },
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }
    console.error('Create promo error:', error);
    return NextResponse.json({ error: 'Erro ao criar promocao' }, { status: 500 });
  }
}
