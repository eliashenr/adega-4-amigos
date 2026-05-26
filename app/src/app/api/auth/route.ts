import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  signCustomerToken,
  getCustomerFromCookie,
  setCustomerCookie,
  clearCustomerCookie,
} from '@/lib/customer-auth';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { loginSchema, validateBody } from '@/lib/validations';

// Normalize phone: keep only digits
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// POST /api/auth — Customer login by phone
export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 attempts per 15 minutes per IP
    const ip = getClientIP(req);
    const rl = checkRateLimit(`auth:customer:${ip}`, { maxRequests: 5, windowSeconds: 900 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await req.json();

    const validation = validateBody(body, loginSchema);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { phone, password } = validation.data;
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
