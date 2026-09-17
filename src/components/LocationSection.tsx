import React from 'react'

export const LocationSection: React.FC = () => {
  return (
    <section id="recogida" className="bg-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-8 lg:py-24">
        <div className="self-center">
          <p className="text-xs font-black uppercase tracking-[.25em] text-redlingote">Punto de recogida</p>
          <h2 className="display mt-2 text-4xl font-bold sm:text-5xl">Nos encontramos en El Guarco.</h2>
          <p className="mt-5 text-lg leading-8 text-black/60">
            La recogida se realiza en la entrada de Residencial Hacienda del Rey, Cartago. Consulta el mapa para comprobar que te queda cerca.
          </p>
          <p className="mt-4 text-sm leading-6 text-black/50">
            Al confirmar la reserva por WhatsApp te compartiremos las indicaciones exactas de llegada.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="https://www.google.com/maps/search/?api=1&query=9.85506%2C-83.94761"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              Abrir en Google Maps →
            </a>
            <a
              href="https://waze.com/ul?ll=9.85506%2C-83.94761&navigate=yes"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-ink px-5 py-3 text-sm font-bold transition hover:bg-ink hover:text-white"
            >
              Abrir en Waze →
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-ivory shadow-soft">
          <iframe
            title="Mapa de la entrada de Residencial Hacienda del Rey"
            src="https://www.google.com/maps?q=9.85506%2C-83.94761&output=embed"
            className="h-[360px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}
