import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/booking";

export function StickyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-2 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
      <a
        href="#book"
        className="grid h-12 flex-1 place-items-center rounded-2xl bg-[image:var(--gradient-cta)] text-sm font-bold text-primary-foreground shadow-[var(--shadow-float)]"
      >
        Book Cleaning @ ₹399
      </a>
    </div>
  );
}
