import React from 'react'

export const HeroSection: React.FC = () => {
  return (
    <section id="inicio" className="noise relative overflow-hidden bg-ink text-white">
      <div className="hero-grid absolute inset-0 opacity-60" />
      <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-redlingote/20 blur-3xl" />
      <div className="absolute -bottom-56 left-1/3 h-[520px] w-[520px] rounded-full bg-saffron/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
        <div>
          {/* BANNER DESTACADO DE ALERTA DE 24 HORAS */}
          <div className="mb-5 inline-flex flex-wrap items-center gap-2 rounded-full border border-saffron/30 bg-saffron/15 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-saffron">
            <span>⏱️ Reserva previa con 24h de antelación</span>
            <span className="opacity-40">|</span>
            <span>Cartago, CR</span>
          </div>

          <h1 className="display max-w-3xl text-5xl font-bold leading-[.95] tracking-tight sm:text-6xl lg:text-8xl">
            Raíces españolas,<br />
            <span className="text-saffron">corazón tico.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/72 sm:text-xl">
            Tortillas y paellas hechas por encargo, recién terminadas y preparadas para llegar a tu mesa en su mejor momento.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#reservar" className="rounded-full bg-redlingote px-6 py-3.5 font-bold text-white transition hover:-translate-y-0.5">
              Reservar mi pedido →
            </a>
            <a href="#paellas" className="rounded-full border border-white/20 px-6 py-3.5 font-bold text-white transition hover:bg-white/10">
              Ver las paellas
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/60">
            <span>✓ Producción limitada</span>
            <span>✓ Mínimo 24h de anticipación</span>
            <span>✓ 50% adelanto por SINPE</span>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div
            className="float relative aspect-square w-[min(86vw,500px)] overflow-hidden rounded-[2.5rem] border border-white/10 bg-cover bg-center p-5 shadow-soft"
            style={{ backgroundImage: "url('/assets/hero.png')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-ink/35" />
            <div className="absolute inset-5 z-10 rounded-[2rem] border border-white/20" />
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="text-center">
                <div className="display text-4xl font-bold drop-shadow-lg sm:text-5xl">Hecho para tu mesa</div>
                <div className="mt-2 text-sm uppercase tracking-[.25em] text-white/65">Paellas · Tortillas · Postre</div>
              </div>
            </div>
            <div className="absolute bottom-7 left-7 z-10 rounded-2xl bg-ink/75 px-4 py-3 backdrop-blur">
              <div className="text-[10px] font-bold uppercase tracking-[.18em] text-saffron">El detalle importa</div>
              <div className="mt-1 text-sm font-semibold">Recién hecho · Reserva 24h antes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="tricolor h-1.5" />
    </section>
  )
}
