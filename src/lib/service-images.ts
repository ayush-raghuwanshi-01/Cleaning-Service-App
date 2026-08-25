import svcHousekeeping from "@/assets/svc-housekeeping.jpg";
import svcDeep from "@/assets/svc-deep.jpg";
import svcBathroom from "@/assets/svc-bathroom.jpg";
import svcKitchen from "@/assets/svc-kitchen.jpg";
import svcCarwash from "@/assets/svc-carwash.jpg";

export { svcHousekeeping, svcDeep, svcBathroom, svcKitchen, svcCarwash };

/**
 * Pick a representative photo for a service. Catalog items come from the API,
 * so match on the human-readable name first (stable, editable in admin) and
 * fall back to the id — which may or may not contain hints once the catalog
 * is edited, so the housekeeping photo is the final default.
 */
export function serviceImage(id: string, name = ""): string {
  const key = `${name} ${id}`.toLowerCase();
  if (/(bathroom|toilet|washroom)/.test(key)) return svcBathroom;
  if (/(kitchen|chimney|hub|grease)/.test(key)) return svcKitchen;
  if (/(car|vehicle|bike)/.test(key)) return svcCarwash;
  if (/(deep|maint|monthly|tank|sofa|carpet|curtain|pest|sanitiz|disinfect)/.test(key)) {
    return svcDeep;
  }
  if (/(housekeep|housekeeping|maid|helper|regular|express|home)/.test(key)) {
    return svcHousekeeping;
  }
  return svcHousekeeping;
}
