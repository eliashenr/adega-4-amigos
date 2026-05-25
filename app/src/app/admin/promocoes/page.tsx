'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Percent, Calendar } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { formatBRL, cn } from '@/lib/utils';

interface Promo {
  id: number;
  title: string;
  description: string | null;
  productId: number;
  productName: string;
  productEmoji: string | null;
  productPrice: number;
  discountPercent: number;
  active: boolean;
  startsAt: string;
  endsAt: string;
}

interface Product {
  id: number;
  name: string;
  emoji: string | null;
  price: number;
}

interface PromoForm {
  title: string;
  description: string;
  productId: string;
  discountPercent: string;
  startsAt: string;
  endsAt: string;
}

const emptyForm: PromoForm = {
  title: '', description: '', productId: '', discountPercent: '',
  startsAt: new Date().toISOString().slice(0, 16),
  endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
};

function PromocoesContent() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PromoForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [promoRes, prodRes] = await Promise.all([
        fetch('/api/admin/promocoes'),
        fetch('/api/admin/produtos'),
      ]);
      setPromos(await promoRes.json());
      const allProds = await prodRes.json();
      setProducts(allProds.map((p: any) => ({ id: p.id, name: p.name, emoji: p.emoji, price: p.price })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(p: Promo) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description || '',
      productId: String(p.productId),
      discountPercent: String(p.discountPercent),
      startsAt: p.startsAt.slice(0, 16),
      endsAt: p.endsAt.slice(0, 16),
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        title: form.title,
        description: form.description || null,
        productId: form.productId,
        discountPercent: form.discountPercent,
        startsAt: form.startsAt,
        endsAt: form.endsAt,
      };
      if (editingId) {
        await fetch(`/api/admin/promocoes/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        await fetch('/api/admin/promocoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      setModalOpen(false);
      loadData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/admin/promocoes/${id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    loadData();
  }

  async function toggleActive(p: Promo) {
    await fetch(`/api/admin/promocoes/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !p.active }) });
    loadData();
  }

  const now = new Date();

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Promocoes</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{promos.length} promocoes</p>
        </div>
        <button onClick={openNew} className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 bg-[var(--color-primary)] text-black text-sm font-semibold hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all')}>
          <Plus size={16} /> Nova Promocao
        </button>
      </div>

      {/* Promo list */}
      <div className="space-y-3">
        {promos.map((p) => {
          const isExpired = new Date(p.endsAt) < now;
          const finalPrice = p.productPrice * (1 - p.discountPercent / 100);

          return (
            <div key={p.id} className={cn(
              'rounded-2xl border border-white/5 bg-[var(--color-surface)] p-4 sm:p-5',
              'hover:border-[var(--color-primary)]/20 transition-all',
              (!p.active || isExpired) && 'opacity-50'
            )}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">{p.productEmoji || '🏷️'}</span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] truncate">{p.title}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{p.productName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-center">
                    <span className="block text-lg font-bold text-[var(--color-success)]">-{p.discountPercent}%</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      {formatBRL(p.productPrice)} → {formatBRL(finalPrice)}
                    </span>
                  </div>

                  <div className="text-right text-[10px] text-[var(--color-text-muted)]">
                    <p>Inicio: {new Date(p.startsAt).toLocaleDateString('pt-BR')}</p>
                    <p>Fim: {new Date(p.endsAt).toLocaleDateString('pt-BR')}</p>
                    {isExpired && <p className="text-[var(--color-danger)] font-medium">Expirada</p>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive(p)} className={cn('rounded-full px-2 py-0.5 text-[9px] font-medium', p.active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400')}>
                      {p.active ? 'Ativa' : 'Inativa'}
                    </button>
                    <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-primary)]"><Pencil size={14} /></button>
                    {deleteConfirm === p.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(p.id)} className="rounded-lg p-1.5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"><Check size={14} /></button>
                        <button onClick={() => setDeleteConfirm(null)} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5"><X size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(p.id)} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-danger)]"><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {promos.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <Percent size={32} className="text-[var(--color-text-muted)] mb-3" />
            <p className="text-sm text-[var(--color-text-muted)]">Nenhuma promocao cadastrada</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-[var(--color-surface)] border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h2 className="text-lg font-bold text-[var(--color-text)]">{editingId ? 'Editar Promocao' : 'Nova Promocao'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-white/5"><X size={18} /></button>
            </div>
            <div className="space-y-4 px-6 py-5 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Titulo *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Heineken com 15% OFF" className={cn('w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40')} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Descricao</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descricao da promo" className={cn('w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40')} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Produto *</label>
                <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  className={cn('w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40')}>
                  <option value="">Selecione o produto</option>
                  {products.map((pr) => (
                    <option key={pr.id} value={pr.id}>{pr.emoji} {pr.name} — {formatBRL(pr.price)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Desconto (%) *</label>
                <input type="number" min="1" max="90" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                  placeholder="15" className={cn('w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Inicio *</label>
                  <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    className={cn('w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40')} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Fim *</label>
                  <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                    className={cn('w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40')} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-white/5 px-6 py-4">
              <button onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-white/5">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.productId || !form.discountPercent} className={cn(
                'flex items-center gap-2 rounded-xl px-5 py-2.5 bg-[var(--color-primary)] text-black text-sm font-semibold',
                'hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all disabled:opacity-50'
              )}>
                {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" /> : <Check size={16} />}
                {editingId ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PromocoesPage() {
  return <AdminShell><PromocoesContent /></AdminShell>;
}
