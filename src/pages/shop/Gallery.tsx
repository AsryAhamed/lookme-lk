import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryItem {
  id: string
  title: string | null
  description: string | null
  image_url: string
  category: string
  sort_order: number
  created_at: string
}

const PAGE_SIZE = 8

const CATEGORIES = [
  { value: 'all',           label: 'All' },
  { value: 'salwar-kameez', label: 'Salwar Kameez' },
  { value: 'kurtis',        label: 'Kurtis' },
  { value: 'lehengas',      label: 'Lehengas' },
  { value: 'anarkali',      label: 'Anarkali' },
  { value: 'festive',       label: 'Festive' },
  { value: 'bridal',        label: 'Bridal' },
]

function useGallery(category: string) {
  return useQuery({
    queryKey: ['gallery', category],
    queryFn: async () => {
      let query = supabase
        .from('gallery')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      if (category !== 'all') query = query.eq('category', category)
      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as unknown as GalleryItem[]
    },
  })
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [lightbox, setLightbox]             = useState<GalleryItem | null>(null)
  const [page, setPage]                     = useState(1)

  const { data: items, isLoading } = useGallery(activeCategory)

  const totalPages = Math.ceil((items?.length || 0) / PAGE_SIZE)
  const paginated  = items?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) || []

  function changeCategory(cat: string) {
    setActiveCategory(cat)
    setPage(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function changePage(p: number) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">

      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-[0.3em] text-gold block mb-3">Our Collection</span>
        <h1 className="font-cormorant text-4xl md:text-6xl font-light text-deep mb-4">Gallery</h1>
        <p className="text-muted max-w-md mx-auto text-sm leading-relaxed">
          Explore our handpicked collection of ethnic fashion — each piece crafted for the modern South Asian woman.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap justify-center mb-10">
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => changeCategory(cat.value)}
            className={`text-xs uppercase tracking-widest px-4 py-2 border transition-colors ${
              activeCategory === cat.value
                ? 'bg-deep text-white border-deep'
                : 'border-stone-200 text-muted hover:border-deep hover:text-deep'
            }`}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      {isLoading ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
          {Array(8).fill(0).map((_, i) => (
            <div key={i}
              className={`animate-pulse bg-stone-100 rounded-sm mb-3 break-inside-avoid ${
                i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]'
              }`} />
          ))}
        </div>
      ) : paginated.length > 0 ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
          {paginated.map(item => (
            <div key={item.id}
              className="break-inside-avoid mb-3 group relative overflow-hidden cursor-pointer rounded-sm"
              onClick={() => setLightbox(item)}>
              <img
                src={item.image_url}
                alt={item.title || 'Gallery image'}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end">
                {(item.title || item.description) && (
                  <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 w-full">
                    {item.title && (
                      <p className="font-cormorant text-white text-base font-medium leading-tight">{item.title}</p>
                    )}
                    {item.description && (
                      <p className="text-white/70 text-xs mt-0.5 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="font-cormorant text-3xl text-deep mb-3">No images yet</p>
          <p className="text-muted text-sm">Check back soon for our latest collection.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => changePage(page - 1)}
            disabled={page === 1}
            className="w-9 h-9 flex items-center justify-center border border-stone-200 text-muted hover:border-deep hover:text-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => changePage(p)}
              className={`w-9 h-9 text-sm border transition-colors ${
                p === page
                  ? 'bg-deep text-white border-deep'
                  : 'border-stone-200 text-muted hover:border-deep hover:text-deep'
              }`}>
              {p}
            </button>
          ))}

          <button
            onClick={() => changePage(page + 1)}
            disabled={page === totalPages}
            className="w-9 h-9 flex items-center justify-center border border-stone-200 text-muted hover:border-deep hover:text-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Page info */}
      {totalPages > 1 && (
        <p className="text-center text-xs text-muted mt-3">
          Page {page} of {totalPages} · {items?.length} images
        </p>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors rounded-full"
            onClick={() => setLightbox(null)}>
            <X size={20} />
          </button>
          <div
            className="max-w-2xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.image_url}
              alt={lightbox.title || ''}
              className="max-h-[80vh] w-auto object-contain rounded-sm shadow-2xl"
            />
            {(lightbox.title || lightbox.description) && (
              <div className="mt-4 text-center">
                {lightbox.title && (
                  <p className="font-cormorant text-white text-2xl font-medium">{lightbox.title}</p>
                )}
                {lightbox.description && (
                  <p className="text-white/60 text-sm mt-1">{lightbox.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}