import { z } from 'zod';

// --- Auth ---
export const loginSchema = z.object({
  phone: z.string().min(1, 'Telefone obrigatorio'),
  password: z.string().min(1, 'Senha obrigatoria'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  phone: z.string().min(10, 'Telefone invalido').max(15),
  email: z.email('Email invalido').optional().nullable(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(100),
});

export const adminLoginSchema = z.object({
  email: z.email('Email invalido'),
  password: z.string().min(1, 'Senha obrigatoria'),
});

// --- Products ---
export const createProductSchema = z.object({
  name: z.string().min(1, 'Nome obrigatorio').max(200),
  description: z.string().max(2000).optional().nullable(),
  emoji: z.string().max(10).optional().nullable(),
  image: z.string().url('URL de imagem invalida').optional().nullable(),
  price: z.number().positive('Preco deve ser positivo'),
  originalPrice: z.number().positive().optional().nullable(),
  categoryId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
  featured: z.boolean().optional(),
});

// --- Categories ---
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome obrigatorio').max(100),
  description: z.string().max(500).optional().nullable(),
  emoji: z.string().max(10).optional().nullable(),
  image: z.string().url('URL de imagem invalida').optional().nullable(),
  order: z.number().int().min(0).optional(),
});

// --- Orders ---
export const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1, 'Quantidade minima: 1'),
  unitPrice: z.number().positive(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Pelo menos 1 item obrigatorio'),
  notes: z.string().max(500).optional().nullable(),
  addressId: z.number().int().positive().optional().nullable(),
});

// --- Address ---
export const addressSchema = z.object({
  street: z.string().min(1, 'Rua obrigatoria').max(200),
  number: z.string().min(1, 'Numero obrigatorio').max(20),
  complement: z.string().max(100).optional().nullable(),
  neighborhood: z.string().min(1, 'Bairro obrigatorio').max(100),
  city: z.string().min(1, 'Cidade obrigatoria').max(100),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  zipCode: z.string().min(8, 'CEP invalido').max(9),
  isDefault: z.boolean().optional(),
});

/**
 * Helper to validate request body with a Zod schema.
 * Returns { success: true, data } on success or { success: false, error } on failure.
 */
export function validateBody<T>(
  body: unknown,
  schema: z.ZodType<T>
): { success: true; data: T; error?: never } | { success: false; data?: never; error: string } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.issues[0]?.message || 'Dados invalidos';
  return { success: false, error: firstError };
}
