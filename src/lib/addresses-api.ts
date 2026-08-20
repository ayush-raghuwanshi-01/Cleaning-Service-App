import { api } from "./api";
import type { Address } from "@/types";

/** Customer saved-address endpoints. */

export interface AddressPayload {
  label: string;
  recipient_name: string;
  recipient_phone: string;
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export function fetchAddresses(): Promise<Address[]> {
  return api.get<Address[]>("/api/v1/addresses");
}

export function createAddress(payload: AddressPayload): Promise<Address> {
  return api.post<Address>("/api/v1/addresses", payload);
}

export function updateAddress(id: string, payload: AddressPayload): Promise<Address> {
  return api.patch<Address>(`/api/v1/addresses/${id}`, payload);
}

export function deleteAddress(id: string): Promise<void> {
  return api.delete<void>(`/api/v1/addresses/${id}`);
}
