import beforeImg from "@/assets/before-kitchen.jpg";
import afterImg from "@/assets/after-kitchen.jpg";

export function BeforeAfter() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Before & after, from real bookings</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Kitchen deep clean in Shahpura, completed in one visit.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <figure className="overflow-hidden rounded-2xl border border-border">
          <img src={beforeImg} alt="Dirty cluttered kitchen before SparkleHome cleaning" className="h-64 w-full object-cover" />
          <figcaption className="bg-secondary/60 px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Before
          </figcaption>
        </figure>
        <figure className="overflow-hidden rounded-2xl border border-border">
          <img src={afterImg} alt="Sparkling clean kitchen after SparkleHome cleaning" className="h-64 w-full object-cover" />
          <figcaption className="bg-accent-soft px-4 py-2 text-xs font-bold uppercase tracking-wide text-accent">
            After
          </figcaption>
        </figure>
      </div>
    </section>
  );
}