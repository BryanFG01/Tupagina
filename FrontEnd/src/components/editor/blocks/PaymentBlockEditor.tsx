'use client'

import type { PaymentContent } from '@/domain/landing/block.types'
import { Input } from '@/components/ui/Input'

type Props = {
  content: PaymentContent
  onChange: (content: PaymentContent) => void
}

const CURRENCIES = [
  { value: 'usd', label: 'USD — Dólar americano' },
  { value: 'ars', label: 'ARS — Peso argentino' },
  { value: 'mxn', label: 'MXN — Peso mexicano' },
  { value: 'cop', label: 'COP — Peso colombiano' },
  { value: 'clp', label: 'CLP — Peso chileno' },
]

export function PaymentBlockEditor({ content, onChange }: Props) {
  function update<K extends keyof PaymentContent>(field: K, value: PaymentContent[K]) {
    onChange({ ...content, [field]: value })
  }

  const priceInUnits = content.price / 100

  return (
    <div className="space-y-4">
      <Input
        label="Título"
        value={content.title}
        onChange={(e) => update('title', e.target.value)}
        placeholder="Consultoría 1 hora"
      />
      <Input
        label="Descripción"
        value={content.description}
        onChange={(e) => update('description', e.target.value)}
        placeholder="Lo que incluye este pago"
      />
      <Input
        label="Precio"
        type="number"
        min="1"
        step="0.01"
        value={priceInUnits}
        onChange={(e) => update('price', Math.round(parseFloat(e.target.value) * 100))}
        placeholder="100"
        hint="Ingresa el precio en unidades (ej: 100 = $100)"
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Moneda</label>
        <select
          value={content.currency}
          onChange={(e) => update('currency', e.target.value as PaymentContent['currency'])}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {CURRENCIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Plataforma de pago</label>
        <select
          value={content.provider}
          onChange={(e) => update('provider', e.target.value as PaymentContent['provider'])}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="stripe">Stripe (tarjeta de crédito/débito)</option>
          <option value="mercadopago">Mercado Pago</option>
        </select>
      </div>

      <Input
        label="Texto del botón"
        value={content.buttonText}
        onChange={(e) => update('buttonText', e.target.value)}
        placeholder="Comprar ahora"
      />

      <hr className="border-gray-100" />

      {/* Colores */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Colores</p>
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'backgroundColor', label: 'Fondo sección', default: '#2563eb' },
            { key: 'textColor',       label: 'Texto',          default: '#ffffff' },
            { key: 'buttonColor',     label: 'Fondo botón',    default: '#ffffff' },
            { key: 'buttonTextColor', label: 'Texto botón',    default: '#1e3a8a' },
          ] as { key: keyof PaymentContent; label: string; default: string }[]).map(c => (
            <div key={c.key}>
              <label className="text-[11px] font-medium text-gray-500 block mb-1">{c.label}</label>
              <input
                type="color"
                value={(content[c.key] as string | undefined) ?? c.default}
                onChange={e => update(c.key, e.target.value)}
                className="w-full h-9 rounded-lg cursor-pointer border border-gray-200 p-0.5"
              />
            </div>
          ))}
        </div>

        {/* Preview mini */}
        <div
          className="rounded-xl p-4 text-center mt-1"
          style={{ backgroundColor: content.backgroundColor ?? '#2563eb' }}
        >
          <p className="text-xs font-bold mb-2" style={{ color: content.textColor ?? '#ffffff' }}>
            Vista previa del botón
          </p>
          <div
            className="inline-block px-6 py-2 rounded-lg text-sm font-bold shadow"
            style={{
              backgroundColor: content.buttonColor    ?? '#ffffff',
              color:           content.buttonTextColor ?? '#1e3a8a',
            }}
          >
            {content.buttonText || 'Comprar ahora'}
          </div>
        </div>
      </div>
    </div>
  )
}
