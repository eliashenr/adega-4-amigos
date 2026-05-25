'use client';

import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { STORE } from '@/constants';
import { cn } from '@/lib/utils';

export default function LocalizacaoPage() {
  const addressQuery = encodeURIComponent(`${STORE.address}, ${STORE.city} - ${STORE.state}, ${STORE.cep}`);
  const mapSrc = `https://maps.google.com/maps?q=${addressQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${addressQuery}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/15">
          <MapPin size={28} className="text-[var(--color-primary)]" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Localizacao</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Venha nos visitar ou peca por delivery
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-white/5">
          <iframe
            src={mapSrc}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full"
            title="Localizacao Adega 4 Amigos"
          />
        </div>

        {/* Info sidebar */}
        <div className="space-y-4">
          {/* Address card */}
          <div className="rounded-2xl border border-white/5 bg-[var(--color-surface)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-[var(--color-primary)]" />
              <h2 className="text-sm font-semibold text-[var(--color-text)]">Endereco</h2>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {STORE.address}
              <br />
              {STORE.city} - {STORE.state}
              <br />
              CEP: {STORE.cep}
            </p>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'mt-4 flex items-center justify-center gap-2 rounded-xl py-2.5',
                'bg-[var(--color-primary)] text-black text-sm font-semibold',
                'hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all'
              )}
            >
              <Navigation size={16} />
              Como Chegar
            </a>
          </div>

          {/* Hours card */}
          <div className="rounded-2xl border border-white/5 bg-[var(--color-surface)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-[var(--color-primary)]" />
              <h2 className="text-sm font-semibold text-[var(--color-text)]">Horarios</h2>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Seg - Sex</span>
                <span className="text-[var(--color-text)] font-medium">{STORE.hours.weekdays.open} - {STORE.hours.weekdays.close}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Sabado</span>
                <span className="text-[var(--color-text)] font-medium">{STORE.hours.saturday.open} - {STORE.hours.saturday.close}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Domingo</span>
                <span className="text-[var(--color-text)] font-medium">{STORE.hours.sunday.open} - {STORE.hours.sunday.close}</span>
              </li>
            </ul>
          </div>

          {/* Contact card */}
          <div className="rounded-2xl border border-white/5 bg-[var(--color-surface)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Phone size={16} className="text-[var(--color-primary)]" />
              <h2 className="text-sm font-semibold text-[var(--color-text)]">Contato</h2>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">{STORE.phone}</p>
            <a
              href={`https://wa.me/${STORE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-green-500/20 py-2.5 text-sm font-medium text-green-400 hover:bg-green-500/5 transition-colors"
            >
              WhatsApp
            </a>
          </div>

          {/* Delivery area */}
          <div className="rounded-2xl border border-white/5 bg-[var(--color-surface)] p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text)] mb-3">Taxas de Entrega</h2>
            <ul className="space-y-1.5 text-sm">
              {STORE.deliveryFees.map((fee, i) => (
                <li key={i} className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">
                    Ate {fee.maxKm}km
                  </span>
                  <span className="text-[var(--color-text)] font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fee.fee)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">
              Frete gratis acima de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(STORE.freeDeliveryAbove)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
