import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useCartStore } from '../../store'
import CartDrawer from '../shop/CartDrawer'
import BottomNav from '../shop/BottomNav'

export default function ShopLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const totalItems = useCartStore(s => s.totalItems)
  const toggleCart = useCartStore(s => s.toggleCart)

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line react-hooks/immutability
    window.onscroll = () => setScrolled(window.scrollY > 50)
  }

  return (
    <div className="min-h-screen bg-cream font-jost">

      {/* Announcement bar */}
      <div className="bg-deep text-center py-2 px-4">
        <p className="text-xs text-white/60 tracking-widest uppercase">
          Free delivery on orders over Rs. 5,000 · WhatsApp: 0766 604 555
        </p>
      </div>

      {/* Navbar */}
      <nav className={`sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b transition-shadow ${scrolled ? 'shadow-sm border-gold/20' : 'border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="font-cormorant text-2xl font-semibold text-deep tracking-wide">
            look<span className="text-gold">me</span>.lk
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex gap-8">
            {[
              { to: '/',                       label: 'Home' },
              { to: '/shop',                   label: 'Shop All' },
              { to: '/shop?cat=salwar-kameez', label: 'Salwar' },
              { to: '/shop?cat=kurtis',        label: 'Kurtis' },
              { to: '/shop?cat=lehengas',      label: 'Lehengas' },
              { to: '/gallery',                label: 'Gallery' },
            ].map(({ to, label }) => (
              <li key={label}>
                <NavLink to={to}
                  className={({ isActive }) =>
                    `text-xs uppercase tracking-widest transition-colors ${isActive ? 'text-gold' : 'text-text hover:text-gold'}`
                  }>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-4">

            {/* WhatsApp button — desktop only */}
            <a href="https://wa.me/94766604555" target="_blank" rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 bg-[#25D366] text-white text-xs px-3 py-1.5 uppercase tracking-wider hover:opacity-90 transition-opacity">
              WhatsApp Order
            </a>

            {/* Cart */}
            <button onClick={toggleCart} className="relative text-deep hover:text-gold transition-colors">
              <ShoppingBag size={20} />
              {totalItems() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose text-white text-[10px] rounded-full flex items-center justify-center">
                  {totalItems()}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button className="md:hidden text-deep" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-gold/10 bg-cream px-6 py-4 space-y-3">
            {[
              { to: '/',                       label: 'Home' },
              { to: '/shop',                   label: 'Shop All' },
              { to: '/shop?cat=salwar-kameez', label: 'Salwar Kameez' },
              { to: '/shop?cat=kurtis',        label: 'Kurtis' },
              { to: '/shop?cat=lehengas',      label: 'Lehengas' },
              { to: '/gallery',                label: 'Gallery' },
            ].map(({ to, label }) => (
              <NavLink key={label} to={to} onClick={() => setMenuOpen(false)}
                className="block text-sm text-text hover:text-gold py-1 uppercase tracking-wider">
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Page content */}
      <Outlet />

      {/* Bottom padding on mobile so content clears the bottom nav */}
      <div className="h-16 md:hidden" />

      {/* Bottom nav — mobile only */}
      <BottomNav />

      {/* Floating WhatsApp button — desktop only */}
      <a href="https://wa.me/94766604555" target="_blank" rel="noreferrer"
        className="hidden md:flex fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
        style={{ boxShadow: '0 4px 20px rgba(37,211,102,0.5)' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* Cart drawer */}
      <CartDrawer />

      {/* Footer */}
      <footer className="bg-deep text-white/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">

          <div className="md:col-span-2">
            <span className="font-cormorant text-white text-2xl font-semibold block mb-3">
              look<span className="text-gold">me</span>.lk
            </span>
            <p className="text-sm leading-relaxed mb-4">
              Sri Lanka's No.1 destination for authentic ethnic fashion. Salwar Kameez, Kurtis &amp; Lehengas delivered island-wide.
            </p>
            <a href="https://wa.me/94766604555" target="_blank" rel="noreferrer"
              className="inline-flex bg-[#25D366] text-white text-xs px-4 py-2.5 uppercase tracking-wider hover:opacity-90 transition-opacity">
              Chat on WhatsApp
            </a>
          </div>

          <div>
            <h4 className="text-white text-xs uppercase tracking-widest mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/shop',                   label: 'Shop All' },
                { to: '/shop?cat=salwar-kameez', label: 'Salwar Kameez' },
                { to: '/shop?cat=kurtis',        label: 'Kurtis' },
                { to: '/shop?cat=lehengas',      label: 'Lehengas' },
                { to: '/shop?cat=anarkali',      label: 'Anarkali Suits' },
                { to: '/shop?filter=new',        label: 'New Arrivals' },
                { to: '/gallery',                label: 'Gallery' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="hover:text-gold transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs uppercase tracking-widest mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>📱 0766 604 555</li>
              <li>📍 Colombo, Sri Lanka</li>
              <li>
                <a href="https://instagram.com/lookme.lk" target="_blank" rel="noreferrer"
                  className="hover:text-gold transition-colors">
                  📸 @lookme.lk
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer bottom — admin link */}
        <div className="border-t border-white/10 py-4 px-6 flex items-center justify-center gap-6 text-xs text-white/20">
          <span>© 2025 Lookme.lk — All rights reserved</span>
          <Link to="/admin" className="hover:text-white/40 transition-colors uppercase tracking-wider">
            Admin
          </Link>
        </div>
      </footer>

    </div>
  )
}