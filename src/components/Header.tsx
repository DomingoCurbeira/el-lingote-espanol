import React from 'react'

type HeaderProps = {
  onOpenAdmin: () => void
  onOpenTracker: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, onOpenTracker }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
        <a href="#inicio" className="flex items-center gap-3">
          <img src="/assets/logo_lingote_oficial_ligero.webp" alt="El Lingote Español" className="h-12 w-12 object-contain" />
          <div className="hidden sm:block leading-tight">
            <div className="display text-lg font-bold">El Lingote Español</div>
            <div className="text-[10px] font-bold uppercase tracking-[.2em] text-redlingote">Tortillas & Paellas</div>
          </div>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
          <a href="#paellas" className="hover:text-redlingote transition">Paellas</a>
          <a href="#tortilla" className="hover:text-redlingote transition">Tortilla</a>
          <a href="#banquete" className="hover:text-redlingote transition">Banquete</a>
          <a href="#recogida" className="hover:text-redlingote transition">Recogida</a>
          <a href="#como-funciona" className="hover:text-redlingote transition">Cómo funciona</a>
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenTracker}
            className="flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3.5 py-1.5 text-xs font-bold text-ink transition hover:bg-black hover:text-white"
            title="Rastrear estado de mi pedido"
          >
            <span>🔍</span>
            <span className="hidden sm:inline">Rastrear Pedido</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 rounded-full border border-black/15 bg-white/60 px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-ink hover:text-white"
            title="Abrir panel de administración"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">Admin</span>
          </button>

          <a
            href="#reservar"
            className="rounded-full bg-redlingote px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-red-900/15 transition hover:-translate-y-0.5"
          >
            Reservar
          </a>
        </div>
      </div>
    </header>
  )
}
