# lookme.lk — Sri Lanka's No.1 Ethnic Fashion Store

A full-stack e-commerce web application built for **lookme.lk**, Sri Lanka's leading Salwar Kameez & ethnic fashion retailer with 74K+ Instagram followers.

---

## 🛍️ Live Features

### Customer Shop
- Mobile-first responsive design
- Hero banner slider (managed from admin)
- Browse by category — Salwar Kameez, Kurtis, Lehengas, Anarkali & more
- Product grid with filters, sort, and price range
- Product detail page with image gallery, size & color selector
- Add to cart with persistent cart (localStorage)
- Checkout with Cash on Delivery
- All 25 Sri Lanka districts supported
- WhatsApp order integration on every page
- Auto WhatsApp notification to admin on new order
- Mobile bottom navigation bar

### Admin Panel (`/admin`)
- Secure login (Supabase Auth)
- Dashboard with KPIs — revenue, orders, products, customers
- 7-day revenue chart
- Full product CRUD with image upload
- Order management with status updates
- Customer list with order history
- Category management with image upload
- Banner management with image upload
- Low stock alerts

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| State | Zustand (cart + auth) |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Routing | React Router v6 |
| Notifications | Sonner |
| Charts | Recharts |
| Fonts | Cormorant Garamond + Jost |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── ShopLayout.tsx       # Navbar, footer, WhatsApp float
│   │   └── AdminLayout.tsx      # Dark sidebar, mobile responsive
│   └── shop/
│       ├── ProductCard.tsx      # Hover effects, badges, add to cart
│       ├── CartDrawer.tsx       # Slide-in cart
│       └── BottomNav.tsx        # Mobile bottom navigation
├── pages/
│   ├── shop/
│   │   ├── Home.tsx             # Hero slider, categories, products
│   │   ├── Shop.tsx             # Product grid with filters
│   │   ├── Product.tsx          # Product detail page
│   │   └── Checkout.tsx         # Order form + COD
│   └── admin/
│       ├── Login.tsx
│       ├── Dashboard.tsx        # KPIs + revenue chart
│       ├── Products.tsx         # Product CRUD
│       ├── Orders.tsx           # Order management
│       ├── Customers.tsx        # Customer list
│       ├── Categories.tsx       # Category + image management
│       └── Banners.tsx          # Banner + image management
├── hooks/
│   └── useApi.ts                # All TanStack Query hooks
├── lib/
│   └── supabase.ts              # Supabase client
├── store/
│   └── index.ts                 # Zustand — cart + auth
└── types/
    └── database.ts              # TypeScript types
```

---

## 🗄️ Database Schema (Supabase PostgreSQL)

```
categories    → id, name, slug, image_url, sort_order, is_active
products      → id, name, slug, price, compare_price, stock_qty,
                sizes[], colors[], images[], is_featured,
                is_new_arrival, is_active, category_id
customers     → id, full_name, phone, email, address, district,
                total_orders, total_spent
orders        → id, order_number (LM-2025-0001), customer_id,
                status, subtotal, delivery_fee, total
order_items   → id, order_id, product_id, size, color,
                quantity, unit_price, total_price
banners       → id, title, subtitle, image_url, link_url,
                button_text, sort_order, is_active
admin_users   → id, auth_user_id, full_name, role, is_active
```

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/lookme-lk.git
cd lookme-lk
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase
- Create a project at [supabase.com](https://supabase.com)
- Go to **SQL Editor** and run `supabase/migrations/001_schema.sql`
- Go to **Storage** and create three public buckets:
  - `product-images`
  - `banner-images`
  - `category-images`

### 4. Create admin user
- Go to **Supabase → Authentication → Users → Add User**
- Then run in SQL Editor:
```sql
INSERT INTO admin_users (auth_user_id, full_name, role)
VALUES ('<user-uuid>', 'Admin', 'super_admin');
```

### 5. Configure environment
```bash
cp .env.example .env.local
```
Fill in your Supabase URL and anon key:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Run development server
```bash
npm run dev
```

Open:
- **http://localhost:3000** — Customer shop
- **http://localhost:3000/admin** — Admin panel

---

## 🌐 Deployment

### Vercel (recommended)
```bash
npm run build
```
- Push to GitHub
- Connect repo to [vercel.com](https://vercel.com)
- Add environment variables in Vercel dashboard
- Deploy

### Environment Variables (Vercel)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

---

## 🎨 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `gold` | `#C9A96E` | Accents, highlights |
| `deep` | `#1A0A00` | Primary dark, navbar |
| `warm` | `#2D1810` | Hover states |
| `cream` | `#FAF6EF` | Background |
| `rose` | `#8B3A3A` | Sale badges, cart count |
| `muted` | `#9A7B6A` | Secondary text |

Admin panel uses `sky-950` / `sky-600` blue theme.

---

## 📱 Key Integrations

- **WhatsApp Orders** — Every product and cart has a direct WhatsApp order link to `+94766604555`
- **Admin Notifications** — New orders automatically send a formatted WhatsApp message to the admin
- **Cash on Delivery** — Only payment method, suited for Sri Lanka market
- **Stock Management** — Stock auto-decrements on every successful order via Supabase RPC

---

## 📞 Contact

**lookme.lk**
- Instagram: [@lookme.lk](https://instagram.com/lookme.lk)
- WhatsApp: [0766 604 555](https://wa.me/94766604555)
- Location: Colombo, Sri Lanka

---

*Built with ❤️ for Sri Lanka's ethnic fashion community*