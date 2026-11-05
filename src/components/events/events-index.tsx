"use client";

import { EventBoard } from "@/components/events/event-board";
import type { CulturalEvent } from "@/content/types";

export function EventsIndex({ posted = [] }: { posted?: CulturalEvent[] }) {
  return <EventBoard posted={posted} />;
}
