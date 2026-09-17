import React, { useEffect } from 'react'
import { Product } from '../types'
import { products, formatCRC } from '../data/products'

type ExtrasModalProps = {
  onClose: () => void
  onAddExtra: (id: string) => void
}

export const ExtrasModal: React.FC<ExtrasModalProps> = ({ onClose, onAddExtra }) => {
  const extras = products.filter(p => p.category === 'extra')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/60 p-4 backdrop-blur-sm sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="extras-title"
    >
      <div className="w-full max-w-xl rounded-[2rem] bg-paper p-7 text-ink shadow-2xl sm:p-9 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-redlingote">Completa la mesa</p>
            <h2 id="extras-title" className="display mt-2 text-3xl font-bold">¿Añadimos algo más?</h2>
            <p className="mt-2 text-sm leading-6 text-black/55">Establecidos para acompañar perfectamente tu paella o tortilla.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar acompañamientos"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-xl leading-none transition hover:bg-black/5"
          >
            ×
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {extras.map(product => (
            <div key={product.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white">
              <img src={product.image} alt={product.imageAlt ?? product.name} className="h-32 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="display text-xl font-bold leading-tight">{product.name}</h3>
                  <strong className="shrink-0 text-redlingote">{formatCRC(product.price)}</strong>
                </div>
                <button
                  onClick={() => onAddExtra(product.id)}
                  className="mt-4 w-full rounded-xl border border-ink px-4 py-2.5 text-sm font-black transition hover:bg-ink hover:text-white"
                >
                  Añadir
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-redlingote px-5 py-3.5 font-black text-white transition hover:bg-red-700"
        >
          Continuar con mi pedido →
        </button>
      </div>
    </div>
  )
}
