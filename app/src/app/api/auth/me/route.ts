import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireCustomer } from '@/lib/customer-auth';

// GET /api/auth/me — Get full customer profile
export async function GET() {
  try {
    const payload = await requireCustomer();

    const customer = await prisma.customer.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Cliente nao encontrado' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }
}

// PUT /api/auth/me — Update customer profile
export async function PUT(req: NextRequest) {
  try {
    const payload = await requireCustomer();
    const { name, email, currentPassword, newPassword } = await req.json();

    const updateData: Record<string, unknown> = {};

    if (name) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email?.trim().toLowerCase() || null;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Senha atual e obrigatoria para alterar a senha' }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Nova senha deve ter pelo menos 6 caracteres' }, { status: 400 });
      }

      const customer = await prisma.customer.findUnique({
        where: { id: payload.id },
      });

      if (!customer) {
        return NextResponse.json({ error: 'Cliente nao encontrado' }, { status: 404 });
      }

      const valid = await bcrypt.compare(currentPassword, customer.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 401 });
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.customer.update({
      where: { id: payload.id },
      data: updateData,
      select: { id: true, name: true, phone: true, email: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }
}
