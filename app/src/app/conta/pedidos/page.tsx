'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { formatBRL, cn } from '@/lib/utils';

interface OrderItem {
  productName: string;
  productEmoji: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: number;
  status: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes: string | null;
  address: { street: string; number: string; complement: string | null; neighborhood: string; city: string } | null;
  items: OrderItem[];
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  PREPARING: { label: 'Preparando', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  DELIVERING: { label: 'A caminho', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  DELIVERED: { label: 'Entregue', color: 'bg-green-500/15 text-green-400 border-green-500/20' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

export default function MeusPedidosPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch('/api/conta/pedidos');
      if (res.status === 401) { router.push('/conta'); return; }
      setOrders(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/conta" className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">Meus Pedidos</h1>
          <p className="text-xs text-[var(--color-text-muted)]">{orders.length} pedido(s)</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <ShoppingBag size={40} className="text-[var(--color-text-muted)] mb-3" />
          <p className="text-sm text-[var(--color-text-muted)] mb-4">Voce ainda nao fez nenhum pedido</p>
          <Link href="/cardapio" className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[var(--color-primary-dark)] transition-colors">
            Ver Cardapio
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const st = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
            const isOpen = expanded === order.id;

            return (
              <div key={order.id} className="rounded-2xl border border-white/5 bg-[var(--color-surface)] overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                    <Package size={18} className="text-[var(--color-primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[var(--color-text)]">Pedido #{order.id}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium border', st.color)}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')} · {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-primary)]">{formatBRL(order.total)}</span>
                  {isOpen ? <ChevronUp size={14} className="text-[var(--color-text-muted)]" /> : <ChevronDown size={14} className="text-[var(--color-text-muted)]" />}
                </button>

                {isOpen && (
                  <div className="border-t border-white/5 px-4 pb-4">
                    <div className="space-y-2 py-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span>{item.productEmoji || '📦'}</span>
                            <span className="text-[var(--color-text)]">{item.quantity}x {item.productName}</span>
                          </div>
                          <span className="text-[var(--color-text-muted)]">{formatBRL(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/5 pt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">Subtotal</span>
                        <span className="text-[var(--color-text)]">{formatBRL(order.subtotal)}</span>
                      </div>
                      {order.deliveryFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-muted)]">Entrega</span>
                          <span className="text-[var(--color-text)]">{formatBRL(order.deliveryFee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold">
                        <span className="text-[var(--color-text)]">Total</span>
                        <span className="text-[var(--color-primary)]">{formatBRL(order.total)}</span>
                      </div>
                    </div>

                    {order.address && (
                      <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">
                        Entrega: {order.address.street}, {order.address.number}
                        {order.address.complement ? ` - ${order.address.complement}` : ''} — {order.address.neighborhood}
                      </p>
                    )}

                    {order.notes && (
                      <p className="mt-2 text-[11px] text-[var(--color-text-muted)] italic bg-white/5 rounded-lg px-3 py-1.5">
                        Obs: {order.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
