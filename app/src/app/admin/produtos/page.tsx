'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Search, Pencil, Trash2, X,
  Check, Package, Filter,
} from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { formatBRL, cn } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  price: number;
  originalPrice: number | null;
  categoryId: number;
  categoryName: string;
  categoryEmoji: string | null;
  active: boolean;
  featured: boolean;
  promotions: { id: number; title: string; discountPercent: number }[];
}

interface Category {
  id: number;
  name: string;
  emoji: string | null;
}

interface ProductForm {
  name: string;
  description: string;
  emoji: string;
  price: string;
  originalPrice: string;
  categoryId: string;
  featured: boolean;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  emoji: '',
  price: '',
  originalPrice: '',
  categoryId: '',
  featured: false,
};

function ProdutosContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterActive, setFilterActive] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/produtos'),
        fetch('/api/admin/categorias'),
      ]);
      setProducts(await prodRes.json());
      setCategories(await catRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      emoji: p.emoji || '',
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : '',
      categoryId: String(p.categoryId),
      featured: p.featured,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        name: form.name,
        description: form.description || null,
        emoji: form.emoji || null,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        categoryId: form.categoryId,
        featured: form.featured,
      };

      if (editingId) {
        await fetch(`/api/admin/produtos/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/admin/produtos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      setModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/admin/produtos/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      loadData();
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/admin/produtos/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    });
    loadData();
  }

  // Filtered products
  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat && p.categoryId !== parseInt(filterCat)) return false;
    if (filterActive === 'true' && !p.active) return false;
    if (filterActive === 'false' && p.active) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Produtos</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {products.length} produtos cadastrados
          </p>
        </div>
        <button
          onClick={openNew}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2.5',
            'bg-[var(--color-primary)] text-black text-sm font-semibold',
            'hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all'
          )}
        >
          <Plus size={16} />
          Novo Produto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              'w-full rounded-xl py-2.5 pl-9 pr-4 text-sm',
              'bg-[var(--color-surface)] border border-white/5',
              'text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50',
              'focus:outline-none focus:border-[var(--color-primary)]/40 transition-colors'
            )}
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className={cn(
            'rounded-xl px-3 py-2.5 text-sm',
            'bg-[var(--color-surface)] border border-white/5 text-[var(--color-text)]',
            'focus:outline-none focus:border-[var(--color-primary)]/40'
          )}
        >
          <option value="">Todas categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className={cn(
            'rounded-xl px-3 py-2.5 text-sm',
            'bg-[var(--color-surface)] border border-white/5 text-[var(--color-text)]',
            'focus:outline-none focus:border-[var(--color-primary)]/40'
          )}
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-[var(--color-surface)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-muted)]">Produto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] hidden sm:table-cell">Categoria</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-muted)]">Preco</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[var(--color-text-muted)]">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-muted)]">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className={cn(
                    'border-b border-white/5 last:border-0',
                    'hover:bg-white/[0.02] transition-colors',
                    !p.active && 'opacity-50'
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{p.emoji || '📦'}</span>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text)]">
                          {p.name}
                          {p.featured && (
                            <span className="ml-2 rounded-full bg-[var(--color-primary)]/15 px-2 py-0.5 text-[9px] font-semibold text-[var(--color-primary)]">
                              Destaque
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)] sm:hidden">
                          {p.categoryEmoji} {p.categoryName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {p.categoryEmoji} {p.categoryName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-medium text-[var(--color-primary)]">
                      {formatBRL(p.price)}
                    </span>
                    {p.promotions.length > 0 && (
                      <p className="text-[9px] text-[var(--color-success)]">
                        -{p.promotions[0].discountPercent}% promo
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(p)}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors',
                        p.active
                          ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                          : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                      )}
                    >
                      {p.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-primary)] transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      {deleteConfirm === p.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="rounded-lg p-1.5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
                            title="Confirmar exclusao"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5"
                            title="Cancelar"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-danger)] transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <Package size={32} className="text-[var(--color-text-muted)] mb-3" />
            <p className="text-sm text-[var(--color-text-muted)]">Nenhum produto encontrado</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-[var(--color-surface)] border border-white/10 shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="space-y-4 px-6 py-5 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">
                  Nome *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Heineken 330ml Long Neck"
                  className={cn(
                    'w-full rounded-xl py-2.5 px-4 text-sm',
                    'bg-[var(--color-bg)] border border-white/5',
                    'text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50',
                    'focus:outline-none focus:border-[var(--color-primary)]/40'
                  )}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">
                  Descricao
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Descricao breve do produto"
                  className={cn(
                    'w-full rounded-xl py-2.5 px-4 text-sm resize-none',
                    'bg-[var(--color-bg)] border border-white/5',
                    'text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50',
                    'focus:outline-none focus:border-[var(--color-primary)]/40'
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={form.emoji}
                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    placeholder="🍺"
                    className={cn(
                      'w-full rounded-xl py-2.5 px-4 text-sm',
                      'bg-[var(--color-bg)] border border-white/5',
                      'text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40'
                    )}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">
                    Categoria *
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className={cn(
                      'w-full rounded-xl py-2.5 px-4 text-sm',
                      'bg-[var(--color-bg)] border border-white/5',
                      'text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40'
                    )}
                  >
                    <option value="">Selecione</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">
                    Preco (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    className={cn(
                      'w-full rounded-xl py-2.5 px-4 text-sm',
                      'bg-[var(--color-bg)] border border-white/5',
                      'text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40'
                    )}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">
                    Preco original (riscado)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    placeholder="0.00"
                    className={cn(
                      'w-full rounded-xl py-2.5 px-4 text-sm',
                      'bg-[var(--color-bg)] border border-white/5',
                      'text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40'
                    )}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="h-4 w-4 rounded accent-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--color-text)]">Produto em destaque</span>
              </label>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 border-t border-white/5 px-6 py-4">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.price || !form.categoryId}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-5 py-2.5',
                  'bg-[var(--color-primary)] text-black text-sm font-semibold',
                  'hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : (
                  <Check size={16} />
                )}
                {editingId ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProdutosPage() {
  return (
    <AdminShell>
      <ProdutosContent />
    </AdminShell>
  );
}
