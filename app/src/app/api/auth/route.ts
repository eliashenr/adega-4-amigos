import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  signCustomerToken,
  getCustomerFromCookie,
  setCustomerCookie,
  clearCustomerCookie,
} from '@/lib/customer-auth';

// POST /api/auth — Customer login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    const token = await signCustomerToken({
      id: customer.id,
      name: customer.name,
      email: customer.email,
    });

    await setCustomerCookie(token);

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
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
      select: { id: true, name: true, email: true, phone: true },
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
