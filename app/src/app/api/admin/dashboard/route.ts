import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalProducts,
      activeProducts,
      totalCategories,
      totalPromotions,
      totalOrders,
      pendingOrders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.category.count({ where: { active: true } }),
      prisma.promotion.count({ where: { active: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
    ]);

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, phone: true } },
        items: {
          include: { product: { select: { name: true } } },
        },
      },
    });

    // Top products (products in most orders)
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topProductDetails = topProducts.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: topProducts.map(t => t.productId) } },
          select: { id: true, name: true, emoji: true, price: true },
        })
      : [];

    // Low stock alert placeholder (if stock field existed)
    const outOfStockHint = await prisma.product.count({ where: { active: false } });

    return NextResponse.json({
      stats: {
        totalProducts,
        activeProducts,
        inactiveProducts: totalProducts - activeProducts,
        totalCategories,
        totalPromotions,
        totalOrders,
        pendingOrders,
      },
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        status: o.status,
        total: Number(o.total),
        customerName: o.customer.name,
        customerPhone: o.customer.phone,
        itemCount: o.items.length,
        createdAt: o.createdAt.toISOString(),
      })),
      topProducts: topProducts.map(t => {
        const detail = topProductDetails.find(p => p.id === t.productId);
        return {
          id: t.productId,
          name: detail?.name || 'Produto',
          emoji: detail?.emoji,
          price: detail ? Number(detail.price) : 0,
          totalSold: t._sum.quantity || 0,
        };
      }),
      alerts: {
        inactiveProducts: totalProducts - activeProducts,
        pendingOrders,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
