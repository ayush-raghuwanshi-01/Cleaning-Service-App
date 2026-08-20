import svcHousekeeping from "@/assets/svc-housekeeping.jpg";
import svcDeep from "@/assets/svc-deep.jpg";
import svcBathroom from "@/assets/svc-bathroom.jpg";
import svcKitchen from "@/assets/svc-kitchen.jpg";
import svcCarwash from "@/assets/svc-carwash.jpg";

export { svcHousekeeping, svcDeep, svcBathroom, svcKitchen, svcCarwash };

/** Pick a representative image for a service based on its id. */
export function serviceImage(id: string): string {
  if (id.includes("bathroom")) return svcBathroom;
  if (id.includes("kitchen") || id.includes("chimney")) return svcKitchen;
  if (id.includes("car")) return svcCarwash;
  if (id.includes("deep") || id.includes("maint") || id.includes("monthly") || id.includes("tank") || id.includes("sofa"))
    return svcDeep;
  return svcHousekeeping;
}