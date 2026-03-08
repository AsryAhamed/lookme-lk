import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import type { Category } from '../../types/database'
import { Image, Pencil, X, Check } from 'lucide-react'

function useAllCategories() {
  return useQuery({
    queryKey: ['categories', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories').select('*').order('sort_order')
      if (error) throw error
      return (data ?? []) as unknown as Category[]
    },
  })
}

function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<Category> & { id: string }) => {
      const { error } = await supabase.from('categories').update(rest as never).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export default function AdminCategories() {
  const { data: categories, isLoading } = useAllCategories()
  const update = useUpdateCategory()
  const [uploading, setUploading] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function uploadCategoryImage(categoryId: string, file: File) {
    setUploading(categoryId)
    const ext  = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `categories/${categoryId}.${ext}`

    const { error } = await supabase.storage
      .from('category-images')
      .upload(path, file, { upsert: true })

    if (!error) {
      const { data } = supabase.storage.from('category-images').getPublicUrl(path)
      await update.mutateAsync({ id: categoryId, image_url: data.publicUrl })
    } else {
      toast.error('Upload failed: ' + error.message)
    }
    setUploading(null)
  }

  function startEdit(cat: Category) {
    setEditing(cat.id)
    setEditName(cat.name)
  }

  async function saveEdit(cat: Category) {
    await update.mutateAsync({ id: cat.id, name: editName })
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-cormorant font-semibold text-deep">Categories</h1>
        <p className="text-sm text-muted mt-1">Manage category names and images</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && Array(7).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse bg-stone-100 rounded-sm h-52" />
        ))}

        {categories?.map(cat => (
          <div key={cat.id} className="bg-white border border-stone-100 rounded-sm overflow-hidden group">

            {/* Image area */}
            <div className="relative aspect-[3/4] bg-stone-100">
              {cat.image_url ? (
                <img src={cat.image_url} className="w-full h-full object-cover" alt={cat.name} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-300">
                  <Image size={32} />
                  <span className="text-xs">No image</span>
                </div>
              )}

              {/* Upload overlay */}
              <label className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-all ${uploading === cat.id ? 'bg-black/50' : 'bg-black/0 group-hover:bg-black/40'}`}>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && uploadCategoryImage(cat.id, e.target.files[0])} />
                {uploading === cat.id ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-white text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                    <Image size={14} /> Change Image
                  </span>
                )}
              </label>
            </div>

            {/* Name + controls */}
            <div className="p-4">
              {editing === cat.id ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 border border-stone-200 px-2 py-1 text-sm focus:outline-none focus:border-sky-400 rounded-sm"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat); if (e.key === 'Escape') setEditing(null) }}
                  />
                  <button onClick={() => saveEdit(cat)} className="text-emerald-500 hover:text-emerald-600"><Check size={16} /></button>
                  <button onClick={() => setEditing(null)} className="text-muted hover:text-red-500"><X size={16} /></button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-deep text-sm">{cat.name}</p>
                    <p className="text-xs text-muted mt-0.5">/{cat.slug}</p>
                  </div>
                  <button onClick={() => startEdit(cat)} className="p-1.5 text-muted hover:text-deep hover:bg-stone-100 rounded transition-colors">
                    <Pencil size={14} />
                  </button>
                </div>
              )}

              {/* Active toggle */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-50">
                <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-sm ${cat.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                  {cat.is_active ? 'Active' : 'Hidden'}
                </span>
                <button
                  onClick={() => update.mutate({ id: cat.id, is_active: !cat.is_active })}
                  className="text-xs text-muted hover:text-deep underline transition-colors">
                  {cat.is_active ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}