import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  signCustomerToken,
  getCustomerFromCookie,
  setCustomerCookie,
  clearCustomerCookie,
} from '@/lib/customer-auth';

// Normalize phone: keep only digits
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// POST /api/auth — Customer login by phone
export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Telefone e senha obrigatorios' }, { status: 400 });
    }

    const phoneClean = normalizePhone(phone);

    const customer = await prisma.customer.findUnique({
      where: { phone: phoneClean },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Telefone ou senha incorretos' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Telefone ou senha incorretos' }, { status: 401 });
    }

    const token = await signCustomerToken({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
    });

    await setCustomerCookie(token);

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
    });
  } catch (error) {
    console.error('Customer login error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// GET /api/auth — Check customer session
export async function GET() {
  try {
    const payload = await getCustomerFromCookie();
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, phone: true, email: true },
    });

    if (!customer) {
      await clearCustomerCookie();
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, customer });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

// DELETE /api/auth — Customer logout
export async function DELETE() {
  await clearCustomerCookie();
  return NextResponse.json({ ok: true });
}
