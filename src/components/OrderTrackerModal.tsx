import React, { useState, useEffect } from 'react'
import { Order, OrderStatus } from '../types'
import { searchOrdersForTracking } from '../services/ordersService'
import { formatCRC } from '../data/products'

type OrderTrackerModalProps = {
  onClose: () => void
}

const STEPPER_STAGES: { key: OrderStatus[]; label: string; icon: string }[] = [
  { key: ['pending'], label: 'Pendiente de Pago', icon: '📝' },
  { key: ['deposit_paid', 'fully_paid'], label: 'Pago / Adelanto Confirmado', icon: '💳' },
  { key: ['in_production'], label: 'En Cocina', icon: '👨‍🍳' },
  { key: ['ready'], label: 'Listo para Recoger', icon: '📦' },
  { key: ['delivered'], label: 'Entregado', icon: '✅' },
]

function getStageIndex(status: OrderStatus): number {
  if (status === 'pending') return 0
  if (status === 'deposit_paid' || status === 'fully_paid') return 1
  if (status === 'in_production') return 2
  if (status === 'ready') return 3
  if (status === 'delivered') return 4
  return -1 // Cancelled
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({ onClose }) => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Order[] | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    const results = await searchOrdersForTracking(query)
    setSearchResults(results)
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracker-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-[2rem] bg-paper text-ink shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 bg-ivory px-4 py-4 sm:px-8 sm:py-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0">🔍</span>
            <div>
              <h2 id="tracker-title" className="display text-xl sm:text-2xl font-bold">
                Rastrear mi Pedido
              </h2>
              <p className="text-xs text-black/55">
                Consulta el estado de preparación y recogida de tu pedido en tiempo real.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-xl font-bold hover:bg-black/5 shrink-0"
          >
            ×
          </button>
        </div>

        {/* Formulario de Búsqueda */}
        <div className="border-b border-black/10 bg-white p-4 sm:p-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ingresa tu Nº de Pedido (#code) o Teléfono"
              className="w-full sm:flex-1 rounded-xl border border-black/15 bg-ivory px-4 py-3 text-sm outline-none focus:border-redlingote min-h-[46px]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto rounded-xl bg-redlingote px-6 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-50 shrink-0 min-h-[46px] flex items-center justify-center gap-2"
            >
              <span>🔍</span>
              <span>{loading ? 'Buscando...' : 'Buscar Pedido'}</span>
            </button>
          </form>
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {searchResults === null ? (
            <div className="py-12 text-center text-xs text-black/45">
              Ingresa el número de pedido que recibiste por WhatsApp o tu número de teléfono para consultar el progreso.
            </div>
          ) : searchResults.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/15 py-12 text-center text-sm font-semibold text-black/50">
              No encontramos ningún pedido activo con los datos ingresados. Verifica el número e intenta nuevamente.
            </div>
          ) : (
            <div className="space-y-8">
              {searchResults.map(order => {
                const stageIdx = getStageIndex(order.status)
                const isCancelled = order.status === 'cancelled'

                return (
                  <div key={order.id} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                    {/* Encabezado Pedido */}
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-redlingote">
                            Pedido #{order.id.slice(0, 8)}
                          </span>
                          <span className="text-xs text-black/40">
                            • {new Date(order.created_at).toLocaleDateString('es-CR')}
                          </span>
                        </div>
                        <h3 className="display text-xl font-bold mt-1">{order.customer_name}</h3>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-black/45">Recogida programada:</div>
                        <div className="text-sm font-black text-ink">
                          {order.pickup_date} a las {order.pickup_time}
                        </div>
                      </div>
                    </div>

                    {/* BARRA DE PROGRESO DE ESTADOS (STEPPER) */}
                    {isCancelled ? (
                      <div className="my-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-center text-xs font-bold text-rose-800">
                        🔴 Este pedido fue cancelado. Si ya realizaste el pago del adelanto, contáctanos por WhatsApp para reactivarlo.
                      </div>
                    ) : (
                      <div className="my-6">
                        <div className="text-xs font-bold text-black/50 mb-3 uppercase tracking-wider">
                          Progreso de tu pedido:
                        </div>
                        <div className="relative flex items-center justify-between">
                          {/* Línea conectora */}
                          <div className="absolute left-0 top-1/2 -z-0 h-1 w-full -translate-y-1/2 bg-black/10" />
                          <div
                            className="absolute left-0 top-1/2 -z-0 h-1 bg-redlingote transition-all duration-500 -translate-y-1/2"
                            style={{ width: `${(stageIdx / (STEPPER_STAGES.length - 1)) * 100}%` }}
                          />

                          {STEPPER_STAGES.map((stage, idx) => {
                            const isCompleted = stageIdx >= idx
                            const isCurrent = stageIdx === idx

                            return (
                              <div key={idx} className="relative z-10 flex flex-col items-center">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-full text-base transition duration-300 ${
                                    isCompleted
                                      ? 'bg-redlingote text-white shadow-md ring-4 ring-red-100'
                                      : 'bg-ivory border border-black/20 text-black/40'
                                  } ${isCurrent ? 'scale-110 font-bold' : ''}`}
                                >
                                  {stage.icon}
                                </div>
                                <span
                                  className={`mt-2 text-[10px] sm:text-xs text-center max-w-[70px] leading-tight font-semibold ${
                                    isCurrent ? 'text-redlingote font-black' : isCompleted ? 'text-black' : 'text-black/40'
                                  }`}
                                >
                                  {stage.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* DESGLOSE DEL PEDIDO */}
                    <div className="rounded-xl bg-ivory p-4 text-xs leading-5">
                      <div className="font-bold text-black/70 mb-1">Ítems reservados:</div>
                      {order.items && order.items.length > 0 ? (
                        <ul className="list-disc list-inside space-y-0.5 text-black/80">
                          {order.items.map((item, i) => (
                            <li key={i}>
                              {item.quantity} × {item.product_name} ({formatCRC(Number(item.total_price))})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-black/50">Detalle del pedido registrado.</span>
                      )}

                      <div className="mt-3 flex flex-wrap items-center justify-between border-t border-black/10 pt-2 font-bold text-xs">
                        <span>Total del Pedido: {formatCRC(Number(order.total))}</span>
                        <span className="text-redlingote">
                          {order.status === 'deposit_paid'
                            ? '✓ Adelanto 50% Verificado'
                            : order.status === 'fully_paid'
                            ? '✓ 100% Pagado'
                            : 'Pendiente de Comprobante SINPE (50%)'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-black/10 bg-ivory px-6 py-4 text-center text-xs text-black/50">
          El Lingote Español · Rastreo de Pedidos en Tiempo Real
        </div>
      </div>
    </div>
  )
}
