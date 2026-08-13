import { useSyncExternalStore } from "react";
import {
  DEFAULT_AREAS,
  DEFAULT_EMPLOYEES,
  DEFAULT_SERVICES,
  type AreaConfig,
  type Employee,
  type OpsState,
  type Order,
  type OrderStatus,
  type Service,
} from "./booking";

const KEY = "sparklehome.ops.v3";

const EMPTY: OpsState = {
  services: DEFAULT_SERVICES,
  areas: DEFAULT_AREAS,
  employees: DEFAULT_EMPLOYEES,
  orders: {},
};

let state: OpsState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): OpsState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<OpsState>;
    return {
      services: parsed.services?.length ? parsed.services : DEFAULT_SERVICES,
      areas: parsed.areas?.length ? parsed.areas : DEFAULT_AREAS,
      employees: parsed.employees?.length ? parsed.employees : DEFAULT_EMPLOYEES,
      orders: parsed.orders ?? {},
    };
  } catch {
    return EMPTY;
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = read();
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    state = read();
    listeners.forEach((l) => l());
  });
}

function commit(next: OpsState) {
  state = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  ensureLoaded();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useOps(): OpsState {
  return useSyncExternalStore(
    subscribe,
    () => {
      ensureLoaded();
      return state;
    },
    () => EMPTY,
  );
}

export function getState() {
  ensureLoaded();
  return state;
}

/* ---------- mutations ---------- */

export function saveOrder(order: Order) {
  ensureLoaded();
  commit({ ...state, orders: { ...state.orders, [order.id]: order } });
}

export function getOrder(id: string): Order | undefined {
  ensureLoaded();
  return state.orders[id];
}

export function updateOrder(id: string, patch: Partial<Order>) {
  ensureLoaded();
  const existing = state.orders[id];
  if (!existing) return;
  commit({ ...state, orders: { ...state.orders, [id]: { ...existing, ...patch } } });
}

export function assignEmployee(orderId: string, employeeId: string) {
  ensureLoaded();
  const existing = state.orders[orderId];
  if (!existing) return;
  const wasAssigned = Boolean(existing.employeeId);
  const orders = {
    ...state.orders,
    [orderId]: {
      ...existing,
      employeeId,
      status: existing.status === "paid" ? ("assigned" as OrderStatus) : existing.status,
    },
  };
  const employees = state.employees.map((e) =>
    e.id === employeeId && !wasAssigned ? { ...e, jobsToday: e.jobsToday + 1 } : e,
  );
  commit({ ...state, orders, employees });
}

export function setOrderStatus(orderId: string, status: OrderStatus, extra?: Partial<Order>) {
  ensureLoaded();
  const existing = state.orders[orderId];
  if (!existing) return;
  const patch: Partial<Order> = { status, ...extra };
  if (status === "in_progress" && !existing.startedAt) patch.startedAt = Date.now();
  if (status === "completed") patch.completedAt = Date.now();
  const orders = { ...state.orders, [orderId]: { ...existing, ...patch } };
  let employees = state.employees;
  if (status === "completed" && existing.status !== "completed" && existing.employeeId) {
    const commission = Math.round(existing.amount * 0.4);
    employees = employees.map((e) =>
      e.id === existing.employeeId ? { ...e, payoutBalance: e.payoutBalance + commission } : e,
    );
  }
  commit({ ...state, orders, employees });
}

export function upsertService(service: Service) {
  ensureLoaded();
  const exists = state.services.some((s) => s.id === service.id);
  const services = exists
    ? state.services.map((s) => (s.id === service.id ? service : s))
    : [...state.services, service];
  commit({ ...state, services });
}

export function removeService(id: string) {
  ensureLoaded();
  commit({ ...state, services: state.services.filter((s) => s.id !== id) });
}

export function toggleArea(pincodeName: string) {
  ensureLoaded();
  const areas: AreaConfig[] = state.areas.map((a) =>
    a.name === pincodeName ? { ...a, servicing: !a.servicing } : a,
  );
  commit({ ...state, areas });
}

export function toggleDuty(employeeId: string) {
  ensureLoaded();
  const employees: Employee[] = state.employees.map((e) =>
    e.id === employeeId ? { ...e, onDuty: !e.onDuty } : e,
  );
  commit({ ...state, employees });
}

export function settlePayout(employeeId: string) {
  ensureLoaded();
  const employees = state.employees.map((e) =>
    e.id === employeeId ? { ...e, payoutBalance: 0 } : e,
  );
  commit({ ...state, employees });
}
