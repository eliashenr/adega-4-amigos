'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, FolderOpen, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { AdminShell } from '@/components/admin/AdminShell';
import { cn } from '@/lib/utils';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  emoji: string | null;
  order: number;
  active: boolean;
  productCount: number;
}

interface CategoryForm {
  name: string;
  description: string;
  emoji: string;
  image: string;
  order: string;
}

const emptyForm: CategoryForm = { name: '', description: '', emoji: '', image: '', order: '' };

function CategoriasContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categorias');
      setCategories(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(c: Category) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      description: c.description || '',
      emoji: c.emoji || '',
      image: c.image || '',
      order: String(c.order),
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
        image: form.image || null,
        order: form.order ? parseInt(form.order) : undefined,
      };

      if (editingId) {
        await fetch(`/api/admin/categorias/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/admin/categorias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      setModalOpen(false);
      loadData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/admin/categorias/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error);
        return;
      }
      setDeleteConfirm(null);
      loadData();
    } catch (e) { console.error(e); }
  }

  async function toggleActive(c: Category) {
    await fetch(`/api/admin/categorias/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !c.active }),
    });
    loadData();
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Categorias</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{categories.length} categorias</p>
        </div>
        <button onClick={openNew} className={cn(
          'flex items-center gap-2 rounded-xl px-4 py-2.5',
          'bg-[var(--color-primary)] text-black text-sm font-semibold',
          'hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all'
        )}>
          <Plus size={16} />
          Nova Categoria
        </button>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div
            key={c.id}
            className={cn(
              'relative overflow-hidden rounded-2xl border border-white/5',
              'bg-[var(--color-surface)] transition-all duration-200',
              'hover:border-[var(--color-primary)]/20',
              !c.active && 'opacity-50'
            )}
          >
            {/* Banner preview */}
            {c.image ? (
              <div className="relative h-28 overflow-hidden">
                <Image src={c.image} alt={c.name} fill className="object-cover" sizes="400px" />
              </div>
            ) : (
              <div className="flex h-28 items-center justify-center bg-[var(--color-surface-2)]">
                <span className="text-5xl">{c.emoji || '📦'}</span>
              </div>
            )}

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">
                    {c.emoji && <span className="mr-1.5">{c.emoji}</span>}
                    {c.name}
                  </h3>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                    {c.productCount} produto(s) · Ordem: {c.order}
                  </p>
                </div>
                <button
                  onClick={() => toggleActive(c)}
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[9px] font-medium',
                    c.active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                  )}
                >
                  {c.active ? 'Ativa' : 'Inativa'}
                </button>
              </div>

              {c.description && (
                <p className="mt-2 text-[11px] text-[var(--color-text-muted)] line-clamp-1">
                  {c.description}
                </p>
              )}

              <div className="mt-3 flex items-center gap-1 border-t border-white/5 pt-3">
                <button
                  onClick={() => openEdit(c)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-primary)] transition-colors"
                >
                  <Pencil size={12} />
                  Editar
                </button>
                {deleteConfirm === c.id ? (
                  <div className="ml-auto flex items-center gap-1">
                    <button onClick={() => handleDelete(c.id)} className="rounded-lg p-1.5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10">
                      <Check size={12} />
                    </button>
                    <button onClick={() => setDeleteConfirm(null)} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(c.id)}
                    className="ml-auto rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-danger)] transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-[var(--color-surface)] border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                {editingId ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-white/5">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Nome *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Cervejas" className={cn('w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40')} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Descricao</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Breve descricao" className={cn('w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Emoji</label>
                  <input type="text" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    placeholder="🍺" className={cn('w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40')} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Ordem</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })}
                    placeholder="1" className={cn('w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40')} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">URL da imagem/banner</label>
                <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="/banners/categorias/cervejas.png" className={cn('w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40')} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-white/5 px-6 py-4">
              <button onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-white/5">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name} className={cn(
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

export default function CategoriasPage() {
  return <AdminShell><CategoriasContent /></AdminShell>;
}
