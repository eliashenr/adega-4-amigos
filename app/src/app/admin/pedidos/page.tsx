'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp, MapPin, Phone } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { formatBRL, cn } from '@/lib/utils';

interface Order {
  id: number;
  status: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes: string | null;
  customer: { name: string; phone: string | null; email: string };
  address: { street: string; number: string; complement: string | null; neighborhood: string; city: string } | null;
  items: { productName: string; productEmoji: string | null; quantity: number; unitPrice: number; subtotal: number }[];
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  PREPARING: { label: 'Preparando', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  DELIVERING: { label: 'Em entrega', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  DELIVERED: { label: 'Entregue', color: 'bg-green-500/15 text-green-400 border-green-500/20' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED'];

function PedidosContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pedidos');
      setOrders(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function updateStatus(orderId: number, status: string) {
    await fetch(`/api/admin/pedidos/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadData();
  }

  const filtered = filterStatus
    ? orders.filter((o) => o.status === filterStatus)
    : orders;

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Pedidos</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{orders.length} pedidos</p>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setFilterStatus('')}
          className={cn(
            'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
            !filterStatus ? 'bg-[var(--color-primary)] text-black' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-white/5 hover:text-[var(--color-text)]'
          )}
        >
          Todos ({orders.length})
        </button>
        {Object.entries(STATUS_MAP).map(([key, val]) => {
          const count = orders.filter((o) => o.status === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
                filterStatus === key ? 'bg-[var(--color-primary)] text-black' : `bg-[var(--color-surface)] border border-white/5 ${val.color.split(' ')[1]}`
              )}
            >
              {val.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders */}
      <div className="space-y-3">
        {filtered.map((order) => {
          const st = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
          const isExpanded = expanded === order.id;
          const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];

          return (
            <div key={order.id} className={cn(
              'rounded-2xl border border-white/5 bg-[var(--color-surface)] overflow-hidden',
              'hover:border-[var(--color-primary)]/10 transition-all'
            )}>
              {/* Header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : order.id)}
                className="flex w-full items-center gap-4 p-4 sm:p-5 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--color-text)]">
                      Pedido #{order.id}
                    </span>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-medium border', st.color)}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {order.customer.name} · {order.items.length} {order.items.length === 1 ? 'item' : 'itens'} · {new Date(order.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <span className="text-base font-bold text-[var(--color-primary)]">
                  {formatBRL(order.total)}
                </span>
                {isExpanded ? <ChevronUp size={16} className="text-[var(--color-text-muted)]" /> : <ChevronDown size={16} className="text-[var(--color-text-muted)]" />}
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-white/5 px-4 sm:px-5 pb-5">
                  {/* Customer info */}
                  <div className="py-3 flex flex-wrap gap-4 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <Phone size={12} /> {order.customer.phone || order.customer.email}
                    </span>
                    {order.address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} /> {order.address.street}, {order.address.number} — {order.address.neighborhood}
                      </span>
                    )}
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                        <div className="flex items-center gap-2">
                          <span>{item.productEmoji || '📦'}</span>
                          <span className="text-[var(--color-text)]">{item.quantity}x {item.productName}</span>
                        </div>
                        <span className="text-[var(--color-text-muted)]">{formatBRL(item.subtotal)}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/5 pt-2 flex justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">Subtotal</span>
                      <span className="text-[var(--color-text)]">{formatBRL(order.subtotal)}</span>
                    </div>
                    {Number(order.deliveryFee) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--color-text-muted)]">Entrega</span>
                        <span className="text-[var(--color-text)]">{formatBRL(order.deliveryFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-[var(--color-text)]">Total</span>
                      <span className="text-[var(--color-primary)]">{formatBRL(order.total)}</span>
                    </div>
                  </div>

                  {order.notes && (
                    <p className="mb-4 text-xs text-[var(--color-text-muted)] italic bg-white/5 rounded-xl px-3 py-2">
                      Obs: {order.notes}
                    </p>
                  )}

                  {/* Status actions */}
                  <div className="flex flex-wrap gap-2">
                    {nextStatus && (
                      <button
                        onClick={() => updateStatus(order.id, nextStatus)}
                        className={cn(
                          'rounded-xl px-4 py-2 text-xs font-semibold',
                          'bg-[var(--color-primary)] text-black',
                          'hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all'
                        )}
                      >
                        Mover para: {STATUS_MAP[nextStatus]?.label}
                      </button>
                    )}
                    {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                      <button
                        onClick={() => updateStatus(order.id, 'CANCELLED')}
                        className="rounded-xl px-4 py-2 text-xs font-medium text-[var(--color-danger)] border border-[var(--color-danger)]/20 hover:bg-[var(--color-danger)]/10 transition-colors"
                      >
                        Cancelar pedido
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <ShoppingBag size={32} className="text-[var(--color-text-muted)] mb-3" />
            <p className="text-sm text-[var(--color-text-muted)]">Nenhum pedido encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PedidosPage() {
  return <AdminShell><PedidosContent /></AdminShell>;
}
