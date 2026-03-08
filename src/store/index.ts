import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product, SizeType } from '../types/database'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, size: SizeType | null, color: string | null) => void
  removeItem: (productId: string, size: SizeType | null) => void
  updateQty: (productId: string, size: SizeType | null, qty: number) => void
  clearCart: () => void
  toggleCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, size, color) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id && i.size === size
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id && i.size === size
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          return { items: [...state.items, { product, quantity: 1, size, color }] }
        })
      },

      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.size === size)
          ),
        }))
      },

      updateQty: (productId, size, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, size)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId && i.size === size
              ? { ...i, quantity: qty }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
    }),
    { name: 'lookme-cart' }
  )
)

interface AuthStore {
  isAdmin: boolean
  adminName: string | null
  setAdmin: (isAdmin: boolean, name?: string) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAdmin: false,
  adminName: null,
  setAdmin: (isAdmin, name) => set({ isAdmin, adminName: name || null }),
}))