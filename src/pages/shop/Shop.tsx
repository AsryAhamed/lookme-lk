import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { useProducts, useCategories } from '../../hooks/useApi'
import ProductCard from '../../components/shop/ProductCard'
import type { Product } from '../../types/database'

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'featured',   label: 'Featured' },
]

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [sort, setSort] = useState('newest')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')

  const activeCategory = searchParams.get('cat') || 'all'
  const activeFilter   = searchParams.get('filter') || ''

  const { data: products, isLoading } = useProducts()
  const { data: categories } = useCategories()

  const filtered = useMemo(() => {
    if (!products) return []
    let list: Product[] = [...products]
    if (activeCategory !== 'all') list = list.filter(p => p.category?.slug === activeCategory)
    if (activeFilter === 'new')      list = list.filter(p => p.is_new_arrival)
    if (activeFilter === 'featured') list = list.filter(p => p.is_featured)
    if (priceMin) list = list.filter(p => p.price >= parseInt(priceMin))
    if (priceMax) list = list.filter(p => p.price <= parseInt(priceMax))
    switch (sort) {
      case 'price-asc':  return list.sort((a, b) => a.price - b.price)
      case 'price-desc': return list.sort((a, b) => b.price - a.price)
      case 'featured':   return list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
      default:           return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  }, [products, activeCategory, activeFilter, sort, priceMin, priceMax])

  function setCategory(slug: string) {
    const p = new URLSearchParams(searchParams)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    slug === 'all' ? p.delete('cat') : p.set('cat', slug)
    setSearchParams(p)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="font-cormorant text-4xl md:text-5xl font-light text-deep mb-2">
          {activeCategory !== 'all'
            ? categories?.find(c => c.slug === activeCategory)?.name || 'Collection'
            : 'All Products'}
        </h1>
        <p className="text-muted text-sm">{filtered.length} products</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-stone-100">
        <button onClick={() => setCategory('all')}
          className={`text-xs uppercase tracking-widest px-4 py-2 border transition-colors ${activeCategory === 'all' ? 'bg-deep text-white border-deep' : 'border-stone-200 text-muted hover:border-deep'}`}>
          All
        </button>
        {categories?.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.slug)}
            className={`text-xs uppercase tracking-widest px-4 py-2 border transition-colors ${activeCategory === cat.slug ? 'bg-deep text-white border-deep' : 'border-stone-200 text-muted hover:border-deep'}`}>
            {cat.name}
          </button>
        ))}
        <div className="flex-1" />
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="text-xs border border-stone-200 px-3 py-2 focus:outline-none focus:border-gold bg-white text-muted">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 text-xs uppercase tracking-wider border px-3 py-2 transition-colors ${showFilters ? 'bg-deep text-white border-deep' : 'border-stone-200 text-muted hover:border-deep'}`}>
          <SlidersHorizontal size={13} /> Filters
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white border border-stone-100 p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted block mb-2">Min Price (Rs.)</label>
            <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)}
              placeholder="0" className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted block mb-2">Max Price (Rs.)</label>
            <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)}
              placeholder="50000" className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted block mb-2">Type</label>
            <select value={activeFilter} onChange={e => {
              const p = new URLSearchParams(searchParams)
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              e.target.value ? p.set('filter', e.target.value) : p.delete('filter')
              setSearchParams(p)
            }} className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white">
              <option value="">All</option>
              <option value="new">New Arrivals</option>
              <option value="featured">Featured</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setPriceMin(''); setPriceMax(''); setSearchParams({}) }}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-red-500 transition-colors uppercase tracking-wider">
              <X size={12} /> Clear All
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-stone-100 mb-3" />
              <div className="h-3 bg-stone-100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-stone-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-cormorant text-3xl text-deep mb-3">No products found</p>
          <p className="text-muted text-sm mb-6">Try adjusting your filters</p>
          <button onClick={() => { setSearchParams({}); setPriceMin(''); setPriceMax('') }}
            className="bg-deep text-white text-xs uppercase tracking-widest px-6 py-3 hover:bg-warm transition-colors">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}