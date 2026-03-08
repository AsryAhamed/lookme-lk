import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Product, Order, Customer, Banner, Category } from '../types/database'
import { toast } from 'sonner'

export const keys = {
  products:    ['products'] as const,
  product:     (slug: string) => ['products', slug] as const,
  featured:    ['products', 'featured'] as const,
  newArrivals: ['products', 'new-arrivals'] as const,
  orders:      ['orders'] as const,
  customers:   ['customers'] as const,
  banners:     ['banners'] as const,
  categories:  ['categories'] as const,
  dashboard:   ['dashboard'] as const,
}

// ── PRODUCTS ─────────────────────────────────────────────────

export function useProducts() {
  return useQuery({
    queryKey: keys.products,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as Product[]
    },
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: keys.featured,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(8)
      if (error) throw error
      return (data ?? []) as unknown as Product[]
    },
  })
}

export function useNewArrivals() {
  return useQuery({
    queryKey: keys.newArrivals,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .eq('is_new_arrival', true)
        .limit(8)
      if (error) throw error
      return (data ?? []) as unknown as Product[]
    },
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: keys.product(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .single()
      if (error) throw error
      return data as unknown as Product
    },
    enabled: !!slug,
  })
}

export function useAdminProducts() {
  return useQuery({
    queryKey: [...keys.products, 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as Product[]
    },
  })
}

export function useUpsertProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (product: Partial<Product> & { id?: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      const { id, category, ...rest } = product as any

      // Strip joined fields — only send real DB columns
      const payload = {
        name:            rest.name,
        slug:            rest.slug,
        description:     rest.description     ?? null,
        category_id:     rest.category_id     ?? null,
        price:           rest.price,
        compare_price:   rest.compare_price   ?? null,
        cost_price:      rest.cost_price       ?? null,
        sku:             rest.sku              ?? null,
        stock_qty:       rest.stock_qty        ?? 0,
        low_stock_alert: rest.low_stock_alert  ?? 5,
        sizes:           rest.sizes            ?? [],
        colors:          rest.colors           ?? [],
        images:          rest.images           ?? [],
        is_featured:     rest.is_featured      ?? false,
        is_new_arrival:  rest.is_new_arrival   ?? false,
        is_active:       rest.is_active        ?? true,
        tags:            rest.tags             ?? [],
      }

      if (id) {
        const { data, error } = await supabase
          .from('products')
          .update(payload as never)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(payload as never)
          .select()
          .single()
        if (error) throw error
        return data
      }
    },
    onSuccess: () => {
  qc.invalidateQueries({ queryKey: keys.orders })
  toast.success('Order placed successfully!')
},
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.products })
      toast.success('Product deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

// ── CATEGORIES ────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: keys.categories,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      if (error) throw error
      return (data ?? []) as unknown as Category[]
    },
  })
}

// ── ORDERS ────────────────────────────────────────────────────

export function useOrders() {
  return useQuery({
    queryKey: keys.orders,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customer:customers(*), items:order_items(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as Order[]
    },
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status } as never)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.orders })
      toast.success('Order status updated')
    },
  })
}

// ── CUSTOMERS ─────────────────────────────────────────────────

export function useCustomers() {
  return useQuery({
    queryKey: keys.customers,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as Customer[]
    },
  })
}

// ── BANNERS ───────────────────────────────────────────────────

export function useBanners() {
  return useQuery({
    queryKey: keys.banners,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      if (error) throw error
      return (data ?? []) as unknown as Banner[]
    },
  })
}

// ── DASHBOARD STATS ───────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: keys.dashboard,
    queryFn: async () => {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase.from('orders').select('total, status, created_at'),
        supabase.from('products').select('id, stock_qty, low_stock_alert, is_active'),
        supabase.from('customers').select('id, created_at'),
      ])

      const allOrders = (ordersRes.data ?? []) as unknown as {
        total: number
        status: string
        created_at: string
      }[]

      const allProducts = (productsRes.data ?? []) as unknown as {
        id: string
        stock_qty: number
        low_stock_alert: number
        is_active: boolean
      }[]

      const allCustomers = (customersRes.data ?? []) as unknown as {
        id: string
        created_at: string
      }[]

      const today = new Date().toISOString().split('T')[0]

      return {
        totalRevenue:   allOrders.reduce((s, o) => s + Number(o.total), 0),
        totalOrders:    allOrders.length,
        todayOrders:    allOrders.filter(o => o.created_at.startsWith(today)).length,
        pendingOrders:  allOrders.filter(o => o.status === 'pending').length,
        totalProducts:  allProducts.filter(p => p.is_active).length,
        lowStock:       allProducts.filter(p => p.stock_qty <= p.low_stock_alert).length,
        totalCustomers: allCustomers.length,
        revenueChart: Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          const day = d.toISOString().split('T')[0]
          return {
            date: d.toLocaleDateString('en', { weekday: 'short' }),
            revenue: allOrders
              .filter(o => o.created_at.startsWith(day))
              .reduce((s, o) => s + Number(o.total), 0),
          }
        }),
      }
    },
  })
}

// ── PLACE ORDER (public RPC) ──────────────────────────────────

export function usePlaceOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      customer_name: string
      customer_phone: string
      customer_email?: string
      delivery_address?: string
      delivery_city?: string
      delivery_district?: string
      notes?: string
      items: Array<{
        product_id: string
        product_name: string
        product_sku?: string
        size?: string
        color?: string
        quantity: number
        unit_price: number
        image_url?: string
      }>
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      const { data, error } = await (supabase.rpc as Function)('place_order', {
        p_customer_name:     payload.customer_name,
        p_customer_phone:    payload.customer_phone,
        p_customer_email:    payload.customer_email    ?? null,
        p_delivery_address:  payload.delivery_address  ?? null,
        p_delivery_city:     payload.delivery_city     ?? null,
        p_delivery_district: payload.delivery_district ?? null,
        p_notes:             payload.notes             ?? null,
        p_items:             payload.items,
      })
      if (error) throw error
      return data as string
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.orders })
      toast.success('Order placed successfully!')
    },
    onError: (e: Error) => toast.error('Failed to place order: ' + e.message),
  })
}