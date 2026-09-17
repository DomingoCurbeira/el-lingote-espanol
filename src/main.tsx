import { StrictMode, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { Cart, FormErrors } from './types'
import { products, WHATSAPP_NUMBER } from './data/products'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { ProductCard } from './components/ProductCard'
import { BanqueteSection } from './components/BanqueteSection'
import { HowItWorksSection } from './components/HowItWorksSection'
import { LocationSection } from './components/LocationSection'
import { ReservationSection } from './components/ReservationSection'
import { ExtrasModal } from './components/ExtrasModal'
import { ConfirmationModal } from './components/ConfirmationModal'
import { AdminPanel } from './components/AdminPanel'
import { OrderTrackerModal } from './components/OrderTrackerModal'
import { LUNCH_SLOTS, EVENING_SLOTS } from './data/products'

function App() {
  const [cart, setCart] = useState<Cart>({})
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [people, setPeople] = useState('4')
  const [notice, setNotice] = useState('')
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showExtras, setShowExtras] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showTracker, setShowTracker] = useState(false)

  const cartItems = useMemo(
    () => products.filter(p => cart[p.id]).map(p => ({ ...p, quantity: cart[p.id] })),
    [cart]
  )
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal

  const selectedSlot = [...LUNCH_SLOTS, ...EVENING_SLOTS].find(slot => slot.value === time)

  const add = (id: string) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }))
  const addMain = (id: string) => {
    add(id)
    setShowExtras(true)
  }

  const remove = (id: string) =>
    setCart(c => {
      const next = { ...c }
      if ((next[id] || 0) <= 1) delete next[id]
      else next[id]--
      return next
    })

  const banquete = () => {
    setCart({ banquete: 1 })
    setNotice('¡Banquete Familiar añadido (₡45.000)! Incluye Paella, Tortilla, 4 porciones de Tarta, Ensalada y Alioli.')
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' })
  }

  const validateOrder = () => {
    if (!cartItems.length) {
      setNotice('Añade al menos un producto antes de reservar.')
      return false
    }

    const errors: FormErrors = {}
    if (!name.trim()) errors.name = 'Indica tu nombre y apellido.'
    if (phone.replace(/\D/g, '').length < 8) errors.phone = 'Indica un teléfono válido.'
    if (!date) errors.date = 'Selecciona una fecha de recogida.'
    if (!time) errors.time = 'Selecciona un horario de recogida.'

    setFormErrors(errors)
    if (Object.keys(errors).length) {
      setNotice('Revisa los campos marcados para continuar.')
      return false
    }

    setNotice('')
    return true
  }

  const openConfirmation = () => {
    if (validateOrder()) setShowConfirmation(true)
  }

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <Header
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenTracker={() => setShowTracker(true)}
      />

      <main>
        <HeroSection />

        <section className="border-b border-black/10 bg-paper">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-3 lg:px-8">
            {[
              ['01', 'Eliges', 'Tu tortilla, paella o Banquete Familiar.'],
              ['02', 'Reservas', 'Indicas fecha y horario de recogida.'],
              ['03', 'Disfrutas', 'Cocinamos para ti y recoges recién hecho.'],
            ].map(([n, title, text]) => (
              <div key={n} className="flex gap-4">
                <div className="text-xs font-black text-redlingote">{n}</div>
                <div>
                  <div className="font-bold">{title}</div>
                  <div className="mt-1 text-sm leading-6 text-black/55">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="paellas" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[.25em] text-redlingote">El centro de la mesa</p>
              <h2 className="display mt-2 text-4xl font-bold sm:text-5xl">Nuestras paellas</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-black/55">
              Arroces preparados al momento, con sofrito tradicional y fondos concentrados. Elige tu estilo y nosotros hacemos el resto.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {products.filter(p => p.category === 'paella' && p.id !== 'banquete').map(p => (
              <ProductCard key={p.id} product={p} onAdd={addMain} />
            ))}
          </div>
        </section>

        <section id="tortilla" className="bg-ink text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 lg:grid-cols-[.75fr_1.25fr] lg:px-8 lg:py-24">
            <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] shadow-soft">
              <img src="/assets/tortilla.png" alt="Tortilla española clásica recién hecha" className="h-[420px] w-full object-cover object-center" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-6 pb-6 pt-16">
                <div className="text-xs font-black uppercase tracking-[.18em] text-saffron">La clásica</div>
                <div className="mt-1 text-sm font-semibold text-white/80">Entera, jugosa y hecha al momento.</div>
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[.25em] text-saffron">El Lingote que da nombre a la casa</p>
              <h2 className="display mt-3 text-4xl font-bold sm:text-5xl">La tortilla española.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">
                Una pieza familiar, cerrada y jugosa. Sin raciones sueltas: la tortilla llega entera, lista para cortar y poner en el centro de la mesa.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <span className="text-3xl font-black">₡8.000</span>
                <span className="text-sm text-white/50">4 personas · pieza completa</span>
                <button onClick={() => addMain('tortilla')} className="rounded-full bg-redlingote px-5 py-3 font-bold hover:bg-red-700 transition">
                  Añadir al pedido
                </button>
              </div>
            </div>
          </div>
        </section>

        <BanqueteSection onSelectBanquete={banquete} />

        <section className="bg-paper">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
            <div className="mb-10">
              <p className="text-xs font-black uppercase tracking-[.25em] text-olive">Para completar la mesa</p>
              <h2 className="display mt-2 text-4xl font-bold">Postre y acompañamientos</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.filter(p => ['postre', 'extra'].includes(p.category)).map(p => (
                <ProductCard key={p.id} product={p} onAdd={p.category === 'extra' ? undefined : add} />
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-saffron/35 bg-saffron/10 px-6 py-5 text-center sm:flex-row sm:text-left">
              <div>
                <div className="font-bold">¿Tienes dudas o peticiones especiales?</div>
                <p className="mt-1 text-sm text-black/55">Escríbenos directamente por WhatsApp y te asesoramos.</p>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, quisiera consultar sobre los pedidos y platillos de El Lingote Español.')}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
              >
                Consultar por WhatsApp →
              </a>
            </div>
          </div>
        </section>

        <HowItWorksSection />
        <LocationSection />

        <ReservationSection
          cartItems={cartItems}
          total={total}
          name={name}
          phone={phone}
          people={people}
          date={date}
          time={time}
          formErrors={formErrors}
          notice={notice}
          setName={setName}
          setPhone={setPhone}
          setPeople={setPeople}
          setDate={setDate}
          setTime={setTime}
          onAdd={add}
          onRemove={remove}
          onOpenConfirmation={openConfirmation}
        />

        <section className="bg-paper">
          <div className="mx-auto max-w-7xl px-5 py-14 text-center lg:px-8">
            <img src="/assets/logo.png" alt="El Lingote Español" className="mx-auto h-16 w-16 object-contain" />
            <div className="display mt-4 text-3xl font-bold sm:text-4xl">De nuestra cocina a tu mesa.</div>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-black/50">
              El Lingote Español · Tortillas & Paellas
              <br />
              Raíces españolas, corazón tico.
            </p>
          </div>
        </section>
      </main>

      {showExtras && <ExtrasModal onClose={() => setShowExtras(false)} onAddExtra={add} />}

      {showConfirmation && (
        <ConfirmationModal
          cartItems={cartItems}
          total={total}
          subtotal={subtotal}
          name={name}
          phone={phone}
          people={people}
          date={date}
          selectedSlot={selectedSlot}
          onClose={() => setShowConfirmation(false)}
        />
      )}

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      {showTracker && <OrderTrackerModal onClose={() => setShowTracker(false)} />}

      <footer className="border-t border-black/10 bg-ivory">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-black/50 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>© {new Date().getFullYear()} El Lingote Español</div>
          <div>Cartago, Costa Rica · Reserva previa · Recogida programada</div>
        </div>
        <p className="mx-auto max-w-7xl px-5 pb-7 text-center text-xs leading-5 text-black/40 lg:px-8">
          Las imágenes son de carácter ilustrativo. La presentación final de los productos puede variar.
        </p>
      </footer>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
