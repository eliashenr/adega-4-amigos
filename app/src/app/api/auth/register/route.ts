import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signCustomerToken, setCustomerCookie } from '@/lib/customer-auth';

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// POST /api/auth/register — Customer registration
export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, password } = await req.json();

    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'Nome, telefone e senha sao obrigatorios' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 });
    }

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
