import { useState } from "react";
import { MessageCircle, Phone, X } from "lucide-react";
import { SUPPORT_PHONE, WHATSAPP_NUMBER, formatPhone, BRAND_CITY } from "@/lib/config";

/**
 * Floating contact dock — always-visible Call + WhatsApp CTAs (mobile-first).
 * WhatsApp deep-link pre-fills a booking enquiry so the customer doesn't
 * have to type anything.
 */
export function FloatingContact() {
  const [open, setOpen] = useState(false);

  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi! I'd like to book a home cleaning service in ${BRAND_CITY}.`,
  )}`;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 no-print">
      {open && (
        <div className="flex flex-col gap-2 animate-fade-up">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-full border border-border bg-card py-2.5 pl-3 pr-4 text-sm font-bold shadow-lift"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-whatsapp text-white">
              <MessageCircle className="h-5 w-5" />
            </span>
            WhatsApp us
          </a>
          <a
            href={`tel:+${SUPPORT_PHONE}`}
            className="flex items-center gap-3 rounded-full border border-border bg-card py-2.5 pl-3 pr-4 text-sm font-bold shadow-lift"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <Phone className="h-5 w-5" />
            </span>
            {formatPhone(SUPPORT_PHONE)}
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close contact options" : "Open contact options"}
        aria-expanded={open}
        className={`grid h-14 w-14 place-items-center rounded-full text-white shadow-lift transition-transform hover:scale-105 active:scale-95 ${
          open ? "bg-foreground" : "bg-whatsapp"
        }`}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </div>
  );
}
