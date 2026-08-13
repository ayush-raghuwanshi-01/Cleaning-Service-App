import beforeImg from "@/assets/before-kitchen.jpg";
import afterImg from "@/assets/after-kitchen.jpg";

export function BeforeAfter() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-2xl font-bold md:text-3xl">Before &amp; after, from real bookings</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Kitchen deep clean in Shahpura, completed in one visit.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          { src: beforeImg, label: "Before", alt: "Dirty cluttered kitchen before SparkleHome cleaning" },
          { src: afterImg, label: "After", alt: "Sparkling clean kitchen after SparkleHome cleaning" },
        ].map((img) => (
          <figure key={img.label} className="relative overflow-hidden rounded-2xl border border-border">
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              width={900}
              height={700}
              className="aspect-[9/7] w-full object-cover"
            />
            <figcaption className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-bold">
              {img.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
