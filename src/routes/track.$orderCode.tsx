import { createFileRoute } from "@tanstack/react-router";
import { TrackPage } from "@/components/track/TrackPage";

export const Route = createFileRoute("/track/$orderCode")({
  component: function TrackWithCode() {
    const { orderCode } = Route.useParams();
    return <TrackPage initialCode={orderCode} />;
  },
});
