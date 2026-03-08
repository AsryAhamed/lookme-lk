import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../../store'

const PALETTES = [
  'from-[#8B1A4A] to-[#4A0E2A]',
  'from-[#D4A96A] to-[#8B4513]',
  'from-[#1A4A3A] to-[#0D2820]',
]

export default function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQty, totalPrice, clearCart } = useCartStore()

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-50" onClick={toggleCart} />}

      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-deep" />
            <h2 className="font-cormorant text-xl font-semibold text-deep">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-rose text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {items.reduce((a, i) => a + i.quantity, 0)}
              </span>
            )}
          </div>
          <button onClick={toggleCart} className="text-muted hover:text-deep transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag size={40} className="text-stone-200" />
              <p className="font-cormorant text-xl text-deep">Your cart is empty</p>
              <p className="text-sm text-muted">Discover our beautiful collections</p>
              <button onClick={toggleCart}
                className="bg-deep text-white text-xs uppercase tracking-widest px-6 py-3 hover:bg-warm transition-colors mt-2">
                <Link to="/shop">Shop Now</Link>
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => {
                const pal = PALETTES[item.product.name.charCodeAt(0) % PALETTES.length]
                return (
                  <div key={`${item.product.id}-${item.size}`} className="flex gap-4">
                    <Link to={`/shop/${item.product.slug}`} onClick={toggleCart} className="w-20 h-24 shrink-0 overflow-hidden">
                      {item.product.images?.[0]
                        ? <img src={item.product.images[0]} className="w-full h-full object-cover" />
                        : <div className={`w-full h-full bg-gradient-to-br ${pal}`} />
                      }
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/shop/${item.product.slug}`} onClick={toggleCart}
                        className="font-cormorant text-deep text-base leading-tight hover:text-gold transition-colors line-clamp-2">
                        {item.product.name}
                      </Link>
                      {item.size && <p className="text-xs text-muted uppercase tracking-wider mt-0.5">Size: {item.size}</p>}
                      {item.color && <p className="text-xs text-muted mt-0.5">{item.color}</p>}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-stone-200">
                          <button onClick={() => updateQty(item.product.id, item.size, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-muted hover:text-deep">
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm text-deep">{item.quantity}</span>
                          <button onClick={() => updateQty(item.product.id, item.size, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-muted hover:text-deep">
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-deep font-medium text-sm">
                            Rs. {(item.product.price * item.quantity).toLocaleString()}
                          </span>
                          <button onClick={() => removeItem(item.product.id, item.size)}
                            className="text-muted hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-stone-100 px-6 py-5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="text-deep font-medium">Rs. {totalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Delivery</span>
                <span className="text-deep">Rs. 350</span>
              </div>
              <div className="flex justify-between font-cormorant text-lg font-semibold text-deep border-t border-stone-100 pt-2">
                <span>Total</span>
                <span>Rs. {(totalPrice() + 350).toLocaleString()}</span>
              </div>
            </div>

            <Link to="/checkout" onClick={toggleCart}
              className="w-full bg-deep text-white text-xs uppercase tracking-widest py-4 flex items-center justify-center hover:bg-warm transition-colors">
              Proceed to Checkout
            </Link>

            <a href={`https://wa.me/94766604555?text=${encodeURIComponent(
              'Hi! I would like to order:\n\n' +
              items.map(i => `• ${i.product.name} (Size: ${i.size || 'N/A'}, Qty: ${i.quantity}) — Rs. ${(i.product.price * i.quantity).toLocaleString()}`).join('\n') +
              `\n\nTotal: Rs. ${(totalPrice() + 350).toLocaleString()} (inc. delivery)`
            )}`}
              target="_blank" rel="noreferrer"
              className="w-full border border-[#25D366] text-[#25D366] text-xs uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-[#25D366] hover:text-white transition-colors">
              Order via WhatsApp
            </a>

            <button onClick={clearCart} className="w-full text-xs text-muted hover:text-red-500 transition-colors py-1 uppercase tracking-wider">
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}