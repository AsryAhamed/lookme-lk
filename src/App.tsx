import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store'

import AdminLayout   from './components/layout/AdminLayout'
import ShopLayout    from './components/layout/ShopLayout'

import AdminLogin    from './pages/admin/Login'
import Dashboard     from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders   from './pages/admin/Orders'
import AdminCustomers from './pages/admin/Customers'
import AdminCategories from './pages/admin/Categories'
import AdminGallery  from './pages/admin/Gallery'
import AdminBanners  from './pages/admin/Banners'

import Home        from './pages/shop/Home'
import Shop        from './pages/shop/Shop'
import ProductPage from './pages/shop/Product'
import Checkout    from './pages/shop/Checkout'
import Gallery     from './pages/shop/Gallery'

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 2 } },
})

// ── Scroll to top on every route change ──
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAdmin = useAuthStore(s => s.isAdmin)
  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />
}

export default function App() {
  const setAdmin = useAuthStore(s => s.setAdmin)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data } = await supabase
          .from('admin_users')
          .select('full_name')
          .eq('is_active', true)
          .single()
        if (data) setAdmin(true, data.full_name as string)
      }
      setAuthChecked(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setAdmin(false)
    })
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!authChecked) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route index             element={<Dashboard />} />
            <Route path="products"   element={<AdminProducts />} />
            <Route path="orders"     element={<AdminOrders />} />
            <Route path="customers"  element={<AdminCustomers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="gallery"    element={<AdminGallery />} />
            <Route path="banners"    element={<AdminBanners />} />
          </Route>

          <Route path="/" element={<ShopLayout />}>
            <Route index              element={<Home />} />
            <Route path="shop"        element={<Shop />} />
            <Route path="shop/:slug"  element={<ProductPage />} />
            <Route path="checkout"    element={<Checkout />} />
            <Route path="gallery"     element={<Gallery />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}