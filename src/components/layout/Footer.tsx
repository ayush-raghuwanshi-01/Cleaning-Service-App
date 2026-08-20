import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { BRAND_CITY, BRAND_NAME, FALLBACK_SERVICE_AREAS } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-bold">{BRAND_NAME}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Home cleaning services with clear scope, clear pricing and order tracking.
            Final work details are confirmed before service.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold">Quick links</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/services" className="hover:text-foreground">Services</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
            <li><Link to="/help" className="hover:text-foreground">Help & FAQs</Link></li>
            <li><Link to="/" search={{ service: undefined, book: undefined }} className="hover:text-foreground">Book a clean</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold">Service areas</h4>
          <p className="mt-3 text-sm text-muted-foreground">
            {FALLBACK_SERVICE_AREAS.length ? FALLBACK_SERVICE_AREAS.join(" · ") : `Configured service areas in ${BRAND_CITY}`}
          </p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {BRAND_NAME}{BRAND_CITY ? ` ${BRAND_CITY}` : ""}. All rights reserved.
      </div>
    </footer>
  );
}
