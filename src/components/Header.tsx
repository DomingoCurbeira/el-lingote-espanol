import React, { useState } from 'react'

type HeaderProps = {
  cartCount?: number
  onOpenTracker: () => void
  onOpenAdmin?: () => void
}

export const Header: React.FC<HeaderProps> = ({ 
  cartCount = 0, 
  onOpenTracker,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '#paellas', label: 'Paellas' },
    { href: '#tortilla', label: 'Tortilla' },
    { href: '#banquete', label: 'Banquete' },
    { href: '#como-funciona', label: 'Cómo funciona' },
    { href: '#recogida', label: 'Ubicación' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-ivory/95 shadow-xs backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        {/* LOGO Y NOMBRE DE LA MARCA (Destacado y visible siempre) */}
        <a href="#inicio" className="group flex items-center gap-3">
          <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <img 
              src="/assets/logo_lingote_oficial_ligero.webp" 
              alt="El Lingote Español" 
              className="h-full w-full object-contain filter drop-shadow-xs" 
            />
          </div>
          <div className="leading-tight">
            <div className="display text-lg sm:text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-redlingote">
              El Lingote Español
            </div>
            <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[.22em] text-redlingote">
              Tortillas & Paellas
            </div>
          </div>
        </a>

        {/* NAVEGACIÓN EN ESCRITORIO (Solo visible en pantallas medianas y grandes) */}
        <nav className="hidden items-center gap-7 text-sm font-bold text-ink/80 md:flex">
          {navLinks.map(link => (
            <a 
              key={link.href} 
              href={link.href} 
              className="transition hover:text-redlingote"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ACCIONES DEL HEADER */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botones exclusivos para ESCRITORIO */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={onOpenTracker}
              className="flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-bold text-ink transition hover:border-black hover:bg-black hover:text-white cursor-pointer shadow-xs"
              title="Rastrear el estado de mi pedido"
            >
              <span>🔍</span>
              <span>Rastrear Pedido</span>
            </button>

            <a
              href="#reservar"
              className="flex items-center gap-2 rounded-full bg-redlingote px-6 py-2.5 text-sm font-black text-white shadow-md shadow-red-900/20 transition hover:bg-red-700 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>{cartCount > 0 ? `Mi Pedido (${cartCount})` : 'Reservar'}</span>
              {cartCount > 0 ? <span>🛒</span> : <span>→</span>}
            </a>
          </div>

          {/* En MÓVIL: Único botón de menú hamburguesa (limpieza total del header) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Abrir menú de navegación"
            className="flex h-11 w-11 md:hidden items-center justify-center rounded-2xl border border-black/15 bg-white text-ink text-xl transition hover:bg-black/5 active:scale-95 shadow-xs"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE EN MÓVIL */}
      {mobileMenuOpen && (
        <div className="border-t border-black/10 bg-ivory px-5 py-5 md:hidden animate-in slide-in-from-top-2 duration-200 shadow-xl">
          {/* Opción destacada de rastreo en móvil */}
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              onOpenTracker()
            }}
            className="w-full flex items-center justify-between rounded-xl border border-black/15 bg-white p-3.5 text-sm font-bold text-ink shadow-xs transition hover:bg-black hover:text-white mb-4"
          >
            <div className="flex items-center gap-2.5">
              <span>🔍</span>
              <span>Rastrear mi pedido existente</span>
            </div>
            <span className="text-xs opacity-60">→</span>
          </button>

          {/* Enlaces de navegación */}
          <nav className="flex flex-col divide-y divide-black/5 text-sm font-bold text-ink">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-1 transition hover:text-redlingote flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-black/30 text-xs">›</span>
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
