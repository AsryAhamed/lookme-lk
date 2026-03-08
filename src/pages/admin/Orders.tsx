import { useState } from 'react'
import { Search, MessageCircle } from 'lucide-react'
import { useOrders, useUpdateOrderStatus } from '../../hooks/useApi'
import { StatusBadge } from './Dashboard'
import type { Order, OrderStatus } from '../../types/database'

const STATUSES: OrderStatus[] = ['pending','confirmed','processing','shipped','delivered','cancelled']

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders()
  const updateStatus = useUpdateOrderStatus()
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilter] = useState('all')
  const [selected, setSelected]   = useState<Order|null>(null)

  const filtered = orders?.filter(o => {
    const matchSearch = o.order_number.includes(search) ||
      o.customer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.phone?.includes(search)
    const matchStatus = filterStatus==='all' || o.status===filterStatus
    return matchSearch && matchStatus
  }) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-cormorant font-semibold text-deep">Orders</h1>
        <p className="text-sm text-muted mt-1">{orders?.length||0} total orders</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search by order #, name, phone..."
            className="w-full pl-9 pr-4 py-2.5 border border-stone-200 text-sm focus:outline-none focus:border-gold"/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all',...STATUSES].map(s=>(
            <button key={s} onClick={()=>setFilter(s)}
              className={`px-3 py-2 text-xs uppercase tracking-wider border transition-colors ${filterStatus===s?'bg-deep text-white border-deep':'border-stone-200 text-muted hover:border-deep'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone-100 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              {['Order #','Customer','Items','Total','Status','Date',''].map(h=>(
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">Loading...</td></tr>}
            {filtered.map(order=>(
              <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                <td className="px-5 py-4">
                  <button onClick={()=>setSelected(order)} className="font-mono text-xs text-gold hover:underline font-medium">
                    {order.order_number}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-deep">{order.customer?.full_name||'—'}</div>
                  <div className="text-xs text-muted">{order.customer?.phone}</div>
                </td>
                <td className="px-5 py-4 text-muted">{order.items?.length||0} item(s)</td>
                <td className="px-5 py-4 font-medium">Rs. {order.total.toLocaleString()}</td>
                <td className="px-5 py-4">
                  <select value={order.status}
                    onChange={e=>updateStatus.mutate({id:order.id, status:e.target.value})}
                    className="text-xs border border-stone-200 px-2 py-1 focus:outline-none focus:border-gold bg-white">
                    {STATUSES.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </td>
                <td className="px-5 py-4 text-muted text-xs">
                  {new Date(order.created_at).toLocaleDateString('en',{day:'numeric',month:'short'})}
                </td>
                <td className="px-5 py-4">
                  <a href={`https://wa.me/${order.customer?.phone?.replace(/\D/g,'')}?text=Hi%20${encodeURIComponent(order.customer?.full_name||'')}%2C%20your%20order%20${order.order_number}%20update...`}
                    target="_blank" rel="noreferrer"
                    className="p-1.5 hover:bg-green-50 rounded transition-colors text-muted hover:text-green-600 inline-flex">
                    <MessageCircle size={14}/>
                  </a>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length===0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">No orders found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={()=>setSelected(null)}>
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <div>
                <h2 className="font-cormorant font-semibold text-deep text-lg">{selected.order_number}</h2>
                <StatusBadge status={selected.status}/>
              </div>
              <button onClick={()=>setSelected(null)} className="text-muted hover:text-deep text-2xl">×</button>
            </div>
            <div className="p-6 space-y-5">
              <section>
                <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Customer</h3>
                <p className="font-medium text-deep">{selected.customer?.full_name}</p>
                <p className="text-sm text-muted">{selected.customer?.phone}</p>
                {selected.customer?.email && <p className="text-sm text-muted">{selected.customer.email}</p>}
              </section>

              {selected.delivery_address && (
                <section>
                  <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Delivery</h3>
                  <p className="text-sm text-deep">{selected.delivery_address}</p>
                  <p className="text-sm text-muted">{selected.delivery_city}, {selected.delivery_district}</p>
                </section>
              )}

              <section>
                <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Items</h3>
                <div className="space-y-3">
                  {selected.items?.map(item=>(
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b border-stone-50">
                      {item.image_url
                        ? <img src={item.image_url} className="w-12 h-14 object-cover rounded-sm"/>
                        : <div className="w-12 h-14 bg-stone-100 rounded-sm"/>
                      }
                      <div className="flex-1">
                        <p className="text-sm font-medium text-deep">{item.product_name}</p>
                        <p className="text-xs text-muted">Size: {item.size||'—'} · Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">Rs. {item.total_price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-stone-50 p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span>Rs. {selected.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted">Delivery</span><span>Rs. {selected.delivery_fee.toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold text-deep border-t border-stone-200 pt-2">
                  <span>Total</span><span>Rs. {selected.total.toLocaleString()}</span>
                </div>
              </section>

              {selected.notes && (
                <section>
                  <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Note</h3>
                  <p className="text-sm text-deep bg-amber-50 p-3">{selected.notes}</p>
                </section>
              )}

              <a href={`https://wa.me/${selected.customer?.phone?.replace(/\D/g,'')}?text=Hi%20${encodeURIComponent(selected.customer?.full_name||'')}%2C%20thank%20you%20for%20your%20order%20${selected.order_number}!%20We%20will%20update%20you%20shortly.`}
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
                <MessageCircle size={16}/> Message Customer
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}