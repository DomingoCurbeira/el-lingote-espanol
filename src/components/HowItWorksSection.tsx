import React from 'react'

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="como-funciona" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[.25em] text-redlingote">Así trabajamos</p>
          <h2 className="display mt-2 text-4xl font-bold sm:text-5xl">No hacemos paellas para esperar.</h2>
          <p className="mt-5 text-lg leading-8 text-black/60">
            Las hacemos para tu mesa. Por eso trabajamos exclusivamente con reserva previa y producción limitada.
          </p>

          <div className="mt-8 space-y-5">
            {[
              ['Reserva previa & Adelanto 50%', 'Reserva con al menos 24 horas de antelación. Tu pedido se confirma una vez recibido el comprobante del adelanto (mínimo 50%) por Sinpe Móvil.'],
              ['Horario asignado', 'Cada franja admite un número limitado de pedidos y se reserva formalmente con el adelanto del 50%.'],
              ['Recién hecho', 'Organizamos la producción para que tu pedido esté listo para salir de cocina a la hora acordada.'],
              ['Bandeja desechable', 'Las paellas se entregan en bandejas de aluminio desechables, listas para servir y disfrutar.'],
            ].map(([title, text], i) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-redlingote text-xs font-black text-white">
                  {i + 1}
                </div>
                <div>
                  <div className="font-bold">{title}</div>
                  <div className="mt-1 text-sm leading-6 text-black/55">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-paper p-7 card-shadow sm:p-9">
          <div className="text-xs font-black uppercase tracking-[.2em] text-redlingote">Horarios de recogida</div>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-black/10 bg-white p-5">
              <div className="font-bold">Viernes a domingo</div>
              <p className="mt-1 text-sm leading-6 text-black/55">Paellas, tortillas y postres · 12:00 MD a 3:30 PM</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-5">
              <div className="font-bold">Lunes a viernes</div>
              <p className="mt-1 text-sm leading-6 text-black/55">Tortillas y postres · 4:00 PM a 7:30 PM</p>
            </div>
          </div>
          <p className="mt-6 text-sm leading-6 text-black/50">
            Producción limitada por horario. Reserva con al menos 2 horas de antelación; el cupo se reserva formalmente al verificar el adelanto del 50%.
          </p>
        </div>
      </div>
    </section>
  )
}
