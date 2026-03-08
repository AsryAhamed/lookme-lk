import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ShoppingBag, Users, Package, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import { useDashboardStats, useOrders } from '../../hooks/useApi'

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:    'bg-amber-100 text-amber-700',
    confirmed:  'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped:    'bg-indigo-100 text-indigo-700',
    delivered:  'bg-emerald-100 text-emerald-700',
    cancelled:  'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-sm text-xs font-medium uppercase tracking-wider ${styles[status] || 'bg-stone-100 text-stone-600'}`}>
      {status}
    </span>
  )
}

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats()
  const { data: orders } = useOrders()
  const recentOrders = orders?.slice(0, 5) || []

  if (isLoading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 bg-stone-100 rounded w-48" />
      <div className="grid grid-cols-4 gap-5">{Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-stone-100 rounded-sm" />)}</div>
      <div className="h-64 bg-stone-100 rounded-sm" />
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-cormorant font-semibold text-deep">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Welcome back — here's what's happening today</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { icon: <TrendingUp size={20}/>, label: 'Total Revenue',  value: `Rs. ${(stats?.totalRevenue||0).toLocaleString()}`, accent: 'amber' },
          { icon: <ShoppingBag size={20}/>, label: 'Total Orders',  value: stats?.totalOrders||0, sub: `${stats?.todayOrders} today`, accent: 'rose' },
          { icon: <Package size={20}/>,    label: 'Products',       value: stats?.totalProducts||0, sub: stats?.lowStock ? `${stats.lowStock} low stock` : undefined, subAlert: !!stats?.lowStock, accent: 'stone' },
          { icon: <Users size={20}/>,      label: 'Customers',      value: stats?.totalCustomers||0, accent: 'emerald' },
        ].map(({ icon, label, value, sub, subAlert, accent }) => (
          <div key={label} className="bg-white border border-stone-100 p-5 rounded-sm">
            <div className={`p-2 rounded-sm inline-flex mb-4 bg-${accent}-50 text-${accent}-600`}>{icon}</div>
            <div className="text-2xl font-cormorant font-semibold text-deep mb-1">{value}</div>
            <div className="text-xs text-muted uppercase tracking-wider">{label}</div>
            {sub && (
              <div className={`text-xs mt-1 flex items-center gap-1 ${subAlert ? 'text-amber-600' : 'text-muted'}`}>
                {subAlert && <AlertTriangle size={11}/>} {sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {(stats?.pendingOrders||0) > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-3">
          <Clock size={18} className="text-amber-600 shrink-0"/>
          <p className="text-sm text-amber-800">
            <strong>{stats?.pendingOrders} pending orders</strong> require your attention.{' '}
            <a href="/admin/orders" className="underline font-medium">View orders →</a>
          </p>
        </div>
      )}

      {/* Revenue chart */}
      <div className="bg-white border border-stone-100 p-6 rounded-sm">
        <h2 className="text-base font-medium text-deep mb-5">Revenue — Last 7 Days</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={stats?.revenueChart||[]}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#C9A96E" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize:12 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:12 }} axisLine={false} tickLine={false} tickFormatter={v=>`Rs.${(v/1000).toFixed(0)}k`}/>
            <Tooltip formatter={(v) => [`Rs. ${Number(v).toLocaleString()}`, 'Revenue']} contentStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="revenue" stroke="#C9A96E" strokeWidth={2} fill="url(#rev)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-stone-100 rounded-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-base font-medium text-deep">Recent Orders</h2>
          <a href="/admin/orders" className="text-xs text-gold hover:underline">View all →</a>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              {['Order','Customer','Status','Total','Date'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-deep font-medium">{order.order_number}</td>
                <td className="px-6 py-4 text-deep">{order.customer?.full_name||'—'}</td>
                <td className="px-6 py-4"><StatusBadge status={order.status}/></td>
                <td className="px-6 py-4 font-medium">Rs. {order.total.toLocaleString()}</td>
                <td className="px-6 py-4 text-muted">{new Date(order.created_at).toLocaleDateString('en',{day:'numeric',month:'short',year:'numeric'})}</td>
              </tr>
            ))}
            {recentOrders.length===0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">No orders yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}