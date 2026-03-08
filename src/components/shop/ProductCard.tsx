import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Eye } from 'lucide-react'
import { useCartStore } from '../../store'
import type { Product } from '../../types/database'

interface Props {
  product: Product
}

const PALETTES = [
  'from-[#8B1A4A] to-[#4A0E2A]',
  'from-[#D4A96A] to-[#8B4513]',
  'from-[#1A4A3A] to-[#0D2820]',
  'from-[#4A3A8B] to-[#1A0E4A]',
  'from-[#C0392B] to-[#6B1A1A]',
  'from-[#2C3E50] to-[#1A2530]',
  'from-[#8B5A2B] to-[#5A3010]',
]

export default function ProductCard({ product }: Props) {
  const [hovered, setHovered] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const addItem = useCartStore(s => s.addItem)
  const toggleCart = useCartStore(s => s.toggleCart)

  const hasImages = product.images?.length > 0
  const hasDiscount = product.compare_price && product.compare_price > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0
  const palette = PALETTES[product.name.charCodeAt(0) % PALETTES.length]

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, product.sizes?.[0] || null, product.colors?.[0] || null)
    toggleCart()
  }

  return (
    <Link
      to={`/shop/${product.slug}`}
      className="group block"
      onMouseEnter={() => {
        setHovered(true)
        if (product.images?.length > 1) setImgIdx(1)
      }}
      onMouseLeave={() => {
        setHovered(false)
        setImgIdx(0)
      }}
    >
      <div className="relative overflow-hidden aspect-[3/4] bg-stone-100 mb-3">
        {hasImages ? (
          product.images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                i === imgIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            />
          ))
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${palette} flex items-center justify-center`}
          >
            <span className="font-cormorant text-white/20 text-4xl italic">
              {product.category?.name || 'Fashion'}
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new_arrival && (
            <span className="bg-deep text-white text-[10px] uppercase tracking-widest px-2 py-0.5">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="bg-rose text-white text-[10px] uppercase tracking-widest px-2 py-0.5">
              -{discountPct}%
            </span>
          )}
          {product.is_featured && (
            <span className="bg-gold text-deep text-[10px] uppercase tracking-widest px-2 py-0.5">
              Featured
            </span>
          )}
        </div>

        {product.stock_qty === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-deep text-xs uppercase tracking-widest px-4 py-2">
              Sold Out
            </span>
          </div>
        )}

        {product.stock_qty > 0 && (
          <div
            className={`absolute bottom-0 left-0 right-0 flex gap-px transition-all duration-300 ${
              hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-deep text-white text-xs uppercase tracking-widest py-3 hover:bg-warm transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag size={13} /> Add to Cart
            </button>

            {/* Fixed: use button instead of nested Link */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.location.href = `/shop/${product.slug}`
              }}
              className="w-12 bg-deep/80 text-white flex items-center justify-center hover:bg-warm transition-colors"
            >
              <Eye size={14} />
            </button>
          </div>
        )}
      </div>

      <p className="text-[10px] text-muted uppercase tracking-widest mb-1">
        {product.category?.name}
      </p>
      <h3 className="font-cormorant text-deep text-lg leading-tight group-hover:text-gold transition-colors mb-1.5">
        {product.name}
      </h3>
      <div className="flex items-baseline gap-2">
        <span className="text-deep font-medium">Rs. {product.price.toLocaleString()}</span>
        {hasDiscount && (
          <span className="text-muted text-sm line-through">
            Rs. {product.compare_price!.toLocaleString()}
          </span>
        )}
      </div>
      {product.sizes?.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {product.sizes.slice(0, 5).map((s) => (
            <span
              key={s}
              className="text-[10px] border border-stone-200 text-muted px-1.5 py-0.5 uppercase"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}