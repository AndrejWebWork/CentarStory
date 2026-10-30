export const destinations = [
  { href: "/", id: "explore" },
  { href: "/scan", id: "scan", emphasis: true },
  { href: "/museums", id: "museums" },
  { href: "/food", id: "food" },
  { href: "/around", id: "around" },
] as const;

export type DestinationId = (typeof destinations)[number]["id"];

export const mobileDestinations = [
  destinations[0],
  destinations[2],
  destinations[1],
  destinations[3],
  destinations[4],
];

export function activeDestination(pathname: string): DestinationId | null {
  if (pathname.startsWith("/scan")) return "scan";
  if (pathname.startsWith("/museums") || pathname.startsWith("/events")) return "museums";
  if (pathname.startsWith("/food")) return "food";
  if (pathname.startsWith("/around")) return "around";
  if (pathname === "/" || pathname.startsWith("/places") || pathname.startsWith("/routes")) {
    return "explore";
  }
  return null;
}
