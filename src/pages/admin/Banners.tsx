import { useState } from 'react'
import { Plus, Pencil, Trash2, Image } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import type { Banner } from '../../types/database'

function useBannersAdmin() {
  return useQuery({
    queryKey: ['banners', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners').select('*').order('sort_order')
      if (error) throw error
      return (data ?? []) as unknown as Banner[]
    },
  })
}

function useUpsertBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (banner: Partial<Banner> & { id?: string }) => {
      const { id, ...rest } = banner
      if (id) {
        const { error } = await supabase.from('banners').update(rest as never).eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('banners').insert(rest as never)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners'] })
      toast.success('Banner saved')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

function useDeleteBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('banners').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners'] })
      toast.success('Banner deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

const inp = 'w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-sky-400 bg-white'
const empty: Partial<Banner> = {
  title: '', subtitle: '', image_url: '',
  link_url: '', button_text: 'Shop Now',
  sort_order: 0, is_active: true,
}

export default function AdminBanners() {
  const { data: banners, isLoading } = useBannersAdmin()
  const upsert   = useUpsertBanner()
  const del      = useDeleteBanner()

  const [isOpen,    setIsOpen]    = useState(false)
  const [editing,   setEditing]   = useState<Partial<Banner>>({})
  const [uploading, setUploading] = useState(false)

  function openNew()           { setEditing({ ...empty }); setIsOpen(true) }
  function openEdit(b: Banner) { setEditing({ ...b });     setIsOpen(true) }

  async function uploadImage(file: File) {
    setUploading(true)
    const ext  = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `banners/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('banner-images')
      .upload(path, file, { upsert: false })

    if (!error) {
      const { data } = supabase.storage.from('banner-images').getPublicUrl(path)
      setEditing(prev => ({ ...prev, image_url: data.publicUrl }))
    } else {
      toast.error('Upload failed: ' + error.message)
    }
    setUploading(false)
  }

  async function handleSave() {
    if (!editing.title || !editing.image_url) {
      toast.error('Title and image are required')
      return
    }
    await upsert.mutateAsync(editing)
    setIsOpen(false)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-cormorant font-semibold text-deep">Banners</h1>
          <p className="text-sm text-muted mt-1">{banners?.length || 0} banners</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2.5 text-sm uppercase tracking-wider hover:bg-sky-500 transition-colors rounded-sm">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Banner cards — 3:4 portrait grid (mobile-first) */}
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading && Array(4).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse bg-stone-100 rounded-sm aspect-[3/4]" />
        ))}

        {banners?.map(b => (
          <div key={b.id} className="bg-white border border-stone-100 rounded-sm overflow-hidden">

            {/* Portrait image — matches mobile hero */}
            <div className="relative aspect-[3/4] bg-stone-100">
              {b.image_url ? (
                <img src={b.image_url} className="w-full h-full object-cover" alt={b.title} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-300">
                  <Image size={32} />
                  <span className="text-xs">No image</span>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent pointer-events-none" />

              {/* Active badge */}
              <span className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-medium ${b.is_active ? 'bg-emerald-500 text-white' : 'bg-stone-500 text-white'}`}>
                {b.is_active ? 'Active' : 'Hidden'}
              </span>

              {/* Title overlay */}
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white font-cormorant text-base font-medium leading-tight line-clamp-2">{b.title}</p>
                {b.subtitle && <p className="text-white/60 text-[10px] mt-0.5 truncate">{b.subtitle}</p>}
              </div>
            </div>

            {/* Card footer */}
            <div className="px-3 py-2.5 flex items-center justify-between">
              <div className="text-xs text-muted">
                <span>#{b.sort_order}</span>
                {b.link_url && (
                  <span className="ml-2 text-sky-500 truncate max-w-[80px] inline-block align-bottom">{b.link_url}</span>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(b)}
                  className="p-1.5 hover:bg-stone-100 rounded transition-colors text-muted hover:text-deep">
                  <Pencil size={13} />
                </button>
                <button onClick={() => del.mutate(b.id)}
                  className="p-1.5 hover:bg-red-50 rounded transition-colors text-muted hover:text-red-600">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && (!banners || banners.length === 0) && (
          <div className="col-span-4 py-20 text-center text-muted">
            <Image size={48} className="mx-auto mb-3 text-stone-200" />
            <p className="font-cormorant text-xl text-deep mb-1">No banners yet</p>
            <p className="text-sm">Add your first banner to display on the homepage.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl shadow-2xl rounded-sm max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-cormorant text-lg font-semibold text-deep">
                {editing.id ? 'Edit Banner' : 'Add Banner'}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-deep text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-4">

              {/* Image upload — portrait 3:4 preview */}
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">
                  Banner Image *
                  <span className="normal-case ml-1 text-muted/60">(recommended: 900 × 1200px)</span>
                </label>

                {editing.image_url ? (
                  <div className="relative aspect-[3/4] rounded-sm overflow-hidden mb-2 bg-stone-100 max-w-[200px]">
                    <img src={editing.image_url} className="w-full h-full object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => setEditing(p => ({ ...p, image_url: '' }))}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors">
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 aspect-[3/4] max-w-[200px] border-2 border-dashed border-stone-200 cursor-pointer hover:border-sky-400 transition-colors rounded-sm text-muted">
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Image size={28} className="text-stone-300" />
                        <span className="text-xs text-center px-2">Click to upload</span>
                        <span className="text-[10px] text-stone-300 text-center px-2">900 × 1200px</span>
                      </>
                    )}
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Title *</label>
                <input
                  value={editing.title || ''}
                  onChange={e => setEditing(p => ({ ...p, title: e.target.value }))}
                  className={inp}
                  placeholder="Eid Collection 2025" />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Subtitle</label>
                <input
                  value={editing.subtitle || ''}
                  onChange={e => setEditing(p => ({ ...p, subtitle: e.target.value }))}
                  className={inp}
                  placeholder="Discover timeless elegance" />
              </div>

              {/* Link + Button text */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Link URL</label>
                  <input
                    value={editing.link_url || ''}
                    onChange={e => setEditing(p => ({ ...p, link_url: e.target.value }))}
                    className={inp}
                    placeholder="/shop?cat=festive" />
                </div>
                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Button Text</label>
                  <input
                    value={editing.button_text || ''}
                    onChange={e => setEditing(p => ({ ...p, button_text: e.target.value }))}
                    className={inp}
                    placeholder="Shop Now" />
                </div>
              </div>

              {/* Sort order + Active toggle */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    value={editing.sort_order ?? 0}
                    onChange={e => setEditing(p => ({ ...p, sort_order: parseInt(e.target.value) }))}
                    className={inp} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm text-deep cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editing.is_active ?? true}
                      onChange={e => setEditing(p => ({ ...p, is_active: e.target.checked }))} />
                    Active (visible on website)
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 border border-stone-200 text-sm text-muted hover:border-deep hover:text-deep transition-colors rounded-sm">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={upsert.isPending}
                  className="px-6 py-2.5 bg-sky-600 text-white text-sm uppercase tracking-wider hover:bg-sky-500 transition-colors disabled:opacity-50 rounded-sm">
                  {upsert.isPending ? 'Saving...' : 'Save Banner'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}