import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const secretRaw = process.env.CUSTOMER_JWT_SECRET || process.env.NEXTAUTH_SECRET;
if (!secretRaw) {
  throw new Error(
    '[FATAL] Missing CUSTOMER_JWT_SECRET or NEXTAUTH_SECRET env var. Server cannot start without a secure JWT secret.'
  );
}
const JWT_SECRET = new TextEncoder().encode(secretRaw);

const COOKIE_NAME = 'customer-token';

export interface CustomerPayload {
  id: number;
  name: string;
  phone: string;
}

export async function signCustomerToken(payload: CustomerPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyCustomerToken(token: string): Promise<CustomerPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as CustomerPayload;
  } catch {
    return null;
  }
}

export async function getCustomerFromCookie(): Promise<CustomerPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

export async function setCustomerCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearCustomerCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireCustomer(): Promise<CustomerPayload> {
  const customer = await getCustomerFromCookie();
  if (!customer) {
    throw new Error('Unauthorized');
  }
  return customer;
}
