import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import beforeImg from "@/assets/before-kitchen.jpg";
import afterImg from "@/assets/after-kitchen.jpg";

/**
 * Before/after showcase. The slider uses a native range input — no JS
 * libraries, works with touch and keyboard, and degrades to a static
 * side-by-side on very small screens.
 */
export function BeforeAfter() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  function onSlide() {
    const wrap = wrapRef.current;
    const slider = sliderRef.current;
    if (!wrap || !slider) return;
    wrap.style.setProperty("--pos", `${slider.value}%`);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Real results
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
            Drag to see the difference
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A kitchen deep clean in Bhopal — grease, hard stains and scaling
            removed with professional-grade supplies and machines. The same
            standard is applied to bathrooms, floors, sofas and cars.
          </p>
          <Link
            to="/"
            search={{ service: undefined, book: true }}
            hash="book"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            Book your clean <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative">
          <div
            ref={wrapRef}
            style={{ ["--pos" as string]: "50%" }}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border shadow-lift"
          >
            {/* After (base layer) */}
            <img
              src={afterImg}
              alt="Kitchen after professional deep cleaning"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Before (clipped overlay) */}
            <img
              src={beforeImg}
              alt="Kitchen before cleaning"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ clipPath: "inset(0 var(--pos) 0 0)" }}
            />
            {/* Divider handle */}
            <div
              className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90 shadow"
              style={{ left: "var(--pos)" }}
            >
              <span className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-white/30 text-xs font-bold text-white backdrop-blur">
                ↔
              </span>
            </div>
            <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white">
              Before
            </span>
            <span className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-foreground">
              After
            </span>
          </div>

          {/* Accessible slider control */}
          <input
            ref={sliderRef}
            type="range"
            min={0}
            max={100}
            defaultValue={50}
            onInput={onSlide}
            aria-label="Reveal before and after cleaning comparison"
            className="mt-4 w-full accent-primary"
          />
        </div>
      </div>
    </section>
  );
}
