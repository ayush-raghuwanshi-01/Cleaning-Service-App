/**
 * Domain types. These mirror the FastAPI backend's response models.
 */

export type UserRole = "OWNER" | "ADMIN" | "OPERATIONS" | "STAFF" | "CUSTOMER";

export interface User {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  is_active: boolean;
}

export interface Service {
  id: string;
  name: string;
  category: "express" | "packages" | "addons" | string;
  description: string | null;
  blurb: string | null;
  base_price: number;
  price_max: number | null;
  duration_minutes: number;
  includes: string[] | null;
  excludes: string[] | null;
  addon_price_30min: number | null;
  addon_price_60min: number | null;
  overtime_grace_minutes: number;
  is_active: boolean;
}

export interface ServiceArea {
  id: string;
  name: string;
  pincode: string;
  is_active: boolean;
}

export type OrderSource = "website" | "phone" | "whatsapp";

export type OrderStatus =
  | "requested"
  | "contacted"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "requested",
  "contacted",
  "confirmed",
  "in_progress",
  "completed",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  requested: "Requested",
  contacted: "Contacted",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export type PaymentMethod = "UPI" | "CASH";
export type PaymentStatus = "pending" | "received";
export type OrderAddonType = "30min" | "60min";

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string | null;
  notes: string | null;
  collected_at: string | null;
  created_at: string;
}

export interface OrderAddon {
  id: string;
  addon_type: OrderAddonType;
  price: number;
  quantity: number;
  description: string | null;
  created_at: string;
}

export interface OrderEvent {
  id: string;
  event_type: string;
  message: string;
  created_at: string;
}

export interface OrderSummary {
  id: string;
  order_code: string;
  service_id: string;
  service_name: string;
  source: OrderSource;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  scheduled_date: string;
  scheduled_slot: string;
  estimated_hours: number | null;
  amount: number | null;
  created_at: string;
}

export interface StaffAssignment {
  id: string;
  order_id: string;
  staff_id: string;
  staff_name: string | null;
  assigned_by: string | null;
  role: string;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface OrderDetail extends OrderSummary {
  customer_email: string | null;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  floor: string | null;
  landmark: string | null;
  overtime_hours: number | null;
  description: string | null;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
  payments: Payment[];
  addons: OrderAddon[];
  events: OrderEvent[];
  payment_status: "unpaid" | "partial" | "paid";
  payment_summary: string;
  staff_assignments?: StaffAssignment[];
}

export interface DayStats {
  date: string;
  orders: number;
  completed_orders: number;
  revenue: number;
  revenue_upi: number;
  revenue_cash: number;
  by_source: Record<string, number>;
}

export interface WhatsAppConfig {
  id: number;
  staff_group_link: string | null;
  support_number: string;
}
