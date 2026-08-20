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
  ServiceArea,
  WhatsAppConfig,
} from "@/types";

/** Admin / ops endpoints (require OWNER/ADMIN/OPERATIONS role). */

export interface OrderFilters {
  status?: OrderStatus;
  source?: OrderSource;
  scheduledDate?: string;
  area?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export function fetchAdminOrders(
  filters: OrderFilters = {},
  page = 1,
  pageSize = 50,
): Promise<PaginatedResult<OrderSummary>> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.source) params.set("source", filters.source);
  if (filters.scheduledDate) params.set("scheduled_date", filters.scheduledDate);
  if (filters.area) params.set("area", filters.area);
  params.set("page", String(page));
  params.set("page_size", String(pageSize));
  const qs = params.toString();
  return api.get<PaginatedResult<OrderSummary>>(
    `/api/v1/admin/orders${qs ? `?${qs}` : ""}`,
  );
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

export function setOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<OrderDetail> {
  return api.post<OrderDetail>(`/api/v1/admin/orders/${id}/status`, {
    status,
  });
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
  return api.post<OrderDetail>(
    `/api/v1/admin/orders/${id}/payments`,
    payload,
  );
}

export function fetchDayStats(date?: string): Promise<DayStats> {
  const qs = date ? `?day=${date}` : "";
  return api.get<DayStats>(`/api/v1/admin/stats${qs}`);
}

// --- catalog (admin) ---

export function fetchAdminServices(): Promise<Service[]> {
  return api.get<Service[]>("/api/v1/admin/services");
}

export type ServicePayload = Omit<Service, "id">;
export type ServiceAreaPayload = Omit<ServiceArea, "id">;

export function createService(payload: ServicePayload): Promise<Service> {
  return api.post<Service>("/api/v1/admin/services", payload);
}

export function updateService(
  id: string,
  payload: ServicePayload,
): Promise<Service> {
  return api.patch<Service>(`/api/v1/admin/services/${id}`, payload);
}

export function fetchAdminServiceAreas(): Promise<ServiceArea[]> {
  return api.get<ServiceArea[]>("/api/v1/admin/service-areas");
}

export function createServiceArea(
  payload: ServiceAreaPayload,
): Promise<ServiceArea> {
  return api.post<ServiceArea>("/api/v1/admin/service-areas", payload);
}

export function updateServiceArea(
  id: string,
  payload: ServiceAreaPayload,
): Promise<ServiceArea> {
  return api.patch<ServiceArea>(
    `/api/v1/admin/service-areas/${id}`,
    payload,
  );
}

// --- whatsapp config ---

export function fetchWhatsAppConfig(): Promise<WhatsAppConfig> {
  return api.get<WhatsAppConfig>("/api/v1/admin/whatsapp-config");
}

export function updateWhatsAppConfig(
  payload: Partial<WhatsAppConfig>,
): Promise<WhatsAppConfig> {
  return api.patch<WhatsAppConfig>(
    "/api/v1/admin/whatsapp-config",
    payload,
  );
}

// --- NEW: Staff management ---

export interface StaffMember {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  status: string;
  specializations: string | null;
  profile_image: string | null;
  rating: number | null;
  total_jobs: number;
  joined_at: string | null;
}

export function fetchStaff(): Promise<StaffMember[]> {
  return api.get<StaffMember[]>("/api/v1/admin/staff");
}

export function createStaff(
  payload: Partial<StaffMember>,
): Promise<StaffMember> {
  return api.post<StaffMember>("/api/v1/admin/staff", payload);
}

export function updateStaff(
  id: string,
  payload: Partial<StaffMember>,
): Promise<StaffMember> {
  return api.patch<StaffMember>(`/api/v1/admin/staff/${id}`, payload);
}

export function assignStaffToOrder(
  orderId: string,
  staffId: string,
  role = "cleaner",
  notes?: string,
): Promise<unknown> {
  return api.post(`/api/v1/admin/orders/${orderId}/assign`, {
    staff_id: staffId,
    role,
    notes,
  });
}

// --- Audit logs ---

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string | null;
}

export function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  return api.get<AuditLogEntry[]>("/api/v1/admin/audit-logs");
}

// --- Dashboard alerts ---

export interface DashboardAlerts {
  unassigned_jobs: number;
  overdue_payments: number;
  today: string;
  pipeline: Record<string, number>;
}

export function fetchDashboardAlerts(): Promise<DashboardAlerts> {
  return api.get<DashboardAlerts>("/api/v1/admin/dashboard-alerts");
}

// --- Reports ---

export function fetchRevenueSummary(
  startDate: string,
  endDate: string,
): Promise<{
  start_date: string;
  end_date: string;
  total_orders: number;
  completed_orders: number;
  total_revenue: number;
  upi_revenue: number;
  cash_revenue: number;
  by_source: Record<string, number>;
  by_status: Record<string, number>;
  daily_revenue: Array<{
    date: string;
    revenue: number;
    upi: number;
    cash: number;
    orders: number;
  }>;
}> {
  return api.get(
    `/api/v1/admin/reports/revenue-summary?start_date=${startDate}&end_date=${endDate}`,
  );
}