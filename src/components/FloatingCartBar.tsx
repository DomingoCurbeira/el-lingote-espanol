import React, { useState, useEffect } from 'react'
import { CartItem } from '../types'
import { formatCRC } from '../data/products'

type FloatingCartBarProps = {
  cartItems: CartItem[]
  total: number
  onGoToCheckout: () => void
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  cartItems,
  total,
  onGoToCheckout,
}) => {
  const [scrolledPastHero, setScrolledPastHero] = useState(false)
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const advancePayment = total * 0.5

  useEffect(() => {
    const handleScroll = () => {
      // Activar el botón flotante después de hacer un poco de scroll (pasando el hero)
      if (window.scrollY > 240) {
        setScrolledPastHero(true)
      } else {
        setScrolledPastHero(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // CASO 1: Carrito vacío pero el usuario hizo scroll en celular -> Botón flotante para reservar
  if (totalCount === 0) {
    if (!scrolledPastHero) return null

    return (
      <aside 
        aria-label="Botón flotante de reserva rápida"
        className="fixed bottom-4 inset-x-0 z-40 px-4 md:hidden pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <div className="mx-auto max-w-xs pointer-events-auto flex justify-center">
          <button
            onClick={onGoToCheckout}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-redlingote px-6 py-3.5 text-sm font-black text-white shadow-2xl shadow-red-950/40 ring-2 ring-white/20 transition hover:bg-red-700 active:scale-95 cursor-pointer"
          >
            <span>📅</span>
            <span>Reservar mi pedido</span>
            <span className="text-base">→</span>
          </button>
        </div>
      </aside>
    )
  }

  // CASO 2: Carrito con productos (>0) -> El botón se transforma en la barra interactiva del pedido
  return (
    <aside 
      aria-label="Resumen flotante del pedido"
      className="fixed bottom-4 inset-x-0 z-40 px-3 sm:px-6 pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="mx-auto max-w-4xl pointer-events-auto rounded-2xl sm:rounded-full border border-black/15 bg-ink/95 p-3.5 sm:py-3 sm:px-6 text-white shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 transition-all hover:bg-ink">
        {/* Lado izquierdo: Datos del carrito */}
        <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
          <div className="relative flex items-center justify-center h-11 w-11 shrink-0 rounded-full bg-redlingote text-white shadow-md">
            <span className="text-xl">🛒</span>
            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-saffron px-1 text-[11px] font-black text-ink shadow">
              {totalCount}
            </span>
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-white/60 font-semibold">Tu pedido:</span>
              <span className="text-lg sm:text-xl font-black text-saffron">{formatCRC(total)}</span>
            </div>
            <div className="text-[11px] text-white/70">
              Adelanto 50% por SINPE: <strong className="text-white font-bold">{formatCRC(advancePayment)}</strong>
            </div>
          </div>

          {/* En pantalla mediana/grande resumen rápido de ítems */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-white/60 border-l border-white/15 pl-4 max-w-xs truncate">
            {cartItems.map((item, idx) => (
              <span key={item.id} className="truncate">
                {item.quantity}× {item.name.replace('Paella Tradicional de ', '').replace('Paella ', '').replace('· La Clásica', '')}
                {idx < cartItems.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Botón CTA a la reserva */}
        <button
          onClick={onGoToCheckout}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl sm:rounded-full bg-redlingote px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-red-900/30 transition hover:bg-red-700 hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <span>Completar Reserva</span>
          <span className="text-base">→</span>
        </button>
      </div>
    </aside>
  )
}
