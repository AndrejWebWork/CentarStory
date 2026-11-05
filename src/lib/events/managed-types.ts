export type ManagedEvent = {
  slug: string;
  name: string;
  summary: string;
  story: string;
  season: string;
  startDate: string;
  endDate: string;
  officialUrl: string;
  links: { label: string; url: string }[];
  imageUrl: string;
  placeLabel: string;
  updatedAt: string;
};
