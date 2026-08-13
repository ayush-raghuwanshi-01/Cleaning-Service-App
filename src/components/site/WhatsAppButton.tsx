import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/booking";

export function WhatsAppButton({ text = "Chat on WhatsApp" }: { text?: string }) {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi! I want to book a 2-hour home cleaning at ₹399 in Bhopal.",
  )}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
    >
      <MessageCircle className="h-4 w-4 shrink-0" />
      {text}
    </a>
  );
}