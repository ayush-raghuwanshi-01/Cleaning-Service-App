import { api } from "./api";
import type {
  AdminUser,
  DayStats,
  OrderAddonType,
  OrderDetail,
  OrderSource,
  OrderStatus,
  OrderSummary,
  PaymentMethod,
  ReportResponse,
  Service,
  ServiceArea,
  StaffMember,
  UserRole,
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

export type ServicePayload = Omit<Service, "id">;
export type ServiceAreaPayload = Omit<ServiceArea, "id">;

export function createService(payload: ServicePayload): Promise<Service> {
  return api.post<Service>("/api/v1/admin/services", payload);
}

export function updateService(id: string, payload: ServicePayload): Promise<Service> {
  return api.patch<Service>(`/api/v1/admin/services/${id}`, payload);
}

export function deleteService(id: string): Promise<void> {
  return api.delete<void>(`/api/v1/admin/services/${id}`);
}

export function fetchAdminServiceAreas(): Promise<ServiceArea[]> {
  return api.get<ServiceArea[]>("/api/v1/admin/service-areas");
}

export function createServiceArea(payload: ServiceAreaPayload): Promise<ServiceArea> {
  return api.post<ServiceArea>("/api/v1/admin/service-areas", payload);
}

export function updateServiceArea(id: string, payload: ServiceAreaPayload): Promise<ServiceArea> {
  return api.patch<ServiceArea>(`/api/v1/admin/service-areas/${id}`, payload);
}

export function deleteServiceArea(id: string): Promise<void> {
  return api.delete<void>(`/api/v1/admin/service-areas/${id}`);
}

// --- staff management ---

export interface StaffPayload {
  full_name: string;
  phone: string;
  skills?: string[] | null;
  is_active: boolean;
}

export function fetchStaff(): Promise<StaffMember[]> {
  return api.get<StaffMember[]>("/api/v1/admin/staff");
}

export function createStaff(payload: StaffPayload): Promise<StaffMember> {
  return api.post<StaffMember>("/api/v1/admin/staff", payload);
}

export function updateStaff(id: string, payload: StaffPayload): Promise<StaffMember> {
  return api.patch<StaffMember>(`/api/v1/admin/staff/${id}`, payload);
}

export function deleteStaff(id: string): Promise<void> {
  return api.delete<void>(`/api/v1/admin/staff/${id}`);
}

// --- order staff assignment ---

export function fetchAssignedStaff(orderId: string): Promise<StaffMember[]> {
  return api.get<StaffMember[]>(`/api/v1/admin/orders/${orderId}/staff`);
}

export function assignStaff(orderId: string, staffIds: string[]): Promise<OrderDetail> {
  return api.post<OrderDetail>(`/api/v1/admin/orders/${orderId}/staff`, { staff_ids: staffIds });
}

export function unassignStaff(orderId: string, staffId: string): Promise<void> {
  return api.delete<void>(`/api/v1/admin/orders/${orderId}/staff/${staffId}`);
}

// --- user management ---

export interface AdminCreateUserPayload {
  full_name: string;
  phone: string;
  email?: string | null;
  password: string;
  role: UserRole;
}

export function fetchUsers(): Promise<AdminUser[]> {
  return api.get<AdminUser[]>("/api/v1/admin/users");
}

export function createUser(payload: AdminCreateUserPayload): Promise<AdminUser> {
  return api.post<AdminUser>("/api/v1/admin/users", payload);
}

export function updateUser(
  id: string,
  patch: { full_name?: string; role?: UserRole; is_active?: boolean },
): Promise<AdminUser> {
  return api.patch<AdminUser>(`/api/v1/admin/users/${id}`, patch);
}

export function resetUserPassword(id: string, password: string): Promise<void> {
  return api.post<void>(`/api/v1/admin/users/${id}/reset-password`, { password });
}

// --- reports ---

export function fetchReport(start?: string, end?: string): Promise<ReportResponse> {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const qs = params.toString();
  return api.get<ReportResponse>(`/api/v1/admin/reports${qs ? `?${qs}` : ""}`);
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
