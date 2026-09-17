import React, { useEffect } from 'react'
import { Order } from '../types'
import { formatCRC } from '../data/products'

type KitchenTicketModalProps = {
  order: Order
  onClose: () => void
}

export const KitchenTicketModal: React.FC<KitchenTicketModalProps> = ({ order, onClose }) => {
  const advancePayment = Number(order.total) * 0.5
  const remainingBalance = Number(order.total) * 0.5

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm print:p-0 print:bg-white print:inset-auto print:static"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-[2rem] bg-paper text-ink shadow-2xl overflow-hidden print:max-w-none print:shadow-none print:rounded-none print:bg-white print:w-full">
        {/* Header no imprimible */}
        <div className="flex items-center justify-between border-b border-black/10 bg-ivory px-6 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖨️</span>
            <span className="font-bold text-sm">Comanda de Cocina</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="rounded-full bg-redlingote px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-red-700 transition"
            >
              Imprimir ticket
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-lg leading-none hover:bg-black/5"
            >
              ×
            </button>
          </div>
        </div>

        {/* TICKET DE COCINA (IMPRIMIBLE) */}
        <div id="printable-ticket" className="flex-1 overflow-y-auto p-8 font-mono text-ink print:p-0 print:overflow-visible">
          <div className="border-2 border-dashed border-black/20 p-6 rounded-2xl bg-white print:border-black print:p-4 print:rounded-none">
            {/* Encabezado Ticket */}
            <div className="text-center pb-4 border-b border-dashed border-black/20">
              <div className="font-sans font-black text-xl tracking-tight">EL LINGOTE ESPAÑOL</div>
              <div className="text-[11px] uppercase tracking-widest text-black/60 font-sans mt-0.5">Tortillas & Paellas</div>
              <div className="mt-2 text-xs font-bold bg-black text-white px-3 py-1 rounded-full inline-block print:border print:border-black">
                COMANDA DE COCINA
              </div>
            </div>

            {/* Número y Fecha de registro */}
            <div className="my-4 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Nº Pedido:</span>
                <strong className="font-bold">#{order.id.slice(0, 8)}</strong>
              </div>
              <div className="flex justify-between text-black/60">
                <span>Creado:</span>
                <span>{new Date(order.created_at).toLocaleString('es-CR')}</span>
              </div>
            </div>

            {/* DETALLES DE SALIDA DE COCINA */}
            <div className="my-4 rounded-xl bg-amber-50 p-4 border border-amber-300 print:bg-gray-100 print:border-black">
              <div className="text-[10px] font-sans font-black uppercase tracking-wider text-amber-900 print:text-black">
                ⏰ HORA DE SALIDA DE COCINA
              </div>
              <div className="mt-1 text-2xl font-sans font-black text-redlingote print:text-black">
                {order.pickup_time}
              </div>
              <div className="mt-1 text-xs font-bold text-black/70">
                Fecha: {order.pickup_date}
              </div>
            </div>

            {/* DATOS DEL CLIENTE */}
            <div className="my-4 text-xs space-y-1.5 border-t border-b border-dashed border-black/20 py-3">
              <div>
                <span className="text-black/50">Cliente: </span>
                <strong className="font-sans font-bold text-sm">{order.customer_name}</strong>
              </div>
              <div>
                <span className="text-black/50">Teléfono: </span>
                <strong className="font-mono">{order.customer_phone}</strong>
              </div>
              <div>
                <span className="text-black/50">Comensales: </span>
                <strong>{order.people_count} personas</strong>
              </div>
            </div>

            {/* LISTA DE PLATILLOS */}
            <div className="my-4">
              <div className="text-xs font-bold font-sans uppercase tracking-wider text-black/50 mb-2">
                Ítems a Preparar:
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black text-left text-[10px] uppercase">
                    <th className="py-1">Cant.</th>
                    <th className="py-1">Producto</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-black/15">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, i) => (
                      <tr key={i} className="align-top">
                        <td className="py-2.5 font-bold text-sm text-redlingote print:text-black">
                          {item.quantity}×
                        </td>
                        <td className="py-2.5 font-sans font-semibold">
                          {item.product_name}
                        </td>
                        <td className="py-2.5 text-right font-mono">
                          {formatCRC(Number(item.total_price))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-3 text-center text-black/40">
                        Detalle no disponible
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* NOTAS DE COCINA */}
            {order.has_paella && (
              <div className="my-3 rounded-lg bg-orange-50 p-2.5 text-xs text-orange-900 border border-orange-200 print:bg-white print:border-black">
                <strong>📌 Nota Paellera:</strong> Entregar en bandeja de aluminio desechable bien sellada.
              </div>
            )}

            {/* MONTO ADELANTO Y SALDO */}
            <div className="mt-5 border-t-2 border-black pt-3 text-xs space-y-1.5">
              <div className="flex justify-between font-bold">
                <span>VALOR TOTAL:</span>
                <span className="font-black">{formatCRC(Number(order.total))}</span>
              </div>
              <div className="flex justify-between text-emerald-800 print:text-black font-semibold">
                <span>Adelanto Mínimo (50%):</span>
                <span>{formatCRC(advancePayment)}</span>
              </div>
              <div className="flex justify-between text-black/60">
                <span>Saldo Pendiente (al entregar):</span>
                <span className="font-bold text-redlingote print:text-black">{formatCRC(remainingBalance)}</span>
              </div>
            </div>

            {/* Pie de ticket */}
            <div className="mt-6 text-center text-[10px] text-black/40 font-sans border-t border-dashed border-black/20 pt-3">
              *** El Lingote Español · Cartago ***
            </div>
          </div>
        </div>

        {/* Footer no imprimible */}
        <div className="border-t border-black/10 bg-ivory p-4 text-center print:hidden">
          <button
            onClick={handlePrint}
            className="w-full rounded-xl bg-ink px-5 py-3 text-xs font-bold text-white transition hover:bg-black"
          >
            🖨️ Enviar a impresora / Guardar PDF
          </button>
        </div>
      </div>
    </div>
  )
}
