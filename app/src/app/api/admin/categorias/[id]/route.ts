import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/categorias/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const { name, description, emoji, image, order, active } = body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(emoji !== undefined && { emoji }),
        ...(image !== undefined && { image }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao atualizar categoria' }, { status: 500 });
  }
}

// DELETE /api/admin/categorias/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const productCount = await prisma.product.count({
      where: { categoryId: parseInt(id) },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: `Categoria possui ${productCount} produto(s). Remova ou mova os produtos antes.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Categoria excluida' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao excluir categoria' }, { status: 500 });
  }
}
