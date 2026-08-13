import { Link } from "@tanstack/react-router";
import { DEFAULT_AREAS } from "@/lib/booking";
import { WhatsAppButton } from "./WhatsAppButton";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/40 pb-28 md:pb-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold">SparkleHome Bhopal</h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Verified, background-checked cleaning professionals serving Bhopal homes since 2019.
          </p>
          <div className="mt-4">
            <WhatsAppButton text="WhatsApp support" />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Areas we serve
          </h4>
          <ul className="mt-3 grid grid-cols-2 gap-1 text-sm">
            {DEFAULT_AREAS.map((a) => (
              <li key={a.name} className="text-foreground/80">
                {a.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Support
          </h4>
          <ul className="mt-3 space-y-1 text-sm text-foreground/80">
            <li>
              <Link to="/services" className="hover:text-primary">
                All services
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-primary">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/help" className="hover:text-primary">
                Help & FAQs
              </Link>
            </li>
            <li>Mon-Sun, 7 AM - 9 PM</li>
            <li>+91 98765 43210</li>
            <li>hello@sparklehome.in</li>
            <li>MP Nagar Zone II, Bhopal 462011</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-border/70 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SparkleHome Bhopal. Transparent pricing, no hidden charges.
      </p>
    </footer>
  );
}
