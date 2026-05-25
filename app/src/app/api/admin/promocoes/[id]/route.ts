import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/promocoes/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const { title, description, productId, discountPercent, startsAt, endsAt, active } = body;

    const promotion = await prisma.promotion.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(productId !== undefined && { productId: parseInt(productId) }),
        ...(discountPercent !== undefined && { discountPercent: parseFloat(discountPercent) }),
        ...(startsAt !== undefined && { startsAt: new Date(startsAt) }),
        ...(endsAt !== undefined && { endsAt: new Date(endsAt) }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json(promotion);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao atualizar promocao' }, { status: 500 });
  }
}

// DELETE /api/admin/promocoes/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.promotion.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Promocao excluida' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao excluir promocao' }, { status: 500 });
  }
}
