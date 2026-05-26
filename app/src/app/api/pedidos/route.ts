import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomerFromCookie } from '@/lib/customer-auth';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { createOrderSchema, validateBody } from '@/lib/validations';

// POST /api/pedidos — Create order (persists to DB)
export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 orders per 15 minutes per IP
    const ip = getClientIP(req);
    const rl = checkRateLimit(`pedidos:create:${ip}`, { maxRequests: 10, windowSeconds: 900 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitos pedidos em pouco tempo. Tente novamente em alguns minutos.' },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Validate with Zod
    const validation = validateBody(body, createOrderSchema);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { items, notes, addressId } = validation.data;

    // Validate all products exist and are active
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
      select: { id: true, price: true, name: true },
    });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missing = productIds.filter((id) => !foundIds.has(id));
      return NextResponse.json(
        { error: `Produtos nao encontrados ou inativos: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Build order items with server-side price validation
    const productPriceMap = new Map(products.map((p) => [p.id, Number(p.price)]));
    const orderItems = items.map((item) => {
      // Use server-side price (don't trust client price blindly)
      const serverPrice = productPriceMap.get(item.productId)!;
      const subtotal = serverPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: serverPrice,
        subtotal,
      };
    });

    const subtotal = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
    const deliveryFee = 0; // Will be calculated later based on address
    const total = subtotal + deliveryFee;

    // Check if customer is logged in (optional — guest checkout allowed)
    const customer = await getCustomerFromCookie();
    let customerId: number;

    if (customer) {
      customerId = customer.id;
    } else {
      // For guest orders, create or find a guest customer
      let guestCustomer = await prisma.customer.findUnique({
        where: { phone: '0000000000' },
      });
      if (!guestCustomer) {
        const bcrypt = await import('bcryptjs');
        guestCustomer = await prisma.customer.create({
          data: {
            name: 'Cliente WhatsApp',
            phone: '0000000000',
            passwordHash: await bcrypt.hash('guest-no-login', 12),
          },
        });
      }
      customerId = guestCustomer.id;
    }

    // Validate address belongs to customer if provided
    if (addressId && customer) {
      const address = await prisma.address.findFirst({
        where: { id: addressId, customerId: customer.id },
      });
      if (!address) {
        return NextResponse.json({ error: 'Endereco nao encontrado' }, { status: 400 });
      }
    }

    // Create order with items in a single transaction
    const order = await prisma.order.create({
      data: {
        customerId,
        addressId: addressId || null,
        status: 'PENDING',
        subtotal,
        deliveryFee,
        total,
        notes: notes?.trim() || null,
        whatsappSent: true,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: { product: { select: { name: true, emoji: true } } },
        },
      },
    });

    return NextResponse.json({
      id: order.id,
      status: order.status,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      total: Number(order.total),
      items: order.items.map((i) => ({
        productName: i.product.name,
        productEmoji: i.product.emoji,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
      createdAt: order.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 });
  }
}

// GET /api/pedidos — List orders (requires customer auth)
export async function GET() {
  try {
    const customer = await getCustomerFromCookie();
    if (!customer) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        items: {
          include: { product: { select: { name: true, emoji: true } } },
        },
        address: true,
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
        address: o.address
          ? {
              street: o.address.street,
              number: o.address.number,
              neighborhood: o.address.neighborhood,
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
    console.error('List orders error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
