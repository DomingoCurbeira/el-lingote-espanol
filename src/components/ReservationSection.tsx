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

  // Fecha mínima permitida (Mañana = Hoy + 24 horas)
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

  const includesPaella = cartItems.some(item => item.category === 'paella' || item.id === 'banquete')
  const advancePayment = total * 0.5

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

  const calculateAvailableSlots = (): PickupSlot[] => {
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
        label: isFull ? `${slot.label} (Agotado)` : booked > 0 ? `${slot.label} (${MAX_ORDERS_PER_SLOT - booked} disp.)` : slot.label,
        isAvailable: !isFull,
      }
    })
  }

  const availableSlots = calculateAvailableSlots()

  return (
    <section id="reservar" className="bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-24">
        <div>
          <p className="text-xs font-black uppercase tracking-[.25em] text-saffron">Tu pedido</p>
          <h2 className="display mt-2 text-4xl font-bold sm:text-5xl">Reserva tu mesa española.</h2>
          <p className="mt-4 max-w-xl text-white/60">
            Completa los datos y generaremos el mensaje de WhatsApp con tu pedido listo para enviar.
          </p>

          {/* TARJETA INFORMATIVA DE REGLAS 24H Y 50% */}
          <div className="mt-6 space-y-3 rounded-2xl border border-saffron/30 bg-saffron/10 p-5 text-sm text-saffron leading-6">
            <div className="flex items-center gap-2 font-bold">
              <span>⏱️ Anticipación requerida: 24 horas</span>
            </div>
            <p className="text-xs text-white/80">
              Todas nuestras paellas y tortillas se preparan al momento con insumos frescos. Reservas únicamente de mañana en adelante.
            </p>
            <div className="text-xs font-semibold text-saffron border-t border-saffron/20 pt-2">
              💳 Adelanto mínimo del 50% por Sinpe Móvil para confirmar tu cupo.
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {cartItems.length ? (
              cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <div className="font-bold">{item.name}</div>
                      <div className="text-xs text-white/45">
                        {formatCRC(item.price)} · {item.people}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => onRemove(item.id)} className="h-8 w-8 rounded-full border border-white/15 hover:bg-white/10">
                      −
                    </button>
                    <span className="w-5 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => onAdd(item.id)} className="h-8 w-8 rounded-full border border-white/15 hover:bg-white/10">
                      +
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/45">
                Tu pedido está vacío. Elige una paella, tortilla o complemento.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-7 text-ink shadow-soft sm:p-9">
          <div className="flex items-end justify-between border-b border-black/10 pb-5">
            <div>
              <div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Resumen del pedido</div>
              <div className="mt-2 text-3xl font-black text-redlingote">{formatCRC(total)}</div>
            </div>
            {total > 0 && (
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                  Adelanto 50%: <strong>{formatCRC(advancePayment)}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-3">
            <div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nombre y apellido"
                aria-invalid={Boolean(formErrors.name)}
                className={`w-full rounded-xl border bg-ivory px-4 py-3 outline-none focus:border-redlingote ${
                  formErrors.name ? 'border-redlingote' : 'border-black/10'
                }`}
              />
              {formErrors.name && <p className="mt-1 text-xs font-semibold text-redlingote">{formErrors.name}</p>}
            </div>

            <div>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Teléfono"
                inputMode="tel"
                aria-invalid={Boolean(formErrors.phone)}
                className={`w-full rounded-xl border bg-ivory px-4 py-3 outline-none focus:border-redlingote ${
                  formErrors.phone ? 'border-redlingote' : 'border-black/10'
                }`}
              />
              {formErrors.phone && <p className="mt-1 text-xs font-semibold text-redlingote">{formErrors.phone}</p>}
            </div>

            <select
              value={people}
              onChange={e => setPeople(e.target.value)}
              className="rounded-xl border border-black/10 bg-ivory px-4 py-3 outline-none focus:border-redlingote"
            >
              <option value="4">4 personas</option>
              <option value="5">5 personas</option>
              <option value="6">6 personas</option>
              <option value="7">7 personas</option>
              <option value="8">8 personas</option>
            </select>

            <div>
              <label className="block text-[11px] font-bold text-black/50 mb-1">
                Fecha de Recogida (Mínimo 24h / a partir de mañana):
              </label>
              <input
                type="date"
                min={tomorrowStr}
                value={date}
                onChange={e => setDate(e.target.value)}
                aria-invalid={Boolean(formErrors.date)}
                className={`w-full rounded-xl border bg-ivory px-4 py-3 outline-none focus:border-redlingote ${
                  formErrors.date ? 'border-redlingote' : 'border-black/10'
                }`}
              />
              {formErrors.date && <p className="mt-1 text-xs font-semibold text-redlingote">{formErrors.date}</p>}
            </div>

            <div>
              <select
                value={time}
                onChange={e => setTime(e.target.value)}
                disabled={!date || !availableSlots.length || loadingSlots}
                aria-invalid={Boolean(formErrors.time)}
                className={`w-full rounded-xl border bg-ivory px-4 py-3 outline-none focus:border-redlingote disabled:cursor-not-allowed disabled:opacity-55 ${
                  formErrors.time ? 'border-redlingote' : 'border-black/10'
                }`}
              >
                <option value="">
                  {loadingSlots
                    ? 'Verificando cupos en base de datos...'
                    : date
                    ? 'Selecciona horario de recogida'
                    : 'Selecciona primero una fecha'}
                </option>
                {availableSlots.map(slot => (
                  <option key={slot.value} value={slot.value} disabled={slot.isAvailable === false}>
                    {slot.label}
                  </option>
                ))}
              </select>

              {date && (
                <p className="mt-1 text-xs leading-5 text-black/45">
                  {includesPaella
                    ? 'Paellas: viernes a domingo, 12:00 MD a 3:30 PM (Cupo limitado por franja).'
                    : 'Viernes a domingo: 12:00 MD a 3:30 PM · Lunes a viernes: 4:00 PM a 7:30 PM.'}
                </p>
              )}
              {formErrors.time && <p className="mt-1 text-xs font-semibold text-redlingote">{formErrors.time}</p>}
            </div>
          </div>

          {includesPaella && (
            <div className="mt-4 rounded-xl bg-saffron/15 p-4 text-sm leading-6">
              <strong>Entrega de paella:</strong> se prepara en una bandeja de aluminio desechable, lista para servir.
            </div>
          )}

          {notice && <div className="mt-4 rounded-xl bg-olive/10 p-4 text-sm font-semibold text-olive">{notice}</div>}

          <button
            onClick={onOpenConfirmation}
            className="mt-5 w-full rounded-xl bg-redlingote px-5 py-4 font-black text-white shadow-lg shadow-red-900/15 transition hover:-translate-y-0.5"
          >
            Revisar pedido →
          </button>

          <div className="mt-4 text-center text-xs leading-5 text-black/40">
            Sinpe Móvil: <strong>{SINPE_NUMBER}</strong>
            <br />
            Se solicita un adelanto del 50% para confirmar el cupo.
          </div>
        </div>
      </div>
    </section>
  )
}
