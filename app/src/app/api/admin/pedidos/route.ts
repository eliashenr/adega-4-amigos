import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/pedidos
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, phone: true, email: true } },
        address: true,
        items: {
          include: { product: { select: { name: true, emoji: true } } },
        },
      },
    });

    return NextResponse.json(
      orders.map((o) => ({
        id: o.id,
        status: o.status,
        subtotal: Number(o.subtotal),
        deliveryFee: Number(o.deliveryFee),
        total: Number(o.total),
        notes: o.notes,
        whatsappSent: o.whatsappSent,
        customer: {
          name: o.customer.name,
          phone: o.customer.phone,
          email: o.customer.email,
        },
        address: o.address
          ? {
              street: o.address.street,
              number: o.address.number,
              complement: o.address.complement,
              neighborhood: o.address.neighborhood,
              city: o.address.city,
            }
          : null,
        items: o.items.map((i) => ({
          productName: i.product.name,
          productEmoji: i.product.emoji,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          subtotal: Number(i.subtotal),
        })),
        createdAt: o.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }
    console.error('Admin pedidos error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
