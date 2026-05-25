import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signAdminToken, setAdminCookie, clearAdminCookie, getAdminFromCookie } from '@/lib/admin-auth';

// POST /api/admin/auth — Login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha obrigatorios' }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || !admin.active) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 });
    }

    const payload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    const token = await signAdminToken(payload);
    await setAdminCookie(token);

    return NextResponse.json({ admin: payload });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// GET /api/admin/auth — Check session
export async function GET() {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) {
      return NextResponse.json({ admin: null }, { status: 401 });
    }
    return NextResponse.json({ admin });
  } catch {
    return NextResponse.json({ admin: null }, { status: 401 });
  }
}

// DELETE /api/admin/auth — Logout
export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
