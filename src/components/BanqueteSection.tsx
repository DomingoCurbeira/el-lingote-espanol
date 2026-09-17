import React from 'react'

type BanqueteSectionProps = {
  onSelectBanquete: () => void
}

export const BanqueteSection: React.FC<BanqueteSectionProps> = ({ onSelectBanquete }) => {
  return (
    <section id="banquete" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <div className="overflow-hidden rounded-[2rem] bg-saffron shadow-soft">
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-8 sm:p-12 lg:p-16">
            <div className="inline-flex rounded-full bg-ink px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-white">
              La experiencia completa
            </div>
            <h2 className="display mt-5 text-4xl font-bold leading-tight sm:text-5xl">El Banquete Familiar Español</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-black/65">
              Todo lo necesario para sentar a cuatro personas alrededor de una buena mesa.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                '🥔 Tortilla española · 4 pax',
                '🥘 Paella Mixta · 4 pax',
                '🍌 Tarta de queso + plátano · 4 porciones',
                '🥗 Ensalada de cortesía',
                '🧄 Alioli de cortesía',
              ].map(item => (
                <div key={item} className="rounded-xl bg-white/55 px-4 py-3 text-sm font-semibold">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-end gap-5">
              <div>
                <div className="text-sm text-black/50 line-through">Valor por separado · ₡51.000</div>
                <div className="text-4xl font-black">₡45.000</div>
              </div>
              <div className="rounded-full bg-redlingote px-4 py-2 text-sm font-black text-white">
                Ahorras ₡6.000
              </div>
            </div>

            <button
              onClick={onSelectBanquete}
              className="mt-8 rounded-full bg-ink px-7 py-3.5 font-bold text-white transition hover:-translate-y-0.5"
            >
              Quiero el Banquete →
            </button>
          </div>

          <div className="relative min-h-[360px] overflow-hidden bg-ink">
            <img src="/assets/banquete-familiar.png" alt="Banquete Familiar Español de El Lingote Español" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white sm:p-10">
              <div className="display text-3xl font-bold">Una mesa.<br />Cinco razones para quedarse.</div>
              <div className="mt-4 text-sm uppercase tracking-[.2em] text-white/65">España × Costa Rica</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
