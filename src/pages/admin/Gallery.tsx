import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import {
  Trash2, Pencil, Image, Upload,
  ChevronLeft, ChevronRight
} from 'lucide-react'

interface GalleryItem {
  id: string
  title: string | null
  description: string | null
  image_url: string
  category: string
  sort_order: number
  is_active: boolean
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

function useAdminGallery() {
  return useQuery({
    queryKey: ['gallery', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery').select('*').order('sort_order')
      if (error) throw error
      return (data ?? []) as unknown as GalleryItem[]
    },
  })
}

function useDeleteGallery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gallery').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery'] })
      toast.success('Image deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

function useUpdateGallery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<GalleryItem> & { id: string }) => {
      const { error } = await supabase.from('gallery').update(rest as never).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery'] })
      toast.success('Updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

const inp = 'w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-sky-400 bg-white rounded-sm'

export default function AdminGallery() {
  const { data: items, isLoading } = useAdminGallery()
  const del    = useDeleteGallery()
  const update = useUpdateGallery()
  const qc     = useQueryClient()

  const [filter,          setFilter]          = useState('all')
  const [page,            setPage]            = useState(1)
  const [uploading,       setUploading]       = useState(false)
  const [editing,         setEditing]         = useState<GalleryItem | null>(null)
  const [isOpen,          setIsOpen]          = useState(false)
  const [uploadQueue,     setUploadQueue]     = useState<File[]>([])
  const [uploadCat,       setUploadCat]       = useState('all')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  // Filtered + paginated
  const allFiltered = items?.filter(i => filter === 'all' || i.category === filter) || []
  const totalPages  = Math.ceil(allFiltered.length / PAGE_SIZE)
  const paginated   = allFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function changeFilter(f: string) {
    setFilter(f)
    setPage(1)
  }

  function changePage(p: number) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleMultiUpload() {
    if (!uploadQueue.length) return
    setUploading(true)
    let success = 0

    for (const file of uploadQueue) {
      const ext  = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(path, file, { upsert: false })

      if (!uploadError) {
        const { data } = supabase.storage.from('gallery-images').getPublicUrl(path)
        const { error: dbError } = await supabase.from('gallery').insert({
          image_url:  data.publicUrl,
          category:   uploadCat,
          sort_order: 0,
          is_active:  true,
        } as never)
        if (!dbError) success++
      }
    }

    toast.success(`${success} of ${uploadQueue.length} images uploaded`)
    qc.invalidateQueries({ queryKey: ['gallery'] })
    setUploadQueue([])
    setUploadModalOpen(false)
    setUploading(false)
  }

  function openEdit(item: GalleryItem) {
    setEditing({ ...item })
    setIsOpen(true)
  }

  async function saveEdit() {
    if (!editing) return
    await update.mutateAsync({
      id:          editing.id,
      title:       editing.title,
      description: editing.description,
      category:    editing.category,
      sort_order:  editing.sort_order,
      is_active:   editing.is_active,
    })
    setIsOpen(false)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-cormorant font-semibold text-deep">Gallery</h1>
          <p className="text-sm text-muted mt-1">
            {items?.length || 0} images total
            {filter !== 'all' && ` · ${allFiltered.length} in this category`}
          </p>
        </div>
        <button onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2.5 text-sm uppercase tracking-wider hover:bg-sky-500 transition-colors rounded-sm">
          <Upload size={16} /> Upload Images
        </button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => changeFilter(cat.value)}
            className={`text-xs uppercase tracking-wider px-3 py-1.5 border transition-colors rounded-sm ${
              filter === cat.value
                ? 'bg-deep text-white border-deep'
                : 'border-stone-200 text-muted hover:border-deep'
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
              className="animate-pulse bg-stone-100 rounded-sm mb-3 break-inside-avoid"
              style={{ aspectRatio: i % 3 === 0 ? '3/4' : i % 3 === 1 ? '1/1' : '4/5' }} />
          ))}
        </div>
      ) : paginated.length > 0 ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
          {paginated.map(item => (
            <div key={item.id}
              className="break-inside-avoid mb-3 group relative overflow-hidden rounded-sm bg-stone-100">
              <img
                src={item.image_url}
                alt={item.title || ''}
                className="w-full object-cover"
                loading="lazy"
              />

              {/* Status badge */}
              <span className={`absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-medium ${item.is_active ? 'bg-emerald-500 text-white' : 'bg-stone-500 text-white'}`}>
                {item.is_active ? 'Live' : 'Hidden'}
              </span>

              {/* Category badge */}
              <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider bg-black/40 text-white backdrop-blur-sm">
                {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
              </span>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => openEdit(item)}
                  className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-deep hover:bg-sky-500 hover:text-white transition-colors shadow-lg">
                  <Pencil size={14} />
                </button>
                <button onClick={() => del.mutate(item.id)}
                  className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-deep hover:bg-red-500 hover:text-white transition-colors shadow-lg">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Title */}
              {item.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-2">
                  <p className="text-white text-xs truncate font-medium">{item.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <Image size={48} className="mx-auto mb-3 text-stone-200" />
          <p className="font-cormorant text-2xl text-deep mb-2">No images yet</p>
          <p className="text-muted text-sm mb-6">
            {filter !== 'all' ? 'No images in this category.' : 'Upload your first gallery images to get started.'}
          </p>
          {filter === 'all' && (
            <button onClick={() => setUploadModalOpen(true)}
              className="bg-sky-600 text-white text-xs uppercase tracking-widest px-6 py-3 hover:bg-sky-500 transition-colors rounded-sm">
              Upload Images
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <>
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center border border-stone-200 text-muted hover:border-deep hover:text-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-sm">
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => changePage(p)}
                className={`w-9 h-9 text-sm border transition-colors rounded-sm ${
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
              className="w-9 h-9 flex items-center justify-center border border-stone-200 text-muted hover:border-deep hover:text-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-sm">
              <ChevronRight size={16} />
            </button>
          </div>
          <p className="text-center text-xs text-muted mt-2">
            Page {page} of {totalPages} · {allFiltered.length} images
          </p>
        </>
      )}

      {/* ── Upload Modal ── */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg shadow-2xl rounded-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-cormorant text-lg font-semibold text-deep">Upload Gallery Images</h2>
              <button
                onClick={() => { setUploadModalOpen(false); setUploadQueue([]) }}
                className="text-muted hover:text-deep text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-5">

              {/* Drop zone */}
              <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-sm cursor-pointer transition-colors py-10 ${uploadQueue.length ? 'border-sky-400 bg-sky-50' : 'border-stone-200 hover:border-sky-400'}`}>
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={e => setUploadQueue(Array.from(e.target.files || []))} />
                <Upload size={32} className={uploadQueue.length ? 'text-sky-400' : 'text-stone-300'} />
                {uploadQueue.length > 0 ? (
                  <div className="text-center">
                    <p className="text-sky-600 font-medium text-sm">
                      {uploadQueue.length} image{uploadQueue.length > 1 ? 's' : ''} selected
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {uploadQueue.map(f => f.name).join(', ').slice(0, 60)}
                      {uploadQueue.map(f => f.name).join(', ').length > 60 ? '...' : ''}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted">Click to select images</p>
                    <p className="text-xs text-stone-300 mt-0.5">JPG, PNG, WEBP — multiple allowed</p>
                  </div>
                )}
              </label>

              {/* Preview thumbnails */}
              {uploadQueue.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {uploadQueue.map((file, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-sm overflow-hidden bg-stone-100">
                      <img
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover" alt="" />
                      <button
                        onClick={() => setUploadQueue(prev => prev.filter((_, j) => j !== i))}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Category</label>
                <select value={uploadCat} onChange={e => setUploadCat(e.target.value)} className={inp}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-stone-100">
                <button
                  onClick={() => { setUploadModalOpen(false); setUploadQueue([]) }}
                  className="px-5 py-2.5 border border-stone-200 text-sm text-muted hover:border-deep hover:text-deep transition-colors rounded-sm">
                  Cancel
                </button>
                <button
                  onClick={handleMultiUpload}
                  disabled={uploading || !uploadQueue.length}
                  className="px-6 py-2.5 bg-sky-600 text-white text-sm uppercase tracking-wider hover:bg-sky-500 transition-colors disabled:opacity-50 rounded-sm flex items-center gap-2">
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Upload {uploadQueue.length > 0 ? `${uploadQueue.length} ` : ''}
                      Image{uploadQueue.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {isOpen && editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md shadow-2xl rounded-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-cormorant text-lg font-semibold text-deep">Edit Image</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-deep text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">

              {/* Preview */}
              <img
                src={editing.image_url}
                className="w-full aspect-[3/4] object-cover rounded-sm"
                alt="" />

              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Title</label>
                <input
                  value={editing.title || ''}
                  onChange={e => setEditing(p => p ? ({ ...p, title: e.target.value }) : p)}
                  className={inp}
                  placeholder="Beautiful Salwar Set" />
              </div>

              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={editing.description || ''}
                  onChange={e => setEditing(p => p ? ({ ...p, description: e.target.value }) : p)}
                  className={inp}
                  rows={2}
                  placeholder="Optional description..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={editing.category}
                    onChange={e => setEditing(p => p ? ({ ...p, category: e.target.value }) : p)}
                    className={inp}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    value={editing.sort_order}
                    onChange={e => setEditing(p => p ? ({ ...p, sort_order: parseInt(e.target.value) }) : p)}
                    className={inp} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-deep cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={e => setEditing(p => p ? ({ ...p, is_active: e.target.checked }) : p)} />
                Visible on website
              </label>

              <div className="flex justify-end gap-3 pt-2 border-t border-stone-100">
                <button onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 border border-stone-200 text-sm text-muted hover:border-deep hover:text-deep transition-colors rounded-sm">
                  Cancel
                </button>
                <button onClick={saveEdit} disabled={update.isPending}
                  className="px-6 py-2.5 bg-sky-600 text-white text-sm uppercase tracking-wider hover:bg-sky-500 transition-colors disabled:opacity-50 rounded-sm">
                  {update.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}