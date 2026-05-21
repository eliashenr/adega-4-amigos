import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireCustomer } from '@/lib/customer-auth';

// GET /api/conta/pedidos — List customer's own orders
export async function GET() {
  try {
    const payload = await requireCustomer();

    const orders = await prisma.order.findMany({
      where: { customerId: payload.id },
      orderBy: { createdAt: 'desc' },
      include: {
        address: true,
        items: {
          include: {
            product: {
              select: { name: true, emoji: true },
            },
          },
        },
      },
    });

    const formatted = orders.map((o) => ({
      id: o.id,
      status: o.status,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      total: Number(o.total),
      notes: o.notes,
      address: o.address
        ? {
            street: o.address.street,
            number: o.address.number,
            complement: o.address.complement,
            neighborhood: o.address.neighborhood,
            city: o.address.city,
          }
        : null,
      items: o.items.map((item) => ({
        productName: item.product.name,
        productEmoji: item.product.emoji,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
      createdAt: o.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
}
