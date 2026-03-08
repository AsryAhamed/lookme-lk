import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { signInAdmin, supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store'

export default function AdminLogin() {
  const navigate  = useNavigate()
  const setAdmin  = useAuthStore(s => s.setAdmin)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit } = useForm<{ email: string; password: string }>()

  async function onSubmit({ email, password }: { email: string; password: string }) {
    setLoading(true); setError('')
    const { error: authError } = await signInAdmin(email, password)
    if (authError) { setError(authError.message); setLoading(false); return }

    const { data: adminUser } = await supabase
      .from('admin_users').select('*').eq('is_active', true).single()

    if (!adminUser) {
      setError('You do not have admin access.')
      await supabase.auth.signOut()
      setLoading(false); return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setAdmin(true, (adminUser as any).full_name)
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-sky-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-cormorant text-white text-3xl font-semibold tracking-wide">
            look<span className="text-sky-300">me</span>.lk
          </span>
          <p className="text-sky-200/40 text-sm mt-2 uppercase tracking-wider">Admin Portal</p>
        </div>

        <div className="bg-white/5 border border-sky-700/30 p-8 rounded-sm">
          <h1 className="text-white font-cormorant text-xl font-medium mb-6">Sign in to continue</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 mb-5 rounded-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs text-sky-200/40 uppercase tracking-wider mb-1.5">Email</label>
              <input {...register('email')} type="email" required
                className="w-full bg-white/5 border border-sky-700/30 text-white px-4 py-3 text-sm focus:outline-none focus:border-sky-400 placeholder-white/20 rounded-sm"
                placeholder="admin@lookme.lk" />
            </div>
            <div>
              <label className="block text-xs text-sky-200/40 uppercase tracking-wider mb-1.5">Password</label>
              <input {...register('password')} type="password" required
                className="w-full bg-white/5 border border-sky-700/30 text-white px-4 py-3 text-sm focus:outline-none focus:border-sky-400 placeholder-white/20 rounded-sm"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-sky-500 text-white py-3 text-sm font-medium uppercase tracking-widest hover:bg-sky-400 transition-colors disabled:opacity-50 rounded-sm mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sky-200/20 text-xs mt-6">© 2025 Lookme.lk — Admin access only</p>
      </div>
    </div>
  )
}