import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, MessageCircle } from 'lucide-react'
import { useProduct, useProducts } from '../../hooks/useApi'
import { useCartStore } from '../../store'
import ProductCard from '../../components/shop/ProductCard'
import type { SizeType } from '../../types/database'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading } = useProduct(slug!)
  const { data: allProducts } = useProducts()
  const addItem = useCartStore(s => s.addItem)
  const toggleCart = useCartStore(s => s.toggleCart)

  const [selectedSize, setSelectedSize] = useState<SizeType | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [sizeError, setSizeError] = useState(false)

  const related = allProducts?.filter(p =>
    p.id !== product?.id && p.category_id === product?.category_id
  ).slice(0, 4) || []

  function handleAddToCart() {
    if (product?.sizes?.length && !selectedSize) { setSizeError(true); return }
    if (!product) return
    for (let i = 0; i < qty; i++) addItem(product, selectedSize, selectedColor)
    toggleCart()
    setSizeError(false)
  }

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-16 animate-pulse">
      <div className="aspect-[3/4] bg-stone-100" />
      <div className="space-y-4">
        <div className="h-4 bg-stone-100 rounded w-1/3" />
        <div className="h-8 bg-stone-100 rounded w-3/4" />
        <div className="h-6 bg-stone-100 rounded w-1/4" />
      </div>
    </div>
  )

  if (!product) return (
    <div className="max-w-7xl mx-auto px-6 py-24 text-center">
      <p className="font-cormorant text-3xl text-deep mb-4">Product not found</p>
      <Link to="/shop" className="text-xs text-gold uppercase tracking-widest hover:underline">← Back to Shop</Link>
    </div>
  )

  const hasImages    = product.images?.length > 0
  const hasDiscount  = product.compare_price && product.compare_price > product.price
  const discountPct  = hasDiscount ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100) : 0
  const inStock      = product.stock_qty > 0

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted uppercase tracking-wider mb-10">
        <Link to="/" className="hover:text-deep">Home</Link><span>/</span>
        <Link to="/shop" className="hover:text-deep">Shop</Link>
        {product.category && <><span>/</span>
          <Link to={`/shop?cat=${product.category.slug}`} className="hover:text-deep">{product.category.name}</Link>
        </>}
        <span>/</span>
        <span className="text-deep">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-16 mb-24">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-[3/4] overflow-hidden bg-stone-100">
            {hasImages
              ? <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-[#8B1A4A] to-[#4A0E2A] flex items-center justify-center">
                  <span className="font-cormorant text-white/20 text-5xl italic">{product.category?.name}</span>
                </div>
            }
          </div>
          {hasImages && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-20 h-24 shrink-0 overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-gold' : 'border-transparent'}`}>
                  <img src={src} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex gap-2 mb-4 flex-wrap">
            {product.is_new_arrival && <span className="text-[10px] bg-deep text-white uppercase tracking-widest px-2 py-0.5">New</span>}
            {hasDiscount && <span className="text-[10px] bg-rose text-white uppercase tracking-widest px-2 py-0.5">-{discountPct}% Off</span>}
          </div>

          <p className="text-xs text-muted uppercase tracking-widest mb-2">{product.category?.name}</p>
          <h1 className="font-cormorant text-3xl md:text-4xl font-light text-deep leading-tight mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-cormorant text-3xl text-deep font-medium">Rs. {product.price.toLocaleString()}</span>
            {hasDiscount && <span className="text-muted text-lg line-through">Rs. {product.compare_price!.toLocaleString()}</span>}
          </div>

          {product.description && (
            <p className="text-muted text-sm leading-relaxed mb-8 pb-8 border-b border-stone-100">{product.description}</p>
          )}

          {product.colors?.length > 0 && (
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-muted mb-3">
                Color: <span className="text-deep font-medium">{selectedColor || 'Select'}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 border text-sm transition-colors ${selectedColor === c ? 'border-deep bg-deep text-white' : 'border-stone-200 text-muted hover:border-deep'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mb-8">
              <p className={`text-xs uppercase tracking-widest mb-3 ${sizeError ? 'text-red-500' : 'text-muted'}`}>
                Size: {sizeError
                  ? <span className="font-medium">Please select a size</span>
                  : <span className="text-deep font-medium">{selectedSize || 'Select'}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => { setSelectedSize(s); setSizeError(false) }}
                    className={`px-4 py-2.5 border text-sm uppercase tracking-wider transition-colors ${selectedSize === s ? 'border-deep bg-deep text-white' : 'border-stone-200 text-muted hover:border-deep'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-4">
            <div className="flex items-center border border-stone-200">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-12 flex items-center justify-center text-muted hover:text-deep"><Minus size={14} /></button>
              <span className="w-12 text-center text-sm text-deep font-medium">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock_qty, qty + 1))} className="w-11 h-12 flex items-center justify-center text-muted hover:text-deep"><Plus size={14} /></button>
            </div>
            <button onClick={handleAddToCart} disabled={!inStock}
              className="flex-1 bg-deep text-white text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-warm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <ShoppingBag size={15} />
              {inStock ? 'Add to Cart' : 'Sold Out'}
            </button>
          </div>

          <a href={`https://wa.me/94766604555?text=${encodeURIComponent(`Hi! I'm interested in: *${product.name}*\nSize: ${selectedSize || 'TBD'}\nQty: ${qty}\n\nCould you confirm availability? Thank you!`)}`}
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] text-xs uppercase tracking-widest py-3.5 hover:bg-[#25D366] hover:text-white transition-colors mb-8">
            <MessageCircle size={14} /> Order via WhatsApp
          </a>

          {inStock && product.stock_qty <= 5 && (
            <p className="text-amber-600 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
              Only {product.stock_qty} left in stock
            </p>
          )}

          <div className="space-y-2 text-sm text-muted border-t border-stone-100 pt-6">
            {product.sku && <p>SKU: <span className="text-deep font-mono">{product.sku}</span></p>}
            <p>Category: <Link to={`/shop?cat=${product.category?.slug}`} className="text-deep hover:text-gold transition-colors">{product.category?.name}</Link></p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <div className="mb-10 border-t border-stone-100 pt-16">
            <h2 className="font-cormorant text-3xl text-deep">You May Also Like</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}