import type {
  Category,
  CategorySalesPoint,
  LoginResponse,
  MenuItem,
  Order,
  OrderVolumePoint,
  PaginatedResponse,
  SalesSummary,
  User,
} from "@/types/api";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: BodyInit | Record<string, unknown>;
};

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

const request = async <T>(path: string, options: RequestOptions = {}) => {
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(!isFormData && options.body ? { "Content-Type": "application/json" } : {}),
  };

  const response = await fetch(buildUrl(path), {
    method: options.method ?? "GET",
    headers,
    body:
      options.body && !isFormData
        ? JSON.stringify(options.body)
        : (options.body as BodyInit | undefined),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload as T;
};

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/api/login", {
      method: "POST",
      body: { email, password },
    }),

  logout: (token: string) =>
    request<{ message: string }>("/api/logout", {
      method: "POST",
      token,
    }),

  me: (token: string) =>
    request<User>("/api/me", {
      token,
    }),

  getMenu: (page?: number) =>
    request<PaginatedResponse<MenuItem>>(`/api/menu${page ? `?page=${page}` : ""}`),

  getCategories: () => request<Category[]>("/api/categories"),

  createMenuItem: (token: string, body: Record<string, unknown> | FormData) =>
    request<MenuItem>("/api/menu", {
      method: "POST",
      token,
      body,
    }),

  updateMenuItem: (
    token: string,
    menuItemId: number,
    body: Record<string, unknown> | FormData,
  ) =>
    request<MenuItem>(`/api/menu/${menuItemId}`, {
      method: "PATCH",
      token,
      body,
    }),

  deleteMenuItem: (token: string, menuItemId: number) =>
    request<{ message: string }>(`/api/menu/${menuItemId}`, {
      method: "DELETE",
      token,
    }),

  adjustStock: (
    token: string,
    menuItemId: number,
    change: number,
    reason = "manual adjustment",
  ) =>
    request<MenuItem>(`/api/menu/${menuItemId}/stock`, {
      method: "PATCH",
      token,
      body: { change, reason },
    }),

  toggleAvailability: (token: string, menuItemId: number) =>
    request<MenuItem>(`/api/menu/${menuItemId}/toggle-availability`, {
      method: "POST",
      token,
    }),

  createOrder: (
    token: string,
    items: Array<{ menu_item_id: number; quantity: number }>,
  ) =>
    request<Order>("/api/orders", {
      method: "POST",
      token,
      body: { items },
    }),

  getOrders: (token: string, page?: number) =>
    request<PaginatedResponse<Order>>(
      `/api/orders${page ? `?page=${page}` : ""}`,
      { token },
    ),

  getOrder: (token: string, orderId: number) =>
    request<Order>(`/api/orders/${orderId}`, { token }),

  updateOrderStatus: (token: string, orderId: number, status: string) =>
    request<Order>(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      token,
      body: { status },
    }),

  getSalesSummary: (token: string, from?: string, to?: string) =>
    request<SalesSummary>(
      `/api/reports/sales-summary${from || to ? `?${new URLSearchParams({
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      }).toString()}` : ""}`,
      { token },
    ),

  getOrderVolume: (token: string, from?: string, to?: string) =>
    request<OrderVolumePoint[]>(
      `/api/reports/order-volume${from || to ? `?${new URLSearchParams({
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      }).toString()}` : ""}`,
      { token },
    ),

  getCategorySales: (token: string, from?: string, to?: string) =>
    request<CategorySalesPoint[]>(
      `/api/reports/category-sales${from || to ? `?${new URLSearchParams({
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      }).toString()}` : ""}`,
      { token },
    ),
};