import React, { useState, useEffect } from 'react'
import { CartItem, PickupSlot } from '../types'
import { formatCRC, WHATSAPP_NUMBER, SINPE_NUMBER } from '../data/products'
import { saveOrderToDatabase } from '../services/ordersService'
import { isSupabaseConfigured } from '../lib/supabase'

type ConfirmationModalProps = {
  cartItems: CartItem[]
  total: number
  subtotal: number
  name: string
  phone: string
  people: string
  date: string
  selectedSlot?: PickupSlot
  onClose: () => void
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  cartItems,
  total,
  subtotal,
  name,
  phone,
  people,
  date,
  selectedSlot,
  onClose,
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  const advancePayment = total * 0.5
  const remainingBalance = total * 0.5

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const generateWhatsAppMessage = (orderId?: string) => {
    const lines = cartItems.map(item => `• ${item.name} × ${item.quantity} — ${formatCRC(item.price * item.quantity)}`)
    return [
      'Hola, quiero reservar en El Lingote Español 🇪🇸',
      orderId ? `*Nº de Pedido:* #${orderId.slice(0, 8)}` : '',
      '',
      '**PEDIDO**',
      ...lines,
      '',
      `Subtotal: ${formatCRC(subtotal)}`,
      `TOTAL DEL PEDIDO: ${formatCRC(total)}`,
      '----------------------------------',
      `👉 *ADELANTO MÍNIMO 50%: ${formatCRC(advancePayment)}*`,
      `Saldo pendiente a la recogida: ${formatCRC(remainingBalance)}`,
      '----------------------------------',
      `Personas: ${people}`,
      `Fecha: ${date || 'Por confirmar'}`,
      `Recogida: ${selectedSlot?.label || 'Por confirmar'}`,
      `Nombre: ${name || 'Por indicar'}`,
      `Teléfono: ${phone || 'Por indicar'}`,
      '',
      `Realizaré la transferencia por Sinpe Móvil al: *${SINPE_NUMBER}*`,
      'Entiendo que la reserva queda confirmada al enviar el comprobante del adelanto (mínimo 50%) o pago completo.',
    ].filter(Boolean).join('\n')
  }

  const handleConfirmAndSend = async () => {
    setIsSaving(true)
    setSaveStatus('Guardando pedido en la base de datos...')

    const hasPaella = cartItems.some(i => i.category === 'paella' || i.id === 'banquete')

    const result = await saveOrderToDatabase({
      customerName: name,
      customerPhone: phone,
      peopleCount: parseInt(people, 10) || 4,
      pickupDate: date,
      pickupTime: selectedSlot?.value || '',
      subtotal,
      total,
      hasPaella,
      items: cartItems,
    })

    setIsSaving(false)

    if (result.success) {
      const message = generateWhatsAppMessage(result.orderId)
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
      onClose()
    } else {
      setSaveStatus(`⚠️ Guardado en modo local. Abriendo WhatsApp...`)
      setTimeout(() => {
        const message = generateWhatsAppMessage()
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
        onClose()
      }, 1200)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/60 p-4 backdrop-blur-sm sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      <div className="w-full max-w-lg rounded-[2rem] bg-paper p-7 text-ink shadow-2xl sm:p-9 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-black uppercase tracking-[.2em] text-redlingote">Último paso</p>
              {isSupabaseConfigured ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  ✓ Supabase Activo
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  Local DB
                </span>
              )}
            </div>
            <h2 id="confirmation-title" className="display mt-2 text-3xl font-bold">Revisa tu reserva</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar revisión"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-xl leading-none transition hover:bg-black/5"
          >
            ×
          </button>
        </div>

        {/* Lista de productos */}
        <div className="mt-6 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white px-5">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span>{item.quantity} × {item.name}</span>
              <strong>{formatCRC(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="flex items-center justify-between py-3.5">
            <span className="font-bold">Total del Pedido</span>
            <strong className="text-lg">{formatCRC(total)}</strong>
          </div>
        </div>

        {/* CÁLCULO DE ADELANTO 50% */}
        <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-300 p-4 text-sm text-amber-950">
          <div className="flex items-center justify-between">
            <div className="font-black text-amber-900">👉 Adelanto mínimo por SINPE (50%):</div>
            <div className="text-lg font-black text-redlingote">{formatCRC(advancePayment)}</div>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-amber-900/80">
            <span>Saldo a cancelar al recoger:</span>
            <strong className="font-semibold">{formatCRC(remainingBalance)}</strong>
          </div>
          <div className="mt-2 text-xs font-semibold text-amber-900 border-t border-amber-200/80 pt-2">
            📲 Transferencia SINPE Móvil al: <strong className="text-black font-mono">{SINPE_NUMBER}</strong>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-saffron/15 p-4 text-xs leading-5">
          <strong>{name}</strong> · {phone} · {people} personas
          <br />
          Recogida: <strong>{date}</strong> a las <strong>{selectedSlot?.label}</strong>
        </div>

        {saveStatus && (
          <div className="mt-4 rounded-xl bg-ink/5 p-3 text-xs font-semibold text-ink">
            {saveStatus}
          </div>
        )}

        <p className="mt-4 text-xs leading-5 text-black/55">
          Al pulsar el botón se registrará el pedido y abrirás WhatsApp para enviar el comprobante del adelanto (50% o 100%).
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl border border-black/15 px-5 py-3.5 font-bold transition hover:bg-black/5 disabled:opacity-50"
          >
            Editar pedido
          </button>
          <button
            onClick={handleConfirmAndSend}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 rounded-xl bg-redlingote px-5 py-3.5 font-black text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Abrir WhatsApp →'}
          </button>
        </div>
      </div>
    </div>
  )
}
