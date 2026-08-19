import { api } from "./api";
import type {
  DayStats,
  OrderAddonType,
  OrderDetail,
  OrderSource,
  OrderStatus,
  OrderSummary,
  PaymentMethod,
  Service,
  WhatsAppConfig,
} from "@/types";

/** Admin / ops endpoints (require OWNER/ADMIN/OPERATIONS role). */

export interface OrderFilters {
  status?: OrderStatus;
  source?: OrderSource;
  scheduledDate?: string;
  area?: string;
}

export function fetchAdminOrders(filters: OrderFilters = {}): Promise<OrderSummary[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.source) params.set("source", filters.source);
  if (filters.scheduledDate) params.set("scheduled_date", filters.scheduledDate);
  if (filters.area) params.set("area", filters.area);
  const qs = params.toString();
  return api.get<OrderSummary[]>(`/api/v1/admin/orders${qs ? `?${qs}` : ""}`);
}

export interface AdminCreateOrderPayload {
  source: OrderSource;
  customer_name: string;
  customer_phone: string;
  service_id: string;
  scheduled_date: string;
  scheduled_slot: string;
  street: string;
  area: string;
  city?: string;
  state?: string;
  pincode: string;
  floor?: string | null;
  landmark?: string | null;
  description?: string | null;
  estimated_hours?: number | null;
  amount?: number | null;
}

export function createAdminOrder(
  payload: AdminCreateOrderPayload,
): Promise<OrderDetail> {
  return api.post<OrderDetail>("/api/v1/admin/orders", payload);
}

export function fetchAdminOrder(id: string): Promise<OrderDetail> {
  return api.get<OrderDetail>(`/api/v1/admin/orders/${id}`);
}

export function updateOrder(
  id: string,
  patch: Record<string, unknown>,
): Promise<OrderDetail> {
  return api.patch<OrderDetail>(`/api/v1/admin/orders/${id}`, patch);
}

export function setOrderStatus(id: string, status: OrderStatus): Promise<OrderDetail> {
  return api.post<OrderDetail>(`/api/v1/admin/orders/${id}/status`, { status });
}

export function addOrderAddon(
  id: string,
  addon_type: OrderAddonType,
  price: number,
  quantity = 1,
): Promise<OrderDetail> {
  return api.post<OrderDetail>(`/api/v1/admin/orders/${id}/addons`, {
    addon_type,
    price,
    quantity,
  });
}

export interface RecordPaymentPayload {
  amount: number;
  method: PaymentMethod;
  status?: "pending" | "received";
  reference?: string | null;
  notes?: string | null;
}

export function recordPayment(
  id: string,
  payload: RecordPaymentPayload,
): Promise<OrderDetail> {
  return api.post<OrderDetail>(`/api/v1/admin/orders/${id}/payments`, payload);
}

export function fetchDayStats(date?: string): Promise<DayStats> {
  const qs = date ? `?day=${date}` : "";
  return api.get<DayStats>(`/api/v1/admin/stats${qs}`);
}

// --- catalog (admin) ---

export function fetchAdminServices(): Promise<Service[]> {
  return api.get<Service[]>("/api/v1/admin/services");
}

export function createService(
  payload: Record<string, unknown>,
): Promise<Service> {
  return api.post<Service>("/api/v1/admin/services", payload);
}

// --- whatsapp config ---

export function fetchWhatsAppConfig(): Promise<WhatsAppConfig> {
  return api.get<WhatsAppConfig>("/api/v1/admin/whatsapp-config");
}

export function updateWhatsAppConfig(
  payload: Partial<WhatsAppConfig>,
): Promise<WhatsAppConfig> {
  return api.patch<WhatsAppConfig>("/api/v1/admin/whatsapp-config", payload);
}
