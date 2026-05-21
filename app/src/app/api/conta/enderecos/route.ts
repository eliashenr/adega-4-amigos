import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireCustomer } from '@/lib/customer-auth';

// GET /api/conta/enderecos — List customer addresses
export async function GET() {
  try {
    const payload = await requireCustomer();

    const addresses = await prisma.address.findMany({
      where: { customerId: payload.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(addresses);
  } catch {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
}

// POST /api/conta/enderecos — Add new address
export async function POST(req: NextRequest) {
  try {
    const payload = await requireCustomer();
    const { street, number, complement, neighborhood, city, state, zipCode, isDefault } = await req.json();

    if (!street || !number || !neighborhood || !city || !state || !zipCode) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios' }, { status: 400 });
    }

    // If setting as default, unset any existing default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId: payload.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If this is the first address, make it default
    const count = await prisma.address.count({ where: { customerId: payload.id } });
    const shouldBeDefault = isDefault || count === 0;

    const address = await prisma.address.create({
      data: {
        customerId: payload.id,
        street: street.trim(),
        number: number.trim(),
        complement: complement?.trim() || null,
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        zipCode: zipCode.replace(/\D/g, ''),
        isDefault: shouldBeDefault,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
}

// PUT /api/conta/enderecos — Update address (pass id in body)
export async function PUT(req: NextRequest) {
  try {
    const payload = await requireCustomer();
    const { id, street, number, complement, neighborhood, city, state, zipCode, isDefault } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID do endereço obrigatório' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id, customerId: payload.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Endereço não encontrado' }, { status: 404 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId: payload.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        ...(street && { street: street.trim() }),
        ...(number && { number: number.trim() }),
        complement: complement?.trim() || null,
        ...(neighborhood && { neighborhood: neighborhood.trim() }),
        ...(city && { city: city.trim() }),
        ...(state && { state: state.trim().toUpperCase() }),
        ...(zipCode && { zipCode: zipCode.replace(/\D/g, '') }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
}

// DELETE /api/conta/enderecos — Delete address (pass id in body)
export async function DELETE(req: NextRequest) {
  try {
    const payload = await requireCustomer();
    const { id } = await req.json();

    const existing = await prisma.address.findFirst({
      where: { id, customerId: payload.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Endereço não encontrado' }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });

    // If deleted was default, promote another one
    if (existing.isDefault) {
      const next = await prisma.address.findFirst({
        where: { customerId: payload.id },
        orderBy: { createdAt: 'desc' },
      });
      if (next) {
        await prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
}
