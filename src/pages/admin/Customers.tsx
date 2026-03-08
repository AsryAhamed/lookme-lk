import { useState } from 'react'
import { Search, Phone, MapPin, ShoppingBag } from 'lucide-react'
import { useCustomers } from '../../hooks/useApi'

export default function AdminCustomers() {
  const { data: customers, isLoading } = useCustomers()
  const [search, setSearch] = useState('')

  const filtered = customers?.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-cormorant font-semibold text-deep">Customers</h1>
        <p className="text-sm text-muted mt-1">{customers?.length || 0} total customers</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone or email..."
          className="w-full pl-9 pr-4 py-2.5 border border-stone-200 text-sm focus:outline-none focus:border-sky-400" />
      </div>

      <div className="bg-white border border-stone-100 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              {['Customer', 'Contact', 'Location', 'Orders', 'Total Spent', 'Joined'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">Loading...</td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-medium text-deep">{c.full_name}</div>
                  {c.email && <div className="text-xs text-muted mt-0.5">{c.email}</div>}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-muted text-sm">
                    <Phone size={13} />
                    {c.phone}
                  </div>
                </td>
                <td className="px-5 py-4">
                  {c.city || c.district ? (
                    <div className="flex items-center gap-1.5 text-muted text-sm">
                      <MapPin size={13} />
                      {[c.city, c.district].filter(Boolean).join(', ')}
                    </div>
                  ) : <span className="text-muted">—</span>}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag size={13} className="text-muted" />
                    <span className="font-medium text-deep">{c.total_orders}</span>
                  </div>
                </td>
                <td className="px-5 py-4 font-medium text-deep">
                  Rs. {Number(c.total_spent).toLocaleString()}
                </td>
                <td className="px-5 py-4 text-muted text-xs">
                  {new Date(c.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}