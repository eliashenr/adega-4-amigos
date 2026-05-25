export interface CategoryFront {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  emoji: string | null;
  order: number;
  productCount?: number;
}

export interface ProductFront {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  emoji: string | null;
  price: number;
  originalPrice: number | null;
  categoryId: number;
  categoryName?: string;
  active: boolean;
  featured: boolean;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  image: string | null;
  emoji: string | null;
  quantity: number;
}

export interface CheckoutData {
  customerName: string;
  customerPhone: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  notes: string;
  paymentMethod: 'pix' | 'cash' | 'card';
  changeFor?: number;
}
