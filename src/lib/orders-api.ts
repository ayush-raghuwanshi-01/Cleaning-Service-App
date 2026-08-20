import { api } from "./api";
import type { OrderDetail, OrderSummary } from "@/types";

/** Customer-facing order endpoints (require login except track). */

export interface CreateOrderPayload {
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
}

export function createOrder(payload: CreateOrderPayload): Promise<OrderDetail> {
  return api.post<OrderDetail>("/api/v1/orders", payload);
}

export function fetchMyOrders(): Promise<OrderSummary[]> {
  return api.get<OrderSummary[]>("/api/v1/orders");
}

export function fetchOrder(id: string): Promise<OrderDetail> {
  return api.get<OrderDetail>(`/api/v1/orders/${id}`);
}

export function cancelOrder(id: string): Promise<OrderDetail> {
  return api.post<OrderDetail>(`/api/v1/orders/${id}/cancel`);
}

export function rescheduleOrder(
  id: string,
  payload: { scheduled_date: string; scheduled_slot: string },
): Promise<OrderDetail> {
  return api.post<OrderDetail>(`/api/v1/orders/${id}/reschedule`, payload);
}

/** Public, unauthenticated order tracking by order code. */
export interface TrackResult {
  order_code: string;
  service_name: string;
  status: string;
  scheduled_date: string;
  scheduled_slot: string;
  events: { event_type: string; message: string; created_at: string }[];
}

export function trackOrder(orderCode: string): Promise<TrackResult> {
  return api.get<TrackResult>(`/api/v1/orders/track/${orderCode}`);
}
