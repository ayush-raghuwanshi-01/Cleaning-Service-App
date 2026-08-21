import { createFileRoute } from "@tanstack/react-router";
import { TrackPage } from "@/components/track/TrackPage";
import { BRAND_CITY, BRAND_NAME } from "@/lib/config";

export const Route = createFileRoute("/track/")({
  head: () => ({
    meta: [
      { title: `Track Your Booking — ${BRAND_NAME} ${BRAND_CITY}` },
      {
        name: "description",
        content: "Track your Home Shine cleaning booking status with your booking code.",
      },
    ],
  }),
  component: () => <TrackPage />,
});
