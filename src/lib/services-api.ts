import { api } from "./api";
import type { Service, ServiceArea } from "@/types";

/** Public catalog endpoints. */

export function fetchServices(): Promise<Service[]> {
  return api.get<Service[]>("/api/v1/services");
}

export function fetchServiceAreas(): Promise<ServiceArea[]> {
  return api.get<ServiceArea[]>("/api/v1/service-areas");
}
