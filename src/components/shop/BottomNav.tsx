import { Link, useLocation } from 'react-router-dom'
import { Home, Grid3x3, ShoppingBag, MessageCircle, Images } from 'lucide-react'
import { useCartStore } from '../../store'

export default function BottomNav() {
  const location   = useLocation()
  const totalItems = useCartStore(s => s.totalItems)
  const toggleCart = useCartStore(s => s.toggleCart)
  const path       = location.pathname

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-stone-100"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-16">

        {/* Home */}
        <Link to="/"
          className={`flex flex-col items-center gap-0.5 px-3 py-2 transition-colors ${path === '/' ? 'text-gold' : 'text-muted'}`}>
          <Home size={20} strokeWidth={path === '/' ? 2 : 1.5} />
          <span className="text-[9px] uppercase tracking-wider">Home</span>
        </Link>

        {/* Shop */}
        <Link to="/shop"
          className={`flex flex-col items-center gap-0.5 px-3 py-2 transition-colors ${path.startsWith('/shop') ? 'text-gold' : 'text-muted'}`}>
          <Grid3x3 size={20} strokeWidth={path.startsWith('/shop') ? 2 : 1.5} />
          <span className="text-[9px] uppercase tracking-wider">Shop</span>
        </Link>

        {/* Cart */}
        <button onClick={toggleCart}
          className="flex flex-col items-center gap-0.5 px-3 py-2 text-muted">
          <div className="relative">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalItems() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                {totalItems() > 9 ? '9+' : totalItems()}
              </span>
            )}
          </div>
          <span className="text-[9px] uppercase tracking-wider">Cart</span>
        </button>

        {/* Gallery */}
        <Link to="/gallery"
          className={`flex flex-col items-center gap-0.5 px-3 py-2 transition-colors ${path === '/gallery' ? 'text-gold' : 'text-muted'}`}>
          <Images size={20} strokeWidth={path === '/gallery' ? 2 : 1.5} />
          <span className="text-[9px] uppercase tracking-wider">Gallery</span>
        </Link>

        {/* WhatsApp */}
        <a href="https://wa.me/94766604555" target="_blank" rel="noreferrer"
          className="flex flex-col items-center gap-0.5 px-3 py-2">
          <MessageCircle size={20} strokeWidth={1.5} className="text-[#25D366]" />
          <span className="text-[9px] uppercase tracking-wider text-[#25D366]">Order</span>
        </a>

      </div>
    </div>
  )
}