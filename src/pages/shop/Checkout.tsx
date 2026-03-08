import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2 } from 'lucide-react'
import { useCartStore } from '../../store'
import { usePlaceOrder } from '../../hooks/useApi'

const schema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone:     z.string().min(9, 'Valid phone number required'),
  email:     z.string().email().optional().or(z.literal('')),
  address:   z.string().min(5, 'Address is required'),
  city:      z.string().min(2, 'City is required'),
  district:  z.string().min(2, 'District is required'),
  notes:     z.string().optional(),
})
type Form = z.infer<typeof schema>

const DISTRICTS = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya','Galle','Matara',
  'Hambantota','Jaffna','Kilinochchi','Mannar','Vavuniya','Mullaitivu','Batticaloa',
  'Ampara','Trincomalee','Kurunegala','Puttalam','Anuradhapura','Polonnaruwa',
  'Badulla','Monaragala','Ratnapura','Kegalle',
]

const inp = 'w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-gold bg-white'

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCartStore()
  const placeOrder = usePlaceOrder()
  const [orderId, setOrderId] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: Form) {
    const id = await placeOrder.mutateAsync({
      customer_name:     data.full_name,
      customer_phone:    data.phone,
      customer_email:    data.email || undefined,
      delivery_address:  data.address,
      delivery_city:     data.city,
      delivery_district: data.district,
      notes:             data.notes,
      items: items.map(i => ({
        product_id:   i.product.id,
        product_name: i.product.name,
        product_sku:  i.product.sku || undefined,
        size:         i.size || undefined,
        color:        i.color || undefined,
        quantity:     i.quantity,
        unit_price:   i.product.price,
        image_url:    i.product.images?.[0] || undefined,
      })),
    })
     // Notify admin on WhatsApp
  const orderSummary = items.map(i =>
    `• ${i.product.name} (${i.size || 'No size'}) x${i.quantity} — Rs. ${(i.product.price * i.quantity).toLocaleString()}`
  ).join('\n')

  const adminMsg = encodeURIComponent(
    `🛍️ *NEW ORDER RECEIVED*\n` +
    `━━━━━━━━━━━━━━━\n` +
    `👤 *Customer:* ${data.full_name}\n` +
    `📱 *Phone:* ${data.phone}\n` +
    `📍 *Address:* ${data.address}, ${data.city}, ${data.district}\n` +
    (data.notes ? `📝 *Notes:* ${data.notes}\n` : '') +
    `━━━━━━━━━━━━━━━\n` +
    `${orderSummary}\n` +
    `━━━━━━━━━━━━━━━\n` +
    `💰 *Total: Rs. ${(totalPrice() + 350).toLocaleString()}* (inc. delivery)\n` +
    `🆔 Order ID: ${id.slice(0, 8).toUpperCase()}`
  )

  // Open WhatsApp to admin number silently in background
  window.open(`https://wa.me/94766604555?text=${adminMsg}`, '_blank')

  setOrderId(id)
  clearCart()
}

  const delivery = 350
  const total    = totalPrice() + delivery

  if (orderId) return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
        <h1 className="font-cormorant text-4xl text-deep font-light mb-3">Order Confirmed!</h1>
        <p className="text-muted mb-2">Thank you! We'll contact you shortly to confirm delivery details.</p>
        <p className="text-xs text-muted mb-8 font-mono bg-stone-50 px-4 py-2 inline-block">
          Order ID: {orderId.slice(0, 8).toUpperCase()}
        </p>
        <div className="flex flex-col gap-3">
          <a href={`https://wa.me/94766604555?text=${encodeURIComponent(`Hi! I just placed an order (ID: ${orderId.slice(0,8).toUpperCase()}). Could you confirm the details? Thank you!`)}`}
            target="_blank" rel="noreferrer"
            className="bg-[#25D366] text-white text-xs uppercase tracking-widest py-4 flex items-center justify-center hover:opacity-90 transition-opacity">
            Confirm on WhatsApp
          </a>
          <Link to="/shop"
            className="border border-deep text-deep text-xs uppercase tracking-widest py-4 hover:bg-deep hover:text-white transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )

  if (items.length === 0) return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-6">
      <div>
        <p className="font-cormorant text-3xl text-deep mb-3">Your cart is empty</p>
        <Link to="/shop" className="text-xs text-gold uppercase tracking-widest hover:underline">← Continue Shopping</Link>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-cormorant text-4xl font-light text-deep mb-10">Checkout</h1>

      <div className="grid md:grid-cols-5 gap-12">
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            <section>
              <h2 className="text-xs uppercase tracking-widest text-muted mb-5 pb-3 border-b border-stone-100">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input {...register('full_name')} placeholder="Priya Subramaniam" className={inp} />
                  {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Phone *</label>
                    <input {...register('phone')} placeholder="07X XXX XXXX" className={inp} />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Email (optional)</label>
                    <input {...register('email')} type="email" placeholder="you@email.com" className={inp} />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xs uppercase tracking-widest text-muted mb-5 pb-3 border-b border-stone-100">Delivery Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Street Address *</label>
                  <input {...register('address')} placeholder="123 Temple Road" className={inp} />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">City *</label>
                    <input {...register('city')} placeholder="Colombo" className={inp} />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">District *</label>
                    <select {...register('district')} className={inp}>
                      <option value="">Select district</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Notes (optional)</label>
                  <textarea {...register('notes')} rows={3} placeholder="Any special instructions or custom size notes..." className={inp} />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xs uppercase tracking-widest text-muted mb-5 pb-3 border-b border-stone-100">Payment</h2>
              <div className="bg-amber-50 border border-amber-100 px-4 py-3">
                <p className="text-sm text-amber-800 font-medium">Cash on Delivery</p>
                <p className="text-xs text-amber-600 mt-0.5">Pay in cash when your order arrives. We'll confirm via WhatsApp.</p>
              </div>
            </section>

            <button type="submit" disabled={placeOrder.isPending}
              className="w-full bg-deep text-white text-xs uppercase tracking-widest py-4 hover:bg-warm transition-colors disabled:opacity-50">
              {placeOrder.isPending ? 'Placing Order...' : `Place Order — Rs. ${total.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* Summary */}
        <div className="md:col-span-2">
          <div className="bg-white border border-stone-100 p-6 sticky top-24">
            <h2 className="text-xs uppercase tracking-widest text-muted mb-5">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                  <div className="w-14 h-16 shrink-0 bg-stone-100 overflow-hidden">
                    {item.product.images?.[0]
                      ? <img src={item.product.images[0]} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-[#8B1A4A] to-[#4A0E2A]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-cormorant text-deep text-sm leading-tight line-clamp-2">{item.product.name}</p>
                    {item.size && <p className="text-xs text-muted">Size: {item.size}</p>}
                    <p className="text-xs text-muted">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-deep shrink-0">
                    Rs. {(item.product.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span>Rs. {totalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Delivery</span>
                <span>Rs. {delivery}</span>
              </div>
              <div className="flex justify-between font-cormorant text-xl text-deep font-semibold border-t border-stone-100 pt-3 mt-3">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}