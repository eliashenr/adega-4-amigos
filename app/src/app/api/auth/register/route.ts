import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signCustomerToken, setCustomerCookie } from '@/lib/customer-auth';

// POST /api/auth/register — Customer registration
export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    const existing = await prisma.customer.findUnique({
      where: { email: emailLower },
    });

    if (existing) {
      return NextResponse.json({ error: 'Este email já está cadastrado' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        email: emailLower,
        phone: phone?.trim() || null,
        passwordHash,
      },
    });

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
    }, { status: 201 });
  } catch (error) {
    console.error('Customer register error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
