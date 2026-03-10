import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useFeaturedProducts, useNewArrivals, useCategories, useBanners } from '../../hooks/useApi'
import ProductCard from '../../components/shop/ProductCard'
import { supabase } from '../../lib/supabase'

const GRADIENTS = [
  'from-[#8B1A4A] to-[#4A0E2A]',
  'from-[#D4A96A] to-[#8B4513]',
  'from-[#1A4A3A] to-[#0D2820]',
  'from-[#4A3A8B] to-[#1A0E4A]',
]

function GalleryPreview() {
  const { data: items } = useQuery({
    queryKey: ['gallery', 'preview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .limit(8)
      if (error) throw error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data as any[]
    },
  })

  if (!items || items.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex items-end justify-between mb-12">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-gold block mb-2">Our Lookbook</span>
          <h2 className="font-cormorant text-4xl md:text-5xl font-light text-deep">Gallery</h2>
        </div>
        <Link
          to="/gallery"
          className="hidden md:flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted hover:text-deep transition-colors">
          View All <ArrowRight size={13} />
        </Link>
      </div>

      <div className="columns-2 md:columns-4 gap-3">
        {items.map(item => (
          <Link
            key={item.id}
            to="/gallery"
            className="break-inside-avoid mb-3 group relative overflow-hidden block rounded-sm">
            <img
              src={item.image_url}
              alt={item.title || ''}
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          </Link>
        ))}
      </div>

      {/* Mobile view all button */}
      <div className="text-center mt-8 md:hidden">
        <Link
          to="/gallery"
          className="inline-flex items-center gap-2 border border-deep text-deep text-xs uppercase tracking-widest px-6 py-3 hover:bg-deep hover:text-white transition-colors">
          View Full Gallery <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  )
}

export default function Home() {
  const { data: featured }    = useFeaturedProducts()
  const { data: newArrivals } = useNewArrivals()
  const { data: categories }  = useCategories()
  const { data: banners }     = useBanners()

  const [bannerIdx, setBannerIdx] = useState(0)

  useEffect(() => {
    if (!banners || banners.length <= 1) return
    const timer = setInterval(() => {
      setBannerIdx(i => (i + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners])

  const hasBanners   = banners && banners.length > 0
  const activeBanner = hasBanners ? banners[bannerIdx] : null

  return (
    <div>

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">

        {/* Background */}
        {hasBanners ? (
          <>
            {banners.map((banner, i) => (
              <div key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${i === bannerIdx ? 'opacity-100' : 'opacity-0'}`}>
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/45" />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#F5E6C8] via-[#EDD5A3] to-[#D4A06A]" />
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg,#1A0A00 0,#1A0A00 1px,transparent 0,transparent 50%)', backgroundSize: '20px 20px' }} />
          </>
        )}

        {/* Hero content */}
        <div className="relative max-w-7xl mx-auto px-6 w-full py-24">
          {hasBanners && activeBanner ? (
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-5 flex items-center gap-2">
                <span className="w-10 h-px bg-white/40 inline-block" />
                Sri Lanka's No.1 Ethnic Fashion
              </p>
              <h1 className="font-cormorant text-[clamp(2.8rem,6vw,5rem)] leading-[1.05] font-light text-white mb-4">
                {activeBanner.title}
              </h1>
              {activeBanner.subtitle && (
                <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-lg">
                  {activeBanner.subtitle}
                </p>
              )}
              <div className="flex flex-wrap gap-4">
                <Link
                  to={activeBanner.link_url || '/shop'}
                  className="bg-white text-deep text-xs uppercase tracking-widest px-8 py-4 hover:bg-cream transition-colors inline-flex items-center gap-2">
                  {activeBanner.button_text || 'Shop Now'} <ArrowRight size={14} />
                </Link>
                <a href="https://wa.me/94766604555" target="_blank" rel="noreferrer"
                  className="border border-white text-white text-xs uppercase tracking-widest px-8 py-4 hover:bg-white hover:text-deep transition-colors">
                  Order on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#8B4513] mb-5 flex items-center gap-2">
                  <span className="w-10 h-px bg-[#8B4513] inline-block" />
                  Sri Lanka's No.1 Ethnic Fashion
                </p>
                <h1 className="font-cormorant text-[clamp(3rem,6vw,5.5rem)] leading-[1.05] font-light text-deep mb-6">
                  Wear Your<br />Heritage with<br />
                  <em className="text-rose italic">Grace</em>
                </h1>
                <p className="text-muted leading-relaxed mb-10 max-w-md">
                  Discover our curated collection of Salwar Kameez, Kurtis &amp; Lehengas — handpicked for the modern South Asian woman in Sri Lanka.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/shop"
                    className="bg-deep text-white text-xs uppercase tracking-widest px-8 py-4 hover:bg-warm transition-colors inline-flex items-center gap-2">
                    Explore Collection <ArrowRight size={14} />
                  </Link>
                  <a href="https://wa.me/94766604555" target="_blank" rel="noreferrer"
                    className="border border-deep text-deep text-xs uppercase tracking-widest px-8 py-4 hover:bg-deep hover:text-white transition-colors">
                    Order on WhatsApp
                  </a>
                </div>
                <div className="flex gap-10 mt-12 pt-8 border-t border-[#C9A96E]/30">
                  {[['74K+','Instagram Followers'],['1900+','Designs'],['10+','Years']].map(([n, l]) => (
                    <div key={l}>
                      <span className="font-cormorant text-3xl font-semibold text-deep block">{n}</span>
                      <span className="text-xs text-muted uppercase tracking-wider">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden md:flex justify-center relative">
                <div className="w-80 h-[500px] bg-gradient-to-br from-[#8B1A4A] to-[#3D0A1A] shadow-2xl flex items-center justify-center relative">
                  <span className="font-cormorant text-white/10 text-9xl font-bold absolute">✦</span>
                  <span className="font-cormorant text-white/30 text-3xl italic relative z-10">lookme.lk</span>
                </div>
                <div className="absolute -bottom-4 -left-8 bg-deep text-white px-6 py-4 shadow-xl">
                  <span className="font-cormorant text-gold text-3xl font-semibold block">#1</span>
                  <span className="text-white/50 text-xs uppercase tracking-wider">In Sri Lanka</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slider controls */}
        {hasBanners && banners.length > 1 && (
          <>
            <button
              onClick={() => setBannerIdx(i => (i - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-sm">
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setBannerIdx(i => (i + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-sm">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setBannerIdx(i)}
                  className={`transition-all duration-300 rounded-full ${i === bannerIdx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`} />
              ))}
            </div>
          </>
        )}

        {/* Marquee */}
        <div className="absolute bottom-0 left-0 right-0 bg-deep/80 backdrop-blur-sm py-2.5 overflow-hidden">
          <div className="flex whitespace-nowrap" style={{ animation: 'marquee 20s linear infinite' }}>
            {Array(3).fill(['Salwar Kameez ✦', 'Kurtis ✦', 'Lehengas ✦', 'Anarkali Suits ✦', 'Festive Wear ✦', 'Bridal ✦']).flat().map((t, i) => (
              <span key={i} className="text-white/40 text-xs uppercase tracking-widest px-6">{t}</span>
            ))}
          </div>
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.33%) } }`}</style>
      </section>

      {/* ── CATEGORIES ── */}
      {categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-[0.3em] text-gold block mb-3">Browse by Category</span>
            <h2 className="font-cormorant text-4xl md:text-5xl font-light text-deep">Shop the Collections</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((cat, i) => (
              <Link key={cat.id} to={`/shop?cat=${cat.slug}`}
                className="group relative overflow-hidden aspect-[3/4] flex items-end">
                {cat.image_url
                  ? <img src={cat.image_url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} group-hover:scale-105 transition-transform duration-500`} />
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
                <div className="relative p-5">
                  <h3 className="font-cormorant text-white text-2xl font-medium">{cat.name}</h3>
                  <p className="text-white/50 text-xs uppercase tracking-wider mt-0.5">Shop now →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── NEW ARRIVALS ── */}
      {newArrivals && newArrivals.length > 0 && (
        <section className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-gold block mb-2">Just In</span>
                <h2 className="font-cormorant text-4xl md:text-5xl font-light text-deep">New Arrivals</h2>
              </div>
              <Link to="/shop?filter=new"
                className="hidden md:flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted hover:text-deep transition-colors">
                View All <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {newArrivals.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED ── */}
      {featured && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-gold block mb-2">Handpicked</span>
              <h2 className="font-cormorant text-4xl md:text-5xl font-light text-deep">Featured Pieces</h2>
            </div>
            <Link to="/shop"
              className="hidden md:flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted hover:text-deep transition-colors">
              View All <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── GALLERY PREVIEW ── */}
      <GalleryPreview />

      {/* ── USP STRIP ── */}
      <section className="bg-deep py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: '🚚', title: 'Island-Wide Delivery', desc: 'All 25 districts across Sri Lanka' },
            { icon: '✂️', title: 'Custom Stitching',     desc: 'Made-to-measure for your perfect fit' },
            { icon: '💬', title: 'WhatsApp Orders',      desc: 'Instant ordering on 0766 604 555' },
            { icon: '✦',  title: 'Premium Quality',      desc: 'Finest South Asian fabrics' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4 items-start">
              <span className="text-2xl shrink-0">{icon}</span>
              <div>
                <h4 className="font-cormorant text-white text-lg mb-1">{title}</h4>
                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-gold block mb-3">Customer Love</span>
          <h2 className="font-cormorant text-4xl md:text-5xl font-light text-deep">What Our Customers Say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Priya S. — Colombo', stars: 5, text: 'Ordered a Salwar set for Deepavali — the quality was beyond my expectations. Delivery was super fast and the stitching was perfect!' },
            { name: 'Nithya R. — Jaffna',  stars: 5, text: 'The WhatsApp ordering is so easy. Got my custom-stitched Kurti within 5 days. Absolutely love the fabric quality!' },
            { name: 'Kamala D. — Kandy',   stars: 5, text: "Best ethnic fashion store in Sri Lanka. The Lehenga for my daughter's wedding was stunning — everyone kept asking where we bought it!" },
          ].map(({ name, text, stars }) => (
            <div key={name} className="bg-white border border-stone-100 p-8 border-b-2 border-b-gold">
              <div className="flex gap-0.5 mb-4">
                {Array(stars).fill(0).map((_, i) => <Star key={i} size={14} className="fill-gold text-gold" />)}
              </div>
              <p className="text-muted text-sm leading-relaxed italic mb-6">"{text}"</p>
              <p className="text-deep text-xs uppercase tracking-widest font-medium">{name}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}