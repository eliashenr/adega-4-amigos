import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/produtos/[id] — Update product
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const { name, description, emoji, price, originalPrice, categoryId, featured, active, image } = body;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(emoji !== undefined && { emoji }),
        ...(image !== undefined && { image }),
        ...(price !== undefined && { price }),
        ...(originalPrice !== undefined && { originalPrice }),
        ...(categoryId !== undefined && { categoryId: parseInt(categoryId) }),
        ...(featured !== undefined && { featured }),
        ...(active !== undefined && { active }),
      },
      include: { category: { select: { name: true } } },
    });

    return NextResponse.json({
      ...product,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }
}

// DELETE /api/admin/produtos/[id] — Delete product
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if product has order items
    const orderItems = await prisma.orderItem.count({
      where: { productId: parseInt(id) },
    });

    if (orderItems > 0) {
      // Soft delete
      await prisma.product.update({
        where: { id: parseInt(id) },
        data: { active: false },
      });
      return NextResponse.json({ message: 'Produto desativado (possui historico de pedidos)' });
    }

    // Hard delete
    await prisma.product.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Produto excluido' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 });
  }
}
