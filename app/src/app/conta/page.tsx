'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Lock, Eye, EyeOff, ShoppingBag, MapPin, LogOut, ChevronRight, Pencil, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

type Tab = 'login' | 'register';

export default function ContaPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth form state
  const [tab, setTab] = useState<Tab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // Profile edit
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.authenticated && data.customer) {
        setCustomer(data.customer);
      }
    } catch { /* not logged in */ }
    finally { setLoading(false); }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setCustomer(data);
    } catch { setError('Erro ao conectar'); }
    finally { setSubmitting(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (regPassword !== regConfirm) {
      setError('As senhas não coincidem');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, phone: regPhone, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setCustomer(data);
    } catch { setError('Erro ao conectar'); }
    finally { setSubmitting(false); }
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    setCustomer(null);
    setTab('login');
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
      const data = await res.json();
      if (res.ok) {
        setCustomer((prev) => prev ? { ...prev, name: data.name, phone: data.phone } : prev);
        setEditing(false);
      }
    } catch { /* ignore */ }
    finally { setSavingProfile(false); }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  // ---- LOGGED IN: Profile view ----
  if (customer) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Minha Conta</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Gerencie seus dados, enderecos e pedidos</p>
        </div>

        {/* Profile card */}
        <div className="rounded-2xl border border-white/5 bg-[var(--color-surface)] p-5 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/15">
                <User size={22} className="text-[var(--color-primary)]" />
              </div>
              <div>
                {editing ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="rounded-lg bg-[var(--color-bg)] border border-white/10 px-3 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]/40"
                  />
                ) : (
                  <h2 className="font-semibold text-[var(--color-text)]">{customer.name}</h2>
                )}
                <p className="text-xs text-[var(--color-text-muted)]">{customer.email}</p>
              </div>
            </div>
            {editing ? (
              <div className="flex gap-1.5">
                <button onClick={saveProfile} disabled={savingProfile} className="rounded-lg p-1.5 text-[var(--color-success)] hover:bg-[var(--color-success)]/10">
                  <Check size={16} />
                </button>
                <button onClick={() => setEditing(false)} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setEditing(true); setEditName(customer.name); setEditPhone(customer.phone || ''); }}
                className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-primary)]"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>

          {editing ? (
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <Phone size={14} />
              <input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="(15) 99999-9999"
                className="rounded-lg bg-[var(--color-bg)] border border-white/10 px-3 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]/40"
              />
            </div>
          ) : (
            customer.phone && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Phone size={14} />
                <span>{customer.phone}</span>
              </div>
            )
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-2 mb-6">
          <Link href="/conta/pedidos" className={cn(
            'flex items-center justify-between rounded-2xl border border-white/5 bg-[var(--color-surface)] p-4',
            'hover:border-[var(--color-primary)]/20 transition-all group'
          )}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <ShoppingBag size={18} className="text-blue-400" />
              </div>
              <div>
                <span className="text-sm font-medium text-[var(--color-text)]">Meus Pedidos</span>
                <p className="text-[11px] text-[var(--color-text-muted)]">Acompanhe seus pedidos</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
          </Link>

          <Link href="/conta/enderecos" className={cn(
            'flex items-center justify-between rounded-2xl border border-white/5 bg-[var(--color-surface)] p-4',
            'hover:border-[var(--color-primary)]/20 transition-all group'
          )}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                <MapPin size={18} className="text-green-400" />
              </div>
              <div>
                <span className="text-sm font-medium text-[var(--color-text)]">Meus Enderecos</span>
                <p className="text-[11px] text-[var(--color-text-muted)]">Gerencie seus enderecos de entrega</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
          </Link>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 py-3 text-sm font-medium text-red-400 hover:bg-red-500/5 transition-colors"
        >
          <LogOut size={16} />
          Sair da conta
        </button>
      </div>
    );
  }

  // ---- NOT LOGGED IN: Login / Register ----
  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]">
          <User size={28} className="text-black" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Minha Conta</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          {tab === 'login' ? 'Entre para acompanhar seus pedidos' : 'Crie sua conta para comecar'}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex rounded-xl bg-[var(--color-surface)] border border-white/5 p-1">
        <button
          onClick={() => { setTab('login'); setError(''); }}
          className={cn(
            'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
            tab === 'login' ? 'bg-[var(--color-primary)] text-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          )}
        >
          Entrar
        </button>
        <button
          onClick={() => { setTab('register'); setError(''); }}
          className={cn(
            'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
            tab === 'register' ? 'bg-[var(--color-primary)] text-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          )}
        >
          Criar Conta
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="seu@email.com"
                className={cn(
                  'w-full rounded-xl py-3 pl-10 pr-4 text-sm',
                  'bg-[var(--color-surface)] border border-white/5 text-[var(--color-text)]',
                  'placeholder:text-[var(--color-text-muted)]',
                  'focus:outline-none focus:border-[var(--color-primary)]/40'
                )}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Sua senha"
                className={cn(
                  'w-full rounded-xl py-3 pl-10 pr-10 text-sm',
                  'bg-[var(--color-surface)] border border-white/5 text-[var(--color-text)]',
                  'placeholder:text-[var(--color-text-muted)]',
                  'focus:outline-none focus:border-[var(--color-primary)]/40'
                )}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={cn(
              'w-full rounded-xl py-3 text-sm font-semibold',
              'bg-[var(--color-primary)] text-black',
              'hover:bg-[var(--color-primary-dark)] active:scale-[0.98]',
              'transition-all disabled:opacity-50'
            )}
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Nome completo *</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Seu nome"
                className={cn(
                  'w-full rounded-xl py-3 pl-10 pr-4 text-sm',
                  'bg-[var(--color-surface)] border border-white/5 text-[var(--color-text)]',
                  'placeholder:text-[var(--color-text-muted)]',
                  'focus:outline-none focus:border-[var(--color-primary)]/40'
                )}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Email *</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="seu@email.com"
                className={cn(
                  'w-full rounded-xl py-3 pl-10 pr-4 text-sm',
                  'bg-[var(--color-surface)] border border-white/5 text-[var(--color-text)]',
                  'placeholder:text-[var(--color-text-muted)]',
                  'focus:outline-none focus:border-[var(--color-primary)]/40'
                )}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Telefone</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="(15) 99999-9999"
                className={cn(
                  'w-full rounded-xl py-3 pl-10 pr-4 text-sm',
                  'bg-[var(--color-surface)] border border-white/5 text-[var(--color-text)]',
                  'placeholder:text-[var(--color-text-muted)]',
                  'focus:outline-none focus:border-[var(--color-primary)]/40'
                )}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Senha *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Minimo 6 caracteres"
                className={cn(
                  'w-full rounded-xl py-3 pl-10 pr-10 text-sm',
                  'bg-[var(--color-surface)] border border-white/5 text-[var(--color-text)]',
                  'placeholder:text-[var(--color-text-muted)]',
                  'focus:outline-none focus:border-[var(--color-primary)]/40'
                )}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Confirmar senha *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                placeholder="Repita a senha"
                className={cn(
                  'w-full rounded-xl py-3 pl-10 pr-4 text-sm',
                  'bg-[var(--color-surface)] border border-white/5 text-[var(--color-text)]',
                  'placeholder:text-[var(--color-text-muted)]',
                  'focus:outline-none focus:border-[var(--color-primary)]/40'
                )}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={cn(
              'w-full rounded-xl py-3 text-sm font-semibold',
              'bg-[var(--color-primary)] text-black',
              'hover:bg-[var(--color-primary-dark)] active:scale-[0.98]',
              'transition-all disabled:opacity-50'
            )}
          >
            {submitting ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>
      )}
    </div>
  );
}
