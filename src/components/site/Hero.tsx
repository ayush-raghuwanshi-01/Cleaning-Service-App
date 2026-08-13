import { Clock, ShieldCheck, Star, MapPin } from "lucide-react";
import heroImg from "@/assets/hero-cleaner.jpg";
import { WhatsAppButton } from "./WhatsAppButton";

export function Hero() {
  return (
    <section className="bg-[image:var(--gradient-hero)]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-primary">
            <MapPin className="h-3.5 w-3.5" /> Serving all of Bhopal
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] md:text-5xl">
            Professional 2-Hour Home Cleaning at{" "}
            <span className="text-primary">₹399</span> in Bhopal
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground">
            Verified, trained staff at your door with their own supplies. Pay securely by UPI and
            track your cleaner live — from assignment to the final sparkle.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#book"
              className="rounded-full bg-[image:var(--gradient-cta)] px-6 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-float)] transition-transform hover:-translate-y-0.5"
            >
              Book for ₹399
            </a>
            <WhatsAppButton />
          </div>
          <dl className="mt-8 grid max-w-md grid-cols-3 gap-3">
            {[
              { icon: Star, label: "4.9 / 5", sub: "2,400+ ratings" },
              { icon: Clock, label: "2 hours", sub: "Fixed duration" },
              { icon: ShieldCheck, label: "Verified", sub: "Police-checked" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="rounded-2xl bg-background/75 p-3">
                <Icon className="h-4 w-4 text-accent" />
                <dt className="mt-2 text-sm font-bold">{label}</dt>
                <dd className="text-[11px] text-muted-foreground">{sub}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative">
          <img
            src={heroImg}
            alt="Trained SparkleHome cleaner in uniform cleaning a Bhopal living room"
            width={1200}
            height={1200}
            className="w-full rounded-[2rem] object-cover shadow-[var(--shadow-float)]"
          />
          <div className="absolute -bottom-4 left-4 rounded-2xl bg-background px-4 py-3 shadow-[var(--shadow-card)]">
            <p className="text-xs text-muted-foreground">Next available slot</p>
            <p className="text-sm font-bold text-primary">Today, 04:00 PM - 06:00 PM</p>
          </div>
        </div>
      </div>
    </section>
  );
}
