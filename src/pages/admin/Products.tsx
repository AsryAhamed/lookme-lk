import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Search, ImageOff } from 'lucide-react'
import { useAdminProducts, useUpsertProduct, useDeleteProduct, useCategories } from '../../hooks/useApi'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import type { Product, SizeType } from '../../types/database'

const schema = z.object({
  name:           z.string().min(2, 'Name is required'),
  slug:           z.string().min(2, 'Slug is required'),
  description:    z.string().optional(),
  category_id:    z.string().optional(),
  price:          z.preprocess(v => parseFloat(String(v)), z.number().positive('Price must be positive')),
  compare_price:  z.preprocess(v => v === '' || v == null ? undefined : parseFloat(String(v)), z.number().optional()),
  sku:            z.string().optional(),
  stock_qty:      z.preprocess(v => parseInt(String(v), 10), z.number().int().min(0)),
  is_featured:    z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  is_active:      z.boolean().default(true),
})

type F = {
  name: string
  slug: string
  description?: string
  category_id?: string
  price: number
  compare_price?: number
  sku?: string
  stock_qty: number
  is_featured: boolean
  is_new_arrival: boolean
  is_active: boolean
}

const ALL_SIZES: SizeType[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'custom']
const inp = 'w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-gold bg-white'

export default function AdminProducts() {
  const { data: products, isLoading } = useAdminProducts()
  const { data: categories } = useCategories()
  const upsert = useUpsertProduct()
  const del    = useDeleteProduct()

  const [search, setSearch]       = useState('')
  const [editing, setEditing]     = useState<Partial<Product> | null>(null)
  const [isOpen, setIsOpen]       = useState(false)
  const [sizes, setSizes]         = useState<SizeType[]>([])
  const [images, setImages]       = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<F>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
  })
  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  ) || []

  function openNew() {
    setEditing(null)
    setSizes([])
    setImages([])
    reset({
      name: '', slug: '', description: '', category_id: '',
      price: 0, compare_price: undefined, sku: '', stock_qty: 0,
      is_featured: false, is_new_arrival: false, is_active: true,
    })
    setIsOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setSizes(p.sizes || [])
    setImages(p.images || [])
    reset({
      name:           p.name,
      slug:           p.slug,
      description:    p.description || '',
      category_id:    p.category_id || '',
      price:          p.price,
      compare_price:  p.compare_price ?? undefined,
      sku:            p.sku || '',
      stock_qty:      p.stock_qty,
      is_featured:    p.is_featured,
      is_new_arrival: p.is_new_arrival,
      is_active:      p.is_active,
    })
    setIsOpen(true)
  }

  async function uploadImage(file: File) {
    setUploading(true)
    const ext      = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeName = `${Date.now()}.${ext}`
    const path     = `products/${safeName}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: false })

    if (!error) {
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)
      setImages(prev => [...prev, data.publicUrl])
    } else {
      toast.error('Image upload failed: ' + error.message)
    }
    setUploading(false)
  }

  async function onSubmit(data: F) {
    await upsert.mutateAsync({
      ...(editing?.id ? { id: editing.id } : {}),
      name:           data.name,
      slug:           data.slug,
      description:    data.description || null,
      category_id:    data.category_id || null,
      price:          data.price,
      compare_price:  data.compare_price || null,
      sku:            data.sku || null,
      stock_qty:      data.stock_qty,
      is_featured:    data.is_featured,
      is_new_arrival: data.is_new_arrival,
      is_active:      data.is_active,
      sizes,
      images,
    })
    setIsOpen(false)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-cormorant font-semibold text-deep">Products</h1>
          <p className="text-sm text-muted mt-1">{products?.length || 0} products total</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-deep text-white px-4 py-2.5 text-sm uppercase tracking-wider hover:bg-warm transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or SKU..."
          className="w-full pl-9 pr-4 py-2.5 border border-stone-200 text-sm focus:outline-none focus:border-gold" />
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-100 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">Loading...</td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {p.images?.[0]
                      ? <img src={p.images[0]} className="w-10 h-12 object-cover rounded-sm" alt={p.name} />
                      : <div className="w-10 h-12 bg-stone-100 rounded-sm flex items-center justify-center">
                          <ImageOff size={14} className="text-stone-300" />
                        </div>
                    }
                    <div>
                      <div className="font-medium text-deep">{p.name}</div>
                      <div className="text-xs text-muted">{p.sku || 'No SKU'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted">{p.category?.name || '—'}</td>
                <td className="px-5 py-4">
                  <div className="font-medium">Rs. {p.price.toLocaleString()}</div>
                  {p.compare_price && (
                    <div className="text-xs text-muted line-through">Rs. {p.compare_price.toLocaleString()}</div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className={p.stock_qty <= p.low_stock_alert ? 'text-amber-600 font-medium' : 'text-deep'}>
                    {p.stock_qty}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-sm uppercase tracking-wider ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                      {p.is_active ? 'Active' : 'Hidden'}
                    </span>
                    {p.is_featured && (
                      <span className="inline-flex px-2 py-0.5 text-xs rounded-sm bg-amber-100 text-amber-700 uppercase tracking-wider">Featured</span>
                    )}
                    {p.is_new_arrival && (
                      <span className="inline-flex px-2 py-0.5 text-xs rounded-sm bg-blue-100 text-blue-700 uppercase tracking-wider">New</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(p)}
                      className="p-1.5 hover:bg-stone-100 rounded transition-colors text-muted hover:text-deep">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => del.mutate(p.id)}
                      className="p-1.5 hover:bg-red-50 rounded transition-colors text-muted hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="text-lg font-cormorant font-semibold text-deep">
                {editing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-deep text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

              {/* Name + Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Name *</label>
                  <input {...register('name')}
                    onBlur={e => {
                      if (!editing) {
                        setValue('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                      }
                    }}
                    className={inp} placeholder="Embroidered Maroon Set" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Slug *</label>
                  <input {...register('slug')} className={inp} placeholder="embroidered-maroon-set" />
                  {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Description</label>
                <textarea {...register('description')} rows={3} className={inp} placeholder="Product description..." />
              </div>

              {/* Category + SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Category</label>
                  <select {...register('category_id')} className={inp}>
                    <option value="">Select category</option>
                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">SKU</label>
                  <input {...register('sku')} className={inp} placeholder="LM-SAL-001" />
                </div>
              </div>

              {/* Price + Compare Price + Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Price (Rs.) *</label>
                  <input {...register('price')} type="number" className={inp} placeholder="6500" />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Compare Price</label>
                  <input {...register('compare_price')} type="number" className={inp} placeholder="8000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Stock Qty *</label>
                  <input {...register('stock_qty')} type="number" className={inp} placeholder="10" />
                  {errors.stock_qty && <p className="text-xs text-red-500 mt-1">{errors.stock_qty.message}</p>}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map(s => (
                    <button key={s} type="button"
                      onClick={() => setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                      className={`px-3 py-1.5 text-xs border uppercase tracking-wider transition-colors ${sizes.includes(s) ? 'bg-deep text-white border-deep' : 'border-stone-200 text-muted hover:border-deep'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Product Images</label>
                <div className="flex flex-wrap gap-3 mb-2">
                  {images.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} className="w-16 h-20 object-cover rounded-sm" alt="" />
                      <button type="button"
                        onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                        ×
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-20 border-2 border-dashed border-stone-200 flex items-center justify-center cursor-pointer hover:border-gold transition-colors rounded-sm">
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                    {uploading
                      ? <span className="text-xs text-muted">...</span>
                      : <Plus size={20} className="text-stone-300" />
                    }
                  </label>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                {([
                  ['is_active',      'Active'],
                  ['is_featured',    'Featured'],
                  ['is_new_arrival', 'New Arrival'],
                ] as const).map(([field, label]) => (
                  <label key={field} className="flex items-center gap-2 text-sm text-deep cursor-pointer">
                    <input {...register(field)} type="checkbox" />
                    {label}
                  </label>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 border border-stone-200 text-sm text-muted hover:border-deep hover:text-deep transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={upsert.isPending}
                  className="px-6 py-2.5 bg-deep text-white text-sm uppercase tracking-wider hover:bg-warm transition-colors disabled:opacity-50">
                  {upsert.isPending ? 'Saving...' : 'Save Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}