import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/config";

export function StickyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2 px-4 py-3">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I want to book a home cleaning in Bhopal.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-accent/10 px-4 py-2.5 text-sm font-bold text-accent"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <Link
          to="/"
          search={{ service: undefined, book: true }}
          hash="book"
          className="inline-flex items-center justify-center rounded-full bg-[image:var(--gradient-cta)] px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-card)]"
        >
          Book ₹399
        </Link>
      </div>
    </div>
  );
}