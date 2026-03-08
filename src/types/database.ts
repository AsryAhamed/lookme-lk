export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type SizeType = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'custom'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  price: number
  compare_price: number | null
  cost_price: number | null
  sku: string | null
  stock_qty: number
  low_stock_alert: number
  sizes: SizeType[]
  colors: string[]
  images: string[]
  is_featured: boolean
  is_new_arrival: boolean
  is_active: boolean
  tags: string[]
  created_at: string
  updated_at: string
  category?: Category
}

export interface Customer {
  id: string
  auth_user_id: string | null
  full_name: string
  email: string | null
  phone: string
  address: string | null
  city: string | null
  district: string | null
  notes: string | null
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string | null
  status: OrderStatus
  subtotal: number
  delivery_fee: number
  discount_amount: number
  total: number
  delivery_address: string | null
  delivery_city: string | null
  delivery_district: string | null
  notes: string | null
  admin_notes: string | null
  source: string
  created_at: string
  updated_at: string
  customer?: Customer
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_sku: string | null
  size: SizeType | null
  color: string | null
  quantity: number
  unit_price: number
  total_price: number
  image_url: string | null
  created_at: string
}

export interface Banner {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  link_url: string | null
  button_text: string
  sort_order: number
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
  size: SizeType | null
  color: string | null
}

export type Database = {
  public: {
    Tables: {
      categories:  { Row: Category;  Insert: Partial<Category>;  Update: Partial<Category> }
      products:    { Row: Product;   Insert: Partial<Product>;   Update: Partial<Product> }
      customers:   { Row: Customer;  Insert: Partial<Customer>;  Update: Partial<Customer> }
      orders:      { Row: Order;     Insert: Partial<Order>;     Update: Partial<Order> }
      order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem> }
      banners:     { Row: Banner;    Insert: Partial<Banner>;    Update: Partial<Banner> }
    }
  }
}