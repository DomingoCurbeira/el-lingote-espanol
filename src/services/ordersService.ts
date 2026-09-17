import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { CartItem, Order, OrderStatus } from '../types'

const LOCAL_STORAGE_KEY = 'el_lingote_orders_db'

function getLocalOrders(): Order[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('Error leyendo LocalStorage', e)
    return []
  }
}

function saveLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders))
  } catch (e) {
    console.error('Error guardando en LocalStorage', e)
  }
}

export type CreateOrderInput = {
  customerName: string
  customerPhone: string
  peopleCount: number
  pickupDate: string
  pickupTime: string
  subtotal: number
  total: number
  hasPaella: boolean
  items: CartItem[]
}

export async function saveOrderToDatabase(input: CreateOrderInput): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const newOrderId = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  if (!isSupabaseConfigured) {
    const localOrder: Order = {
      id: newOrderId,
      created_at: createdAt,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      people_count: input.peopleCount,
      pickup_date: input.pickupDate,
      pickup_time: input.pickupTime,
      subtotal: input.subtotal,
      total: input.total,
      status: 'pending',
      has_paella: input.hasPaella,
      items: input.items.map(item => ({
        id: crypto.randomUUID(),
        order_id: newOrderId,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))
    }

    const currentOrders = getLocalOrders()
    saveLocalOrders([localOrder, ...currentOrders])
    return { success: true, orderId: newOrderId }
  }

  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: input.customerName,
          customer_phone: input.customerPhone,
          people_count: input.peopleCount,
          pickup_date: input.pickupDate,
          pickup_time: input.pickupTime,
          subtotal: input.subtotal,
          total: input.total,
          status: 'pending',
          has_paella: input.hasPaella,
        },
      ])
      .select()
      .single()

    if (orderError) throw orderError

    const orderId = orderData.id

    const orderItemsToInsert = input.items.map(item => ({
      order_id: orderId,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert)

    if (itemsError) throw itemsError

    return { success: true, orderId }
  } catch (error: any) {
    console.error('Error insertando pedido en Supabase:', error)
    return { success: false, error: error.message || 'Error guardando pedido en la base de datos' }
  }
}

export async function fetchOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured) {
    return getLocalOrders()
  }

  try {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .order('created_at', { ascending: false })

    if (ordersError) throw ordersError
    return ordersData as Order[]
  } catch (error) {
    console.error('Error obteniendo pedidos de Supabase:', error)
    return getLocalOrders()
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const orders = getLocalOrders()
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o)
    saveLocalOrders(updated)
    return true
  }

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error actualizando estado del pedido:', error)
    return false
  }
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const orders = getLocalOrders().filter(o => o.id !== orderId)
    saveLocalOrders(orders)
    return true
  }

  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error eliminando pedido de Supabase:', error)
    return false
  }
}

export async function searchOrdersForTracking(query: string): Promise<Order[]> {
  // Elimina '#' inicial y espacios en blanco
  const cleanQuery = query.trim().replace(/^#/, '').toLowerCase()
  if (!cleanQuery) return []

  if (!isSupabaseConfigured) {
    const orders = getLocalOrders()
    const digitsOnly = cleanQuery.replace(/\D/g, '')
    return orders.filter(o => {
      const matchId = o.id.toLowerCase().replace(/-/g, '').includes(cleanQuery.replace(/-/g, ''))
      const matchPhone = digitsOnly.length >= 3 && o.customer_phone.replace(/\D/g, '').includes(digitsOnly)
      const matchName = o.customer_name.toLowerCase().includes(cleanQuery)
      return matchId || matchPhone || matchName
    })
  }

  try {
    // En Supabase, para evitar errores de tipo con la columna 'id' (UUID),
    // consultamos los pedidos recientes y realizamos el filtrado flexible.
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    const digitsOnly = cleanQuery.replace(/\D/g, '')

    const matches = (ordersData as Order[]).filter(o => {
      const matchId = o.id.toLowerCase().replace(/-/g, '').includes(cleanQuery.replace(/-/g, ''))
      const matchPhone = digitsOnly.length >= 3 && o.customer_phone.replace(/\D/g, '').includes(digitsOnly)
      const matchName = o.customer_name.toLowerCase().includes(cleanQuery)
      return matchId || matchPhone || matchName
    })

    return matches
  } catch (error) {
    console.error('Error buscando pedido para rastreo:', error)
    return []
  }
}

export async function getBookedSlotsForDate(date: string): Promise<Record<string, number>> {
  if (!date) return {}

  if (!isSupabaseConfigured) {
    const orders = getLocalOrders().filter(o => o.pickup_date === date && o.status !== 'cancelled')
    const counts: Record<string, number> = {}
    for (const o of orders) {
      counts[o.pickup_time] = (counts[o.pickup_time] || 0) + 1
    }
    return counts
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('pickup_time')
      .eq('pickup_date', date)
      .neq('status', 'cancelled')

    if (error) throw error

    const counts: Record<string, number> = {}
    data.forEach(item => {
      counts[item.pickup_time] = (counts[item.pickup_time] || 0) + 1
    })

    return counts
  } catch (error) {
    console.error('Error consultando franjas reservadas:', error)
    return {}
  }
}
