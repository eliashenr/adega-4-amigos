'use client';

import { useState, useEffect } from 'react';
import {
  Package, FolderOpen, Percent, ShoppingBag,
  TrendingUp, AlertTriangle, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { formatBRL } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DashboardData {
  stats: {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    totalCategories: number;
    totalPromotions: number;
    totalOrders: number;
    pendingOrders: number;
  };
  recentOrders: {
    id: number;
    status: string;
    total: number;
    customerName: string;
    itemCount: number;
    createdAt: string;
  }[];
  alerts: {
    inactiveProducts: number;
    pendingOrders: number;
  };
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-500/15 text-yellow-400' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-500/15 text-blue-400' },
  PREPARING: { label: 'Preparando', color: 'bg-purple-500/15 text-purple-400' },
  DELIVERING: { label: 'Entregando', color: 'bg-cyan-500/15 text-cyan-400' },
  DELIVERED: { label: 'Entregue', color: 'bg-green-500/15 text-green-400' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500/15 text-red-400' },
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: number | string;
  icon: any;
  color: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className={cn(
        'rounded-2xl p-5 border border-white/5',
        'bg-[var(--color-surface)] hover:border-[var(--color-primary)]/20',
        'transition-all duration-200 group cursor-pointer'
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
            <Icon size={20} />
          </div>
          <ArrowRight size={14} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</p>
      </div>
    </Link>
  );
}

function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (!data) return <p className="text-[var(--color-text-muted)]">Erro ao carregar dashboard</p>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Visao geral da sua adega
        </p>
      </div>

      {/* Alerts */}
      {(data.alerts.pendingOrders > 0 || data.alerts.inactiveProducts > 0) && (
        <div className="flex flex-wrap gap-3">
          {data.alerts.pendingOrders > 0 && (
            <Link href="/admin/pedidos?status=PENDING">
              <div className="flex items-center gap-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-2.5 text-sm text-yellow-400 hover:bg-yellow-500/15 transition-colors">
                <AlertTriangle size={16} />
                {data.alerts.pendingOrders} pedido(s) pendente(s)
              </div>
            </Link>
          )}
          {data.alerts.inactiveProducts > 0 && (
            <Link href="/admin/produtos?active=false">
              <div className="flex items-center gap-2 rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-2.5 text-sm text-orange-400 hover:bg-orange-500/15 transition-colors">
                <Package size={16} />
                {data.alerts.inactiveProducts} produto(s) inativo(s)
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Produtos ativos"
          value={data.stats.activeProducts}
          icon={Package}
          color="bg-blue-500/15 text-blue-400"
          href="/admin/produtos"
        />
        <StatCard
          label="Categorias"
          value={data.stats.totalCategories}
          icon={FolderOpen}
          color="bg-purple-500/15 text-purple-400"
          href="/admin/categorias"
        />
        <StatCard
          label="Promocoes ativas"
          value={data.stats.totalPromotions}
          icon={Percent}
          color="bg-green-500/15 text-green-400"
          href="/admin/promocoes"
        />
        <StatCard
          label="Pedidos"
          value={data.stats.totalOrders}
          icon={ShoppingBag}
          color="bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
          href="/admin/pedidos"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">
          Acoes rapidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Novo Produto', href: '/admin/produtos?new=1', icon: Package },
            { label: 'Nova Categoria', href: '/admin/categorias?new=1', icon: FolderOpen },
            { label: 'Nova Promocao', href: '/admin/promocoes?new=1', icon: Percent },
            { label: 'Ver Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <div className={cn(
                'flex items-center gap-2.5 rounded-xl px-4 py-3',
                'bg-[var(--color-surface)] border border-white/5',
                'text-sm text-[var(--color-text-muted)]',
                'hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)]',
                'transition-all duration-200'
              )}>
                <action.icon size={16} />
                {action.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      {data.recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Pedidos recentes
            </h2>
            <Link href="/admin/pedidos" className="text-xs text-[var(--color-primary)] hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-[var(--color-surface)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-muted)]">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-muted)]">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-muted)]">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-muted)]">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => {
                  const st = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
                  return (
                    <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">#{order.id}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-[var(--color-text)]">{order.customerName}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">
                          {order.itemCount} {order.itemCount === 1 ? 'item' : 'itens'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-medium', st.color)}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-[var(--color-text)]">
                        {formatBRL(order.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  );
}
