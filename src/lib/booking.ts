export type ServiceCategory = "express" | "packages" | "addons";

export type Service = {
  id: string;
  category: ServiceCategory;
  name: string;
  price: number;
  durationMins: number;
  blurb: string;
  includes: string[];
  excludes?: string[];
  priceMax?: number;
  active: boolean;
};

export const DEFAULT_EXCLUSIONS = [
  "Wall painting, plaster or civil repair work",
  "Moving heavy furniture or almirahs",
  "Exterior windows above ground floor",
  "Removing rust, permanent stains or acid damage",
];

export function serviceExclusions(s: Service) {
  return s.excludes && s.excludes.length ? s.excludes : DEFAULT_EXCLUSIONS;
}

export function priceLabel(s: Service) {
  return s.priceMax ? `${inr(s.price)} - ${inr(s.priceMax)}` : inr(s.price);
}

export function durationLabel(mins: number) {
  return mins >= 60 ? `${Math.round((mins / 60) * 10) / 10} hrs` : `${mins} mins`;
}

export const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  express: "Popular Express",
  packages: "Full Home Packages",
  addons: "Specialized Add-ons",
};

export const DEFAULT_SERVICES: Service[] = [
  {
    id: "housekeeping",
    category: "express",
    name: "Express Housekeeping",
    price: 399,
    durationMins: 120,
    blurb: "Sweeping, mopping, dusting, kitchen & bathroom wipe-down.",
    includes: ["2 trained staff hours", "Eco cleaning kit", "Bathroom sanitisation"],
    active: true,
  },
  {
    id: "carwash",
    category: "express",
    name: "Doorstep Car Wash",
    price: 399,
    durationMins: 60,
    blurb: "Exterior foam wash, tyre polish and interior vacuum at your gate.",
    includes: ["Exterior foam wash", "Interior vacuum", "Dashboard polish"],
    active: true,
  },
  {
    id: "bathroom",
    category: "express",
    name: "Bathroom Deep Scrubbing",
    price: 649,
    durationMins: 90,
    blurb: "Single bathroom descaling, tile scrub and fittings polish.",
    includes: ["Hard water descaling", "Tile & grout scrub", "Fittings polish"],
    excludes: ["Acid treatment on marble", "Plumbing repair", "Silicone re-sealing"],
    active: true,
  },
  {
    id: "bathroom-basic",
    category: "express",
    name: "Bathroom Basic Cleaning",
    price: 449,
    durationMins: 60,
    blurb: "Quick sanitising wash for a single bathroom — floor, pot and basin.",
    includes: ["Floor & wall wash", "Toilet sanitisation", "Basin & mirror shine"],
    excludes: ["Hard water descaling", "Grout whitening", "Plumbing repair"],
    active: true,
  },
  {
    id: "kitchen-basic",
    category: "express",
    name: "Kitchen Basic Cleaning",
    price: 699,
    durationMins: 120,
    blurb: "Slab, sink, tiles and cabinet-front cleaning with degreasing.",
    includes: ["Slab & sink degreasing", "Tile wipe-down", "Cabinet fronts"],
    excludes: ["Inside cabinet unloading", "Chimney dismantling", "Appliance repair"],
    active: true,
  },
  {
    id: "maint-1bhk",
    category: "packages",
    name: "1 BHK Maintenance Cleaning",
    price: 899,
    priceMax: 1099,
    durationMins: 180,
    blurb: "Regular upkeep clean for a 1 BHK — rooms, kitchen, bathroom, balcony.",
    includes: ["Sweeping & mopping", "Kitchen surface clean", "1 bathroom clean"],
    active: true,
  },
  {
    id: "monthly-2visit",
    category: "packages",
    name: "Monthly Plan - 2 Visits",
    price: 1699,
    durationMins: 360,
    blurb: "Two scheduled maintenance visits a month at a discounted rate.",
    includes: ["2 visits per month", "Same trained crew", "Priority slots"],
    active: true,
  },
  {
    id: "deep-1bhk",
    category: "packages",
    name: "1 BHK Deep Home Cleaning",
    price: 1500,
    durationMins: 240,
    blurb: "Full 1 BHK scrub — kitchen, bathroom, floors and balconies.",
    includes: ["Machine scrubbing", "Kitchen degreasing", "Bathroom descaling"],
    active: true,
  },
  {
    id: "deep-2bhk",
    category: "packages",
    name: "2 BHK Deep Home Cleaning",
    price: 2299,
    durationMins: 300,
    blurb: "Team of 3 for a complete 2 BHK deep clean.",
    includes: ["3-member crew", "All rooms & balconies", "2 bathrooms included"],
    active: true,
  },
  {
    id: "deep-3bhk",
    category: "packages",
    name: "3 BHK Deep Home Cleaning",
    price: 3199,
    durationMins: 360,
    blurb: "Large-home deep clean with machine scrubbing throughout.",
    includes: ["4-member crew", "All rooms & balconies", "3 bathrooms included"],
    active: true,
  },
  {
    id: "chimney",
    category: "addons",
    name: "Kitchen Chimney & Degreasing",
    price: 599,
    durationMins: 90,
    blurb: "Chimney filter degreasing plus cabinet and slab shine.",
    includes: ["Filter degreasing", "Slab & cabinet wipe", "Odour treatment"],
    active: true,
  },
  {
    id: "tank",
    category: "addons",
    name: "Water Tank Cleaning",
    price: 699,
    durationMins: 120,
    blurb: "Overhead or underground tank de-sludging and sanitisation.",
    includes: ["De-sludging", "Anti-bacterial wash", "Safe drainage"],
    active: true,
  },
  {
    id: "sofa",
    category: "addons",
    name: "Sofa Shampooing (3-Seater)",
    price: 699,
    durationMins: 90,
    blurb: "Foam extraction shampooing for fabric sofas.",
    includes: ["Foam extraction", "Stain treatment", "Quick-dry finish"],
    active: true,
  },
];

export type AreaConfig = { name: string; pincode: string; servicing: boolean };

export const DEFAULT_AREAS: AreaConfig[] = [
  { name: "MP Nagar", pincode: "462011", servicing: true },
  { name: "Arera Colony", pincode: "462016", servicing: true },
  { name: "Gulmohar", pincode: "462039", servicing: true },
  { name: "Kolar Road", pincode: "462042", servicing: true },
  { name: "Indrapuri", pincode: "462022", servicing: true },
  { name: "Shahpura", pincode: "462039", servicing: true },
  { name: "Ayodhya Bypass", pincode: "462041", servicing: true },
  { name: "Hoshangabad Road", pincode: "462026", servicing: true },
  { name: "Bairagarh", pincode: "462030", servicing: true },
  { name: "Old City", pincode: "462001", servicing: true },
];

export type Employee = {
  id: string;
  name: string;
  phone: string;
  area: string;
  onDuty: boolean;
  jobsToday: number;
  payoutBalance: number;
};

export const DEFAULT_EMPLOYEES: Employee[] = [
  { id: "EMP01", name: "Priya Sahu", phone: "9876543211", area: "MP Nagar", onDuty: true, jobsToday: 0, payoutBalance: 1240 },
  { id: "EMP02", name: "Rakesh Yadav", phone: "9876543212", area: "Kolar Road", onDuty: true, jobsToday: 0, payoutBalance: 980 },
  { id: "EMP03", name: "Sunita Verma", phone: "9876543213", area: "Arera Colony", onDuty: true, jobsToday: 0, payoutBalance: 1610 },
  { id: "EMP04", name: "Imran Khan", phone: "9876543214", area: "Ayodhya Bypass", onDuty: false, jobsToday: 0, payoutBalance: 720 },
];

export const TIME_SLOTS = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM",
];

export const WHATSAPP_NUMBER = "919876543210";
export const UPI_VPA = "sparklehome@ybl";
export const BRAND = "SparkleHome Bhopal";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "assigned"
  | "on_the_way"
  | "in_progress"
  | "completed";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Awaiting Payment",
  paid: "Payment Confirmed",
  assigned: "Cleaner Assigned",
  on_the_way: "On the Way",
  in_progress: "Work in Progress",
  completed: "Completed",
};

export const STATUS_FLOW: OrderStatus[] = [
  "paid",
  "assigned",
  "on_the_way",
  "in_progress",
  "completed",
];

export type Order = {
  id: string;
  serviceId: string;
  serviceName: string;
  durationMins: number;
  amount: number;
  date: string;
  slot: string;
  street: string;
  area: string;
  pincode: string;
  mobile: string;
  customerName: string;
  whatsapp?: string;
  society?: string;
  floor?: string;
  lift?: boolean;
  notes?: string;
  status: OrderStatus;
  employeeId?: string;
  paidAt: number;
  startedAt?: number;
  completedAt?: number;
  proofPhoto?: string;
  upiRef: string;
};

export type OpsState = {
  services: Service[];
  areas: AreaConfig[];
  employees: Employee[];
  orders: Record<string, Order>;
};

export function buildUpiUri(
  order: { id: string; amount: number },
  app?: "phonepe" | "gpay" | "paytm",
) {
  const params = new URLSearchParams({
    pa: UPI_VPA,
    pn: BRAND,
    am: String(order.amount),
    cu: "INR",
    tn: `Booking ${order.id}`,
    tr: order.id,
  });
  const query = params.toString();
  if (app === "phonepe") return `phonepe://pay?${query}`;
  if (app === "gpay") return `tez://upi/pay?${query}`;
  if (app === "paytm") return `paytmmp://pay?${query}`;
  return `upi://pay?${query}`;
}

export function newOrderId() {
  return "SH" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function mapsLink(order: Order) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${order.street}, ${order.area}, Bhopal ${order.pincode}`,
  )}`;
}

export function inr(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function bookingWhatsAppMessage(order: Order) {
  return [
    `Booking ID: ${order.id}`,
    `Name: ${order.customerName}`,
    `Mobile: ${order.mobile}`,
    order.whatsapp ? `WhatsApp: ${order.whatsapp}` : "",
    `Service: ${order.serviceName} (${inr(order.amount)})`,
    `Date & slot: ${order.date}, ${order.slot}`,
    `Address: ${order.street}${order.society ? ", " + order.society : ""}, ${order.area}, Bhopal ${order.pincode}`,
    order.floor ? `Floor: ${order.floor}${order.lift ? " (lift available)" : " (no lift)"}` : "",
    order.notes ? `Notes: ${order.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
