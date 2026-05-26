import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signCustomerToken, setCustomerCookie } from '@/lib/customer-auth';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { registerSchema, validateBody } from '@/lib/validations';

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// POST /api/auth/register — Customer registration
export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 registrations per 15 minutes per IP
    const ip = getClientIP(req);
    const rl = checkRateLimit(`auth:register:${ip}`, { maxRequests: 3, windowSeconds: 900 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas de cadastro. Tente novamente em alguns minutos.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await req.json();

    // Validate with Zod
    const validation = validateBody(body, registerSchema);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, phone, email, password } = validation.data;

    const phoneClean = normalizePhone(phone);

    if (phoneClean.length < 10 || phoneClean.length > 11) {
      return NextResponse.json({ error: 'Telefone invalido. Use DDD + numero' }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({
      where: { phone: phoneClean },
    });

    if (existing) {
      return NextResponse.json({ error: 'Este telefone ja esta cadastrado' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: phoneClean,
        email: email?.trim().toLowerCase() || null,
        passwordHash,
      },
    });

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
    }, { status: 201 });
  } catch (error) {
    console.error('Customer register error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
