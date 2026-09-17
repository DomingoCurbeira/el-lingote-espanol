import React, { useState, useEffect } from 'react'
import { Order, OrderStatus } from '../types'
import { fetchOrders, updateOrderStatus, deleteOrder } from '../services/ordersService'
import { isSupabaseConfigured } from '../lib/supabase'
import { formatCRC } from '../data/products'
import { loginAdmin, logoutAdmin, getAdminSession, AuthUser, subscribeToAuthChanges } from '../services/authService'
import { KitchenTicketModal } from './KitchenTicketModal'

type AdminPanelProps = {
  onClose: () => void
}

const STATUS_LABELS: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pendiente de Pago', bg: 'bg-amber-100', text: 'text-amber-800' },
  deposit_paid: { label: 'Adelanto 50% Recibido', bg: 'bg-teal-100', text: 'text-teal-800' },
  fully_paid: { label: 'Pago 100% Completo', bg: 'bg-blue-100', text: 'text-blue-800' },
  in_production: { label: 'En Cocina', bg: 'bg-purple-100', text: 'text-purple-800' },
  ready: { label: 'Listo para Recoger', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  delivered: { label: 'Entregado', bg: 'bg-gray-100', text: 'text-gray-800' },
  cancelled: { label: 'Cancelado', bg: 'bg-rose-100', text: 'text-rose-800' },
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  // Formulario de login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Datos de pedidos
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [showSqlHelp, setShowSqlHelp] = useState(false)

  // Modales
  const [selectedTicketOrder, setSelectedTicketOrder] = useState<Order | null>(null)
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState<Order | null>(null)

  // Verificar sesión existente
  useEffect(() => {
    getAdminSession().then(user => {
      setCurrentUser(user)
      setCheckingAuth(false)
      if (user) {
        loadOrdersData()
      }
    })

    const subscription = subscribeToAuthChanges(user => {
      setCurrentUser(user)
      if (user) {
        loadOrdersData()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !selectedTicketOrder && !confirmDeleteOrder) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, selectedTicketOrder, confirmDeleteOrder])

  const loadOrdersData = async () => {
    setLoadingOrders(true)
    const data = await fetchOrders()
    setOrders(data)
    setLoadingOrders(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setIsSubmitting(true)

    const result = await loginAdmin(email, password)
    setIsSubmitting(false)

    if (result.success && result.user) {
      setCurrentUser(result.user)
      loadOrdersData()
    } else {
      setAuthError(result.error || 'Credenciales de acceso inválidas.')
    }
  }

  const handleLogout = async () => {
    await logoutAdmin()
    setCurrentUser(null)
    setOrders([])
  }

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const success = await updateOrderStatus(orderId, newStatus)
    if (success) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    }
  }

  const handleSoftCancel = async (order: Order) => {
    await handleStatusChange(order.id, 'cancelled')
    setConfirmDeleteOrder(null)
  }

  const handleHardDelete = async (order: Order) => {
    const success = await deleteOrder(order.id)
    if (success) {
      setOrders(prev => prev.filter(o => o.id !== order.id))
    }
    setConfirmDeleteOrder(null)
  }

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    if (dateFilter && order.pickup_date !== dateFilter) return false
    return true
  })

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total), 0)

  // --------------------------------------------------------------------------
  // PANTALLA DE LOGIN (MOBILE FIRST)
  // --------------------------------------------------------------------------
  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="rounded-2xl bg-paper p-8 text-center font-bold text-ink">
          Verificando credenciales de acceso...
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <div className="w-full max-w-md rounded-[2rem] bg-paper p-6 sm:p-9 text-ink shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-redlingote/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-redlingote">
                🔒 Área Restringida
              </span>
              <h2 id="login-title" className="display mt-2 text-2xl sm:text-3xl font-bold">
                Acceso Administrador
              </h2>
              <p className="mt-1 text-xs leading-5 text-black/55">
                Ingresa con tu correo y contraseña registrados en Supabase Auth.
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-xl font-bold hover:bg-black/5 shrink-0"
            >
              ×
            </button>
          </div>

          {!isSupabaseConfigured && (
            <div className="mt-4 rounded-xl bg-amber-50 p-3.5 text-xs text-amber-900 border border-amber-200/80 leading-5">
              <strong>Modo de Prueba Local:</strong> Supabase no tiene claves configuradas aún. Para ingresar en demostración usa la contraseña: <code className="font-bold bg-amber-200/60 px-1 py-0.5 rounded">lingote2026</code>.
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-black/60 mb-1">Correo Administrador</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@ellingoteespanol.com"
                className="w-full min-h-[44px] rounded-xl border border-black/15 bg-ivory px-4 py-2.5 text-sm outline-none focus:border-redlingote"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black/60 mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full min-h-[44px] rounded-xl border border-black/15 bg-ivory px-4 py-2.5 text-sm outline-none focus:border-redlingote"
              />
            </div>

            {authError && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-redlingote border border-red-200">
                ⚠️ {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[48px] rounded-xl bg-redlingote px-5 py-3 font-black text-white transition hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              {isSubmitting ? 'Verificando...' : 'Iniciar Sesión Admin →'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-black/40">
            El Lingote Español · Supabase Auth Protected
          </div>
        </div>
      </div>
    )
  }

  // --------------------------------------------------------------------------
  // DASHBOARD DE ADMINISTRACIÓN (MOBILE-FIRST ADAPTIVE)
  // --------------------------------------------------------------------------
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-sm print:p-0 print:bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-title"
    >
      <div className="flex h-full w-full sm:h-auto sm:max-h-[92vh] sm:w-[95%] sm:max-w-5xl flex-col rounded-none sm:rounded-[2rem] bg-paper text-ink shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header Dashboard (Mobile-First) */}
        <div className="border-b border-black/10 bg-ivory p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl">⚙️</span>
                <h2 id="admin-title" className="display text-xl sm:text-2xl font-bold leading-tight">
                  Panel de Pedidos
                </h2>
                {isSupabaseConfigured ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    ● Supabase Auth
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                    ● Demo Local
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] sm:text-xs text-black/55 truncate max-w-[260px] sm:max-w-none">
                Sesión: <strong className="text-black/80">{currentUser.email}</strong>
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-xl font-bold hover:bg-black/5 shrink-0"
              aria-label="Cerrar panel admin"
            >
              ×
            </button>
          </div>

          {/* Botones de acción Header */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={loadOrdersData}
              className="flex-1 sm:flex-none rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-bold hover:bg-black/5 text-center min-h-[36px]"
              title="Recargar pedidos"
            >
              🔄 Recargar
            </button>

            <button
              onClick={() => setShowSqlHelp(!showSqlHelp)}
              className="flex-1 sm:flex-none rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-bold hover:bg-black/5 text-center min-h-[36px]"
            >
              {showSqlHelp ? 'Ocultar Guía' : '📋 Ver SQL'}
            </button>

            <button
              onClick={handleLogout}
              className="w-full sm:w-auto rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-redlingote hover:bg-red-100 transition text-center min-h-[36px]"
              title="Cerrar sesión"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Guía SQL */}
        {showSqlHelp && (
          <div className="border-b border-black/10 bg-amber-50/70 p-4 text-xs text-amber-900 leading-5">
            <strong>Cómo configurar usuarios administradores en Supabase Auth:</strong>
            <ol className="mt-2 list-decimal list-inside space-y-1">
              <li>En tu proyecto de Supabase, ve a <strong>Authentication &gt; Users</strong>.</li>
              <li>Haz clic en <strong>"Add user" &gt; "Create user"</strong>.</li>
              <li>Escribe el correo de administración y su contraseña.</li>
              <li>Ejecuta el archivo <code className="bg-amber-200/60 px-1 py-0.5 rounded">supabase/schema.sql</code> en el SQL Editor.</li>
            </ol>
          </div>
        )}

        {/* Bar de Estadísticas (2x2 en móvil) */}
        <div className="grid grid-cols-2 gap-2.5 border-b border-black/10 bg-white p-3.5 sm:gap-4 sm:p-5 sm:grid-cols-4">
          <div className="rounded-xl border border-black/10 bg-ivory p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-black/45">Total Pedidos</div>
            <div className="mt-0.5 text-xl sm:text-2xl font-black">{orders.length}</div>
          </div>
          <div className="rounded-xl border border-black/10 bg-ivory p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-black/45">Ventas</div>
            <div className="mt-0.5 text-lg sm:text-2xl font-black text-redlingote">{formatCRC(totalRevenue)}</div>
          </div>
          <div className="rounded-xl border border-black/10 bg-ivory p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-black/45">Adelanto 50%</div>
            <div className="mt-0.5 text-xl sm:text-2xl font-black text-teal-600">
              {orders.filter(o => ['deposit_paid', 'fully_paid'].includes(o.status)).length}
            </div>
          </div>
          <div className="rounded-xl border border-black/10 bg-ivory p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-black/45">En Cocina</div>
            <div className="mt-0.5 text-xl sm:text-2xl font-black text-emerald-600">
              {orders.filter(o => ['in_production', 'ready'].includes(o.status)).length}
            </div>
          </div>
        </div>

        {/* Filtros (Mobile Responsive Stack) */}
        <div className="flex flex-col gap-2.5 border-b border-black/10 bg-ivory/50 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-black/60 shrink-0">Estado:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-black/15 bg-white px-3 py-2 text-xs font-semibold outline-none min-h-[40px]"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente de Pago</option>
              <option value="deposit_paid">Adelanto 50% Recibido</option>
              <option value="fully_paid">Pago 100% Completo</option>
              <option value="in_production">En Cocina</option>
              <option value="ready">Listo para Recoger</option>
              <option value="delivered">Entregados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-black/60 shrink-0">Fecha:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="flex-1 sm:w-auto rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold outline-none min-h-[40px]"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs font-bold text-redlingote shrink-0 underline"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5">
          {loadingOrders ? (
            <div className="py-16 text-center text-sm font-semibold text-black/45">Cargando pedidos...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/15 py-16 text-center text-black/45">
              No se encontraron pedidos con los filtros seleccionados.
            </div>
          ) : (
            filteredOrders.map(order => {
              const badge = STATUS_LABELS[order.status] || STATUS_LABELS.pending
              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:border-black/20"
                >
                  {/* Encabezado Pedido Mobile */}
                  <div className="flex items-start justify-between gap-2 border-b border-black/10 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="display font-bold text-base sm:text-lg leading-tight">
                          {order.customer_name}
                        </span>
                        {order.has_paella && (
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                            🥘 Paella
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] font-mono text-black/40">
                          #{order.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-black/45">Total</div>
                      <div className="text-base sm:text-lg font-black text-redlingote">
                        {formatCRC(Number(order.total))}
                      </div>
                    </div>
                  </div>

                  {/* Datos de contacto y fecha (Con clic directo para llamar) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-black/70">
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="inline-flex items-center gap-1.5 text-blue-700 font-bold hover:underline"
                    >
                      <span>📞 {order.customer_phone}</span>
                      <span className="text-[10px] font-normal text-black/40">(Llamar)</span>
                    </a>
                    <div>👥 <strong>{order.people_count} personas</strong></div>
                    <div>📅 <strong>{order.pickup_date}</strong> a las <strong>{order.pickup_time}</strong></div>
                  </div>

                  {/* Ítems del pedido */}
                  {order.items && order.items.length > 0 && (
                    <div className="rounded-xl bg-ivory p-3 text-xs leading-5">
                      <strong className="text-black/70">Ítems reservados:</strong>
                      <ul className="mt-1 list-disc list-inside space-y-0.5 text-black/80">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.quantity} × {item.product_name} ({formatCRC(Number(item.total_price))})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Barra de Acciones Móvil (Touch-Friendly) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/10 pt-3">
                    <div className="text-[11px] text-amber-900 font-bold">
                      Adelanto (50%): {formatCRC(Number(order.total) * 0.5)}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setSelectedTicketOrder(order)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-black/20 bg-ivory px-3 py-2 text-xs font-bold text-ink hover:bg-black hover:text-white transition min-h-[40px]"
                        title="Imprimir comanda"
                      >
                        <span>🖨️</span>
                        <span>Comanda</span>
                      </button>

                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="flex-1 sm:flex-none rounded-xl border border-black/20 bg-white px-2.5 py-2 text-xs font-bold outline-none focus:border-redlingote min-h-[40px]"
                      >
                        <option value="pending">Pendiente de Pago</option>
                        <option value="deposit_paid">Adelanto 50% Recibido</option>
                        <option value="fully_paid">Pago 100% Completo</option>
                        <option value="in_production">En Cocina</option>
                        <option value="ready">Listo para Recoger</option>
                        <option value="delivered">Entregado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>

                      <button
                        onClick={() => setConfirmDeleteOrder(order)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition min-h-[40px] shrink-0"
                        title="Opciones de cancelación / eliminación"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Admin */}
        <div className="border-t border-black/10 bg-ivory px-4 py-3 text-center text-xs text-black/50">
          El Lingote Español · Panel Protegido con Supabase Auth
        </div>
      </div>

      {/* MODAL COMANDA DE COCINA */}
      {selectedTicketOrder && (
        <KitchenTicketModal
          order={selectedTicketOrder}
          onClose={() => setSelectedTicketOrder(null)}
        />
      )}

      {/* MODAL DE CONFIRMACIÓN DE CANCELACIÓN / ELIMINACIÓN MOBILE FIRST */}
      {confirmDeleteOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3.5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-paper p-6 text-ink shadow-2xl animate-in fade-in zoom-in duration-200">
            <span className="text-3xl">⚠️</span>
            <h3 className="display mt-2 text-2xl font-bold">Gestión de Cancelación</h3>
            <p className="mt-2 text-xs leading-5 text-black/60">
              ¿Qué acción deseas realizar con el pedido de <strong>{confirmDeleteOrder.customer_name}</strong> (#{confirmDeleteOrder.id.slice(0, 8)})?
            </p>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => handleSoftCancel(confirmDeleteOrder)}
                className="w-full rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-left hover:bg-amber-100 transition"
              >
                <div className="font-bold text-amber-950 text-xs">🔴 Marcar como Cancelado (Recomendado)</div>
                <div className="mt-0.5 text-[11px] text-amber-900/80">
                  Libera el horario de la cocina para otros clientes, pero **conserva la ficha** en la lista de cancelados por si el cliente paga después y deseas reactivarlo.
                </div>
              </button>

              <button
                onClick={() => handleHardDelete(confirmDeleteOrder)}
                className="w-full rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-left hover:bg-rose-100 transition"
              >
                <div className="font-bold text-rose-950 text-xs">❌ Eliminar por Completo (Permanente)</div>
                <div className="mt-0.5 text-[11px] text-rose-900/80">
                  Borra el pedido permanentemente de la base de datos (Úsala solo para pruebas o borradores).
                </div>
              </button>
            </div>

            <button
              onClick={() => setConfirmDeleteOrder(null)}
              className="mt-4 w-full rounded-xl border border-black/15 py-3 text-xs font-bold hover:bg-black/5 min-h-[44px]"
            >
              Volver atrás
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
