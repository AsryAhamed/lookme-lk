/* eslint-disable react-hooks/static-components */
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users, Image, LogOut, ExternalLink, Menu, Tag } from 'lucide-react'
import { signOut } from '../../lib/supabase'
import { useAuthStore } from '../../store'

const navItems = [
  { to: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/admin/products',   label: 'Products',   icon: Package },
  { to: '/admin/orders',     label: 'Orders',     icon: ShoppingBag },
  { to: '/admin/customers',  label: 'Customers',  icon: Users },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/banners',    label: 'Banners',    icon: Image },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { adminName, setAdmin } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    setAdmin(false)
    navigate('/admin/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sky-700/40">
        <span className="font-cormorant text-white text-xl font-semibold tracking-wide">
          look<span className="text-sky-300">me</span>.lk
        </span>
        <p className="text-xs text-sky-200/40 mt-0.5 uppercase tracking-wider">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-colors ${
                isActive
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'text-sky-100/50 hover:text-sky-100 hover:bg-sky-500/10'
              }`
            }>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom links */}
      <div className="px-3 py-4 border-t border-sky-700/30 space-y-0.5">
        <a href="/" target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-sky-100/40 hover:text-sky-100/70 transition-colors rounded-sm">
          <ExternalLink size={16} /> View Website
        </a>
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-sky-100/40 hover:text-red-400 transition-colors rounded-sm">
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* User badge */}
      {adminName && (
        <div className="px-4 pb-4">
          <div className="bg-sky-500/10 rounded-sm px-3 py-2">
            <p className="text-xs text-sky-200/40">Logged in as</p>
            <p className="text-xs text-sky-100/80 font-medium mt-0.5 truncate">{adminName}</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-50 font-jost overflow-hidden">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-sky-950 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-sky-950 z-50 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-sky-950 border-b border-sky-700/30 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-sky-100/70 hover:text-white transition-colors">
            <Menu size={22} />
          </button>
          <span className="font-cormorant text-white text-lg font-semibold">
            look<span className="text-sky-300">me</span>.lk
          </span>
          <button onClick={handleSignOut} className="text-sky-100/40 hover:text-red-400 transition-colors">
            <LogOut size={18} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}