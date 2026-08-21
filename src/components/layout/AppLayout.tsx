import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingContact } from "@/components/FloatingContact";

interface AppLayoutProps {
  children: ReactNode;
}

/** Standard public page shell: header, centered content, floating CTA, footer. */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <FloatingContact />
      <Footer />
    </div>
  );
}

/** Wider shell for marketing/home pages. */
export function FullBleedLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <FloatingContact />
      <Footer />
    </div>
  );
}
