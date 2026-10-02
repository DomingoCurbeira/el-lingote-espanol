import React, { useEffect, useState } from 'react'
import { CartItem, FormErrors, PickupSlot } from '../types'
import { formatCRC, LUNCH_SLOTS, EVENING_SLOTS, SINPE_NUMBER } from '../data/products'
import { getBookedSlotsForDate } from '../services/ordersService'

type ReservationSectionProps = {
  cartItems: CartItem[]
  total: number
  name: string
  phone: string
  people: string
  date: string
  time: string
  formErrors: FormErrors
  notice: string
  setName: (v: string) => void
  setPhone: (v: string) => void
  setPeople: (v: string) => void
  setDate: (v: string) => void
  setTime: (v: string) => void
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  onOpenConfirmation: () => void
}

export const ReservationSection: React.FC<ReservationSectionProps> = ({
  cartItems,
  total,
  name,
  phone,
  people,
  date,
  time,
  formErrors,
  notice,
  setName,
  setPhone,
  setPeople,
  setDate,
  setTime,
  onAdd,
  onRemove,
  onOpenConfirmation,
}) => {
  const [bookedCounts, setBookedCounts] = useState<Record<string, number>>({})
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [copiedSinpe, setCopiedSinpe] = useState(false)

  // Fecha mínima permitida (Mañana = Hoy + 24 horas)
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

  const includesPaella = cartItems.some(item => item.category === 'paella' || item.id === 'banquete')
  const advancePayment = total * 0.5

  // Formateador inteligente de teléfono (estándar Costa Rica XXXX-XXXX)
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/[^\d+]/g, '')
    if (raw.startsWith('+')) {
      setPhone(raw)
      return
    }
    const digits = val.replace(/\D/g, '')
    if (digits.length <= 8) {
      if (digits.length > 4) {
        setPhone(`${digits.slice(0, 4)}-${digits.slice(4)}`)
      } else {
        setPhone(digits)
      }
    } else {
      setPhone(val)
    }
  }

  // Copiar SINPE al portapapeles
  const handleCopySinpe = async () => {
    try {
      await navigator.clipboard.writeText(SINPE_NUMBER.replace(/\D/g, ''))
      setCopiedSinpe(true)
      setTimeout(() => setCopiedSinpe(false), 2500)
    } catch {
      // Fallback
      setCopiedSinpe(true)
      setTimeout(() => setCopiedSinpe(false), 2500)
    }
  }

  // Consultar disponibilidad real en BD al cambiar la fecha
  useEffect(() => {
    if (!date) {
      setBookedCounts({})
      return
    }

    let isMounted = true
    setLoadingSlots(true)

    getBookedSlotsForDate(date).then(counts => {
      if (isMounted) {
        setBookedCounts(counts)
        setLoadingSlots(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [date])

  const calculateAvailableSlots = (): (PickupSlot & { bookedCount?: number; remaining?: number })[] => {
    if (!date) return []
    const day = new Date(`${date}T12:00:00`).getDay()
    const weekendMenu = [5, 6, 0].includes(day)
    const weekdayMenu = [1, 2, 3, 4, 5].includes(day)

    let rawSlots: PickupSlot[] = []
    if (includesPaella) {
      rawSlots = weekendMenu ? LUNCH_SLOTS : []
    } else {
      rawSlots = [...(weekendMenu ? LUNCH_SLOTS : []), ...(weekdayMenu ? EVENING_SLOTS : [])]
    }

    const MAX_ORDERS_PER_SLOT = includesPaella ? 1 : 3

    return rawSlots.map(slot => {
      const booked = bookedCounts[slot.value] || 0
      const isFull = booked >= MAX_ORDERS_PER_SLOT
      return {
        ...slot,
        bookedCount: booked,
        remaining: Math.max(0, MAX_ORDERS_PER_SLOT - booked),
        isAvailable: !isFull,
      }
    })
  }

  const availableSlots = calculateAvailableSlots()

  return (
    <section id="reservar" className="bg-ink text-white scroll-mt-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-24">
        {/* Columna Izquierda: Platos seleccionados */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-saffron">
            <span>Paso 1</span>
            <span className="opacity-40">|</span>
            <span>Tu selección</span>
          </div>

          <h2 className="display mt-3 text-4xl font-bold sm:text-5xl">Reserva tu mesa española.</h2>
          <p className="mt-4 max-w-xl text-white/70 text-sm leading-6">
            Selecciona fecha, franja de recogida y tus datos de contacto. Generaremos el comprobante y el mensaje de WhatsApp directo a nuestra cocina.
          </p>

          {/* Tarjeta informativa destacada */}
          <div className="mt-6 space-y-3 rounded-2xl border border-saffron/30 bg-saffron/10 p-5 text-sm leading-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-bold text-saffron">
                <span>⏱️ Anticipación requerida: 24 horas</span>
              </div>
              <span className="text-[11px] rounded-full bg-saffron/20 px-2.5 py-0.5 font-bold text-saffron">
                Elaboración artesanal
              </span>
            </div>
            <p className="text-xs text-white/80">
              Todas nuestras paellas y tortillas se preparan al momento con insumos frescos. No recalentamos comida.
            </p>
            <div className="flex items-center justify-between flex-wrap gap-2 border-t border-saffron/20 pt-3 text-xs">
              <span className="font-semibold text-saffron">
                💳 Adelanto mínimo del 50% por SINPE Móvil
              </span>
              <button
                type="button"
                onClick={handleCopySinpe}
                className="flex items-center gap-1.5 rounded-lg bg-saffron px-2.5 py-1 text-[11px] font-black text-ink shadow transition hover:bg-yellow-400 active:scale-95 cursor-pointer"
              >
                <span>{copiedSinpe ? '✓ ¡Número copiado!' : `📋 Copiar SINPE: ${SINPE_NUMBER}`}</span>
              </button>
            </div>
          </div>

          {/* Lista de productos en el pedido */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-white/50 px-1">
              <span>Platos en el pedido</span>
              <span>{cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}</span>
            </div>

            {cartItems.length ? (
              cartItems.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/[0.08]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.emoji}</span>
                    <div>
                      <div className="font-bold text-base">{item.name}</div>
                      <div className="text-xs text-white/50">
                        {formatCRC(item.price)} cada uno · {item.people}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-black text-saffron">{formatCRC(item.price * item.quantity)}</div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/40 p-1">
                      <button 
                        onClick={() => onRemove(item.id)} 
                        aria-label="Restar una unidad"
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/10 transition active:scale-90"
                      >
                        −
                      </button>
                      <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => onAdd(item.id)} 
                        aria-label="Sumar una unidad"
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-redlingote text-white font-bold hover:bg-red-700 transition active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/20 p-8 text-center text-white/50 space-y-3">
                <div className="text-3xl">🥘</div>
                <div className="font-semibold">Tu pedido aún está vacío</div>
                <p className="text-xs text-white/40 max-w-sm mx-auto">
                  Selecciona una de nuestras paellas tradicionales, tortilla española entera o el Banquete Familiar arriba.
                </p>
                <a
                  href="#paellas"
                  className="inline-block rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
                >
                  Ver Menú de Paellas ↑
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Formulario de Checkout */}
        <div className="rounded-[2rem] bg-white p-7 text-ink shadow-2xl sm:p-9">
          <div className="flex items-center justify-between border-b border-black/10 pb-5">
            <div>
              <div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Resumen a pagar</div>
              <div className="mt-1 text-3xl font-black text-redlingote">{formatCRC(total)}</div>
            </div>
            {total > 0 && (
              <div className="text-right">
                <div className="inline-flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                    Adelanto SINPE (50%): <strong>{formatCRC(advancePayment)}</strong>
                  </span>
                  <span className="text-[10px] text-black/50 mt-1">Saldo restante al retirar</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold text-black/70 mb-1">Nombre completo:</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Carlos Jiménez"
                aria-invalid={Boolean(formErrors.name)}
                className={`w-full rounded-xl border bg-ivory px-4 py-3 text-sm outline-none transition focus:border-redlingote focus:bg-white ${
                  formErrors.name ? 'border-redlingote ring-1 ring-redlingote/30' : 'border-black/15'
                }`}
              />
              {formErrors.name && <p className="mt-1 text-xs font-semibold text-redlingote">{formErrors.name}</p>}
            </div>

            {/* Teléfono con formateador */}
            <div>
              <label className="block text-xs font-bold text-black/70 mb-1">
                Teléfono WhatsApp (para confirmar tu pedido):
              </label>
              <input
                value={phone}
                onChange={e => handlePhoneChange(e.target.value)}
                placeholder="8888-8888"
                inputMode="tel"
                aria-invalid={Boolean(formErrors.phone)}
                className={`w-full rounded-xl border bg-ivory px-4 py-3 text-sm outline-none transition focus:border-redlingote focus:bg-white ${
                  formErrors.phone ? 'border-redlingote ring-1 ring-redlingote/30' : 'border-black/15'
                }`}
              />
              {formErrors.phone && <p className="mt-1 text-xs font-semibold text-redlingote">{formErrors.phone}</p>}
            </div>

            {/* Número de comensales */}
            <div>
              <label className="block text-xs font-bold text-black/70 mb-1">Número estimado de personas:</label>
              <select
                value={people}
                onChange={e => setPeople(e.target.value)}
                className="w-full rounded-xl border border-black/15 bg-ivory px-4 py-3 text-sm outline-none transition focus:border-redlingote focus:bg-white"
              >
                <option value="4">4 comensales (Recomendado estándar)</option>
                <option value="5">5 comensales</option>
                <option value="6">6 comensales</option>
                <option value="7">7 comensales</option>
                <option value="8">8 comensales</option>
                <option value="10">10 o más comensales</option>
              </select>
            </div>

            {/* Fecha de recogida */}
            <div>
              <label className="block text-xs font-bold text-black/70 mb-1">
                Fecha de Recogida (Mínimo 24 horas de antelación):
              </label>
              <input
                type="date"
                min={tomorrowStr}
                value={date}
                onChange={e => setDate(e.target.value)}
                aria-invalid={Boolean(formErrors.date)}
                className={`w-full rounded-xl border bg-ivory px-4 py-3 text-sm outline-none transition focus:border-redlingote focus:bg-white ${
                  formErrors.date ? 'border-redlingote ring-1 ring-redlingote/30' : 'border-black/15'
                }`}
              />
              {formErrors.date && <p className="mt-1 text-xs font-semibold text-redlingote">{formErrors.date}</p>}
            </div>

            {/* Selector Visual de Franjas Horarias */}
            <div>
              <label className="block text-xs font-bold text-black/70 mb-2">
                Horario de recogida programada:
              </label>

              {!date ? (
                <div className="rounded-xl border border-dashed border-black/20 bg-ivory p-3.5 text-center text-xs text-black/50">
                  📅 Selecciona primero una fecha para ver los horarios disponibles.
                </div>
              ) : loadingSlots ? (
                <div className="rounded-xl bg-ivory p-4 text-center text-xs font-bold text-black/60 flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin">⏳</span> Verificando cupos en cocina...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-center text-xs text-amber-900">
                  {includesPaella
                    ? '⚠️ Las paellas se preparan de Viernes a Domingo para almuerzo (12:00 MD a 3:30 PM). Por favor elige una fecha en fin de semana.'
                    : 'No hay cupos disponibles para esta fecha. Intenta con otra.'}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {availableSlots.map(slot => {
                      const isSelected = time === slot.value
                      const isAvailable = slot.isAvailable !== false

                      return (
                        <button
                          key={slot.value}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => setTime(slot.value)}
                          className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-center text-xs transition cursor-pointer ${
                            isSelected
                              ? 'bg-redlingote text-white font-black shadow-md ring-2 ring-redlingote/30 scale-[1.02]'
                              : isAvailable
                              ? 'border border-black/15 bg-ivory text-ink font-semibold hover:border-redlingote hover:bg-white'
                              : 'border border-black/10 bg-gray-100 text-black/30 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <span className="font-bold text-xs">{slot.label}</span>
                          <span className={`text-[9px] mt-0.5 ${
                            isSelected ? 'text-white/80' : isAvailable ? 'text-emerald-700 font-bold' : 'text-rose-600'
                          }`}>
                            {isAvailable ? (slot.remaining ? `${slot.remaining} disp.` : 'Disponible') : 'Agotado'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {formErrors.time && <p className="mt-1 text-xs font-semibold text-redlingote">{formErrors.time}</p>}
                </div>
              )}

              {date && availableSlots.length > 0 && (
                <p className="mt-2 text-[11px] leading-4 text-black/50">
                  {includesPaella
                    ? '🍲 Paellas: 1 pedido exclusivo por franja de 30 min para garantizar cocción óptima.'
                    : '⏰ Horarios de almuerzo (fin de semana) y tarde (entre semana).'}
                </p>
              )}
            </div>
          </div>

          {includesPaella && (
            <div className="mt-4 rounded-xl bg-saffron/15 p-3 text-xs leading-5 text-amber-950 flex items-center gap-2">
              <span>🥘</span>
              <div>
                <strong>Entrega de paella:</strong> se entrega en paellera desechable de aluminio lista para abrir y servir caliente en tu mesa.
              </div>
            </div>
          )}

          {notice && (
            <div className="mt-4 rounded-xl bg-redlingote/10 border border-redlingote/20 p-3.5 text-xs font-bold text-redlingote">
              {notice}
            </div>
          )}

          {/* Botón CTA Principal */}
          <button
            onClick={onOpenConfirmation}
            className="mt-6 w-full rounded-2xl bg-redlingote px-5 py-4 font-black text-white shadow-xl shadow-red-900/20 transition hover:bg-red-700 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer text-base"
          >
            Revisar y Confirmar Pedido →
          </button>

          {/* Información SINPE con botón de copiar */}
          <div className="mt-4 rounded-xl border border-black/10 bg-ivory p-3 text-center text-xs leading-5 text-black/60">
            <div className="flex items-center justify-center gap-2">
              <span>Transferencia SINPE Móvil al:</span>
              <strong className="text-ink font-mono text-sm">{SINPE_NUMBER}</strong>
              <button
                type="button"
                onClick={handleCopySinpe}
                className="rounded-md bg-white border border-black/15 px-2 py-0.5 text-[10px] font-bold hover:bg-black hover:text-white transition"
              >
                {copiedSinpe ? '✓ ¡Copiado!' : 'Copiar'}
              </button>
            </div>
            <div className="text-[11px] text-black/50 mt-1">
              Se solicita un adelanto del 50% para reservar tu cupo de cocina.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
