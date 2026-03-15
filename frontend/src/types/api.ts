export type Role = "admin" | "cashier" | "customer";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description?: string | null;
  price: string;
  stock: number;
  is_available: boolean;
  image_url?: string | null;
  photo_url?: string | null;
  category?: Category;
}

export interface PaginatedResponse<T> {
  data: T[];
  links?: Record<string, string | null>;
  meta?: Record<string, unknown>;
}

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export interface OrderItem {
  id: number;
  menu_item_id: number;
  quantity: number;
  price: string;
  subtotal: string;
  menu_item?: MenuItem;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: OrderStatus;
  total_amount: string;
  created_at: string;
  items: OrderItem[];
  user?: User;
}

export interface SalesSummaryPoint {
  date?: string;
  week?: string;
  month?: string;
  total: string;
}

export interface SalesSummary {
  daily: SalesSummaryPoint[];
  weekly: SalesSummaryPoint[];
  monthly: SalesSummaryPoint[];
}

export interface CategorySalesPoint {
  id: number;
  name: string;
  total_qty: number;
  total_revenue: string;
}

export interface OrderVolumePoint {
  date: string;
  order_count: number;
}