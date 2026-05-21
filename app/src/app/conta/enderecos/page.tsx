'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Plus, Pencil, Trash2, Check, X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Address {
  id: number;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface AddressForm {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

const emptyForm: AddressForm = {
  street: '', number: '', complement: '', neighborhood: '',
  city: 'Sorocaba', state: 'SP', zipCode: '', isDefault: false,
};

export default function MeusEnderecosPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => { loadAddresses(); }, []);

  async function loadAddresses() {
    try {
      const res = await fetch('/api/conta/enderecos');
      if (res.status === 401) { router.push('/conta'); return; }
      setAddresses(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(a: Address) {
    setEditingId(a.id);
    setForm({
      street: a.street,
      number: a.number,
      complement: a.complement || '',
      neighborhood: a.neighborhood,
      city: a.city,
      state: a.state,
      zipCode: a.zipCode,
      isDefault: a.isDefault,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingId) {
        await fetch('/api/conta/enderecos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...form }),
        });
      } else {
        await fetch('/api/conta/enderecos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setModalOpen(false);
      loadAddresses();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    await fetch('/api/conta/enderecos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setDeleteConfirm(null);
    loadAddresses();
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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/conta" className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)]">Meus Enderecos</h1>
            <p className="text-xs text-[var(--color-text-muted)]">{addresses.length} endereco(s)</p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-3.5 py-2 text-xs font-semibold text-black hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <Plus size={14} />
          Novo
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <MapPin size={40} className="text-[var(--color-text-muted)] mb-3" />
          <p className="text-sm text-[var(--color-text-muted)] mb-4">Nenhum endereco cadastrado</p>
          <button onClick={openNew} className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[var(--color-primary-dark)] transition-colors">
            Adicionar Endereco
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className={cn(
              'rounded-2xl border bg-[var(--color-surface)] p-4',
              a.isDefault ? 'border-[var(--color-primary)]/30' : 'border-white/5'
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    a.isDefault ? 'bg-[var(--color-primary)]/15' : 'bg-white/5'
                  )}>
                    <MapPin size={16} className={a.isDefault ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text)]">
                      {a.street}, {a.number}
                      {a.complement ? ` - ${a.complement}` : ''}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {a.neighborhood} · {a.city}/{a.state}
                    </p>
                    {a.zipCode && (
                      <p className="text-[11px] text-[var(--color-text-muted)]">CEP: {a.zipCode}</p>
                    )}
                    {a.isDefault && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-primary)]">
                        <Star size={10} /> Principal
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(a)} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-primary)]">
                    <Pencil size={14} />
                  </button>
                  {deleteConfirm === a.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(a.id)} className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(a.id)} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-[var(--color-surface)] border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                {editingId ? 'Editar Endereco' : 'Novo Endereco'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-white/5">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 px-6 py-5 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">CEP</label>
                <input type="text" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                  placeholder="18020-000" maxLength={9}
                  className="w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Rua *</label>
                <input type="text" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })}
                  placeholder="Rua / Avenida" required
                  className="w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Numero *</label>
                  <input type="text" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })}
                    placeholder="123" required
                    className="w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Complemento</label>
                  <input type="text" value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })}
                    placeholder="Apto, bloco..."
                    className="w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Bairro *</label>
                <input type="text" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                  placeholder="Bairro" required
                  className="w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Cidade *</label>
                  <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Sorocaba" required
                    className="w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">UF *</label>
                  <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="SP" maxLength={2} required
                    className="w-full rounded-xl py-2.5 px-4 text-sm bg-[var(--color-bg)] border border-white/5 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]/40" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="rounded accent-[var(--color-primary)]" />
                <span className="text-xs text-[var(--color-text-muted)]">Definir como endereco principal</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/5 px-6 py-4">
              <button onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-white/5">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.street || !form.number || !form.neighborhood}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-5 py-2.5 bg-[var(--color-primary)] text-black text-sm font-semibold',
                  'hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all disabled:opacity-50'
                )}
              >
                {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" /> : <Check size={16} />}
                {editingId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
