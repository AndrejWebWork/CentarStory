/**
 * Structured audit of the OpenStreetMap Overpass municipal monument extract
 * (OSM relation 2439777, Municipality of Centar, Skopje):
 * - Duplicate / composite OSM nodes consolidated into single canonical records.
 * - Unresolved OSM candidate pins inside Centar whose subject/classification is incomplete.
 * - Boundary-excluded OSM monument pins falling outside the Centar polygon (e.g. Čair / Karpoš).
 */

export type DuplicateAuditEntry = {
  canonicalSlug: string;
  primaryOsmId: string;
  mergedOsmId: string;
  reason: string;
};

export type UnresolvedOsmCandidate = {
  osmId: string;
  coordinates: { lat: number; lng: number };
  rawName: string;
  tags: string;
  reasonUnresolved: string;
};

export type BoundaryExcludedMonument = {
  osmId: string;
  name: string;
  coordinates: { lat: number; lng: number };
  neighborMunicipality: string;
  reason: string;
};

export const DUPLICATE_MONUMENT_REPORT: DuplicateAuditEntry[] = [
  {
    canonicalSlug: "macedonia-square",
    primaryOsmId: "way/macedonia-square",
    mergedOsmId: "node/908273421",
    reason: "Equestrian Warrior ('Воин на коњ', Valentina Stevanovska, 2011) is the central fountain monument documented inside the Macedonia Square record.",
  },
  {
    canonicalSlug: "porta-macedonia",
    primaryOsmId: "way/239422349",
    mergedOsmId: "way/239422349",
    reason: "Overpass returned `way/239422349` (`historic=monument`, `name=Порта Македонија`), matching the existing canonical `porta-macedonia` record.",
  },
  {
    canonicalSlug: "fallen-heroes-monument",
    primaryOsmId: "node/9121296388",
    mergedOsmId: "node/4183631289",
    reason: "`node/4183631289` ('Прометеј / Prometheus') tags the central fountain statue of Tome Adžievski's 'Fallen Heroes for Macedonia' ensemble (`node/9121296388`).",
  },
  {
    canonicalSlug: "philip-ii-square-monument",
    primaryOsmId: "node/1859114111",
    mergedOsmId: "node/4161249330",
    reason: "`node/4161249330` ('Олимпија / Olympias') is the adjacent fountain ensemble on Karpoš's Rebellion Square belonging to the same 2012 complex as `node/1859114111`.",
  },
  {
    canonicalSlug: "dane-krapcev-bust",
    primaryOsmId: "node/8464321299",
    mergedOsmId: "node/9200216569",
    reason: "`node/8464321299` ('Дане Крапчев') and `node/9200216569` ('Dane kraptzew') are duplicate OSM nodes 35 m apart for the same partisan memorial bust.",
  },
  {
    canonicalSlug: "pere-tosev-monument",
    primaryOsmId: "node/11104116738",
    mergedOsmId: "node/11104116737",
    reason: "`node/11104116738` ('Споменик на Пере Тошев') and `node/11104116737` ('Пере Тошев') are two OSM nodes ~95 m apart in Pajko Maalo representing the same monument.",
  },
  {
    canonicalSlug: "goce-delcev-bridge-lions",
    primaryOsmId: "node/12529064217",
    mergedOsmId: "node/12529064218",
    reason: "Paired bronze lions on the southern (`node/12529064217`) and northern (`node/12529064218`) bridgeheads of Goce Delčev Bridge consolidated into one ensemble record.",
  },
  {
    canonicalSlug: "cathedral-clement",
    primaryOsmId: "way/cathedral-clement",
    mergedOsmId: "node/1866944575",
    reason: "`node/1866944575` ('Св. Климент Охридски') stands on the forecourt of the Cathedral of St. Clement of Ohrid.",
  },
  {
    canonicalSlug: "national-library-kliment",
    primaryOsmId: "way/national-library-kliment",
    mergedOsmId: "node/14232148801",
    reason: "`node/14232148801` ('Споменик на Св. Климент Охридски') stands at the entrance plaza of the National and University Library.",
  },
];

export const UNRESOLVED_OSM_CANDIDATES: UnresolvedOsmCandidate[] = [
  {
    osmId: "node/4271160712",
    coordinates: { lat: 41.9936684, lng: 21.4317487 },
    rawName: "Бегова кула / Bey's Tower",
    tags: "historic=monument, tourism=attraction",
    reasonUnresolved: "Late Ottoman feudal residential tower next to the Memorial House of Mother Teresa; architectural heritage building rather than a commemorative statue, awaiting UZKN conservation register extract.",
  },
  {
    osmId: "node/10913797907",
    coordinates: { lat: 41.9966814, lng: 21.4331314 },
    rawName: "Споменик Пливач (Swimmer)",
    tags: "tourism=artwork, artwork_type=statue",
    reasonUnresolved: "Decorative figure on the Vardar quay; excluded from confirmed historical monuments because it is a genre sculpture rather than a historical commemoration.",
  },
  {
    osmId: "node/10913830734",
    coordinates: { lat: 41.9952833, lng: 21.431175 },
    rawName: "Shoe Cleaner Statue (Чистач на чевли)",
    tags: "tourism=artwork, artwork_type=statue",
    reasonUnresolved: "2009 Ministry of Culture street genre sculpture on Makedonija Street; recorded as decorative public artwork rather than a historical monument.",
  },
  {
    osmId: "node/6821158694",
    coordinates: { lat: 41.9943288, lng: 21.4307922 },
    rawName: "2 musicians and one dancing man",
    tags: "historic=memorial, memorial=statue",
    reasonUnresolved: "Decorative street sculpture group on Makedonija Street mistagged as `historic=memorial` in OSM without a historical subject.",
  },
  {
    osmId: "node/5345636487",
    coordinates: { lat: 42.0053003, lng: 21.4223636 },
    rawName: "Школка / Shell",
    tags: "tourism=artwork",
    reasonUnresolved: "Open-air stage canopy ('Školka') in City Park, not a commemorative monument.",
  },
  {
    osmId: "node/6102488862",
    coordinates: { lat: 41.9941112, lng: 21.4340211 },
    rawName: "Градот убав / Street Art & Graffiti Gallery",
    tags: "tourism=artwork, artwork_type=graffiti, level=-1",
    reasonUnresolved: "Underground passage graffiti gallery at GTC, not a monument.",
  },
  {
    osmId: "node/5841719696",
    coordinates: { lat: 42.0011065, lng: 21.4344426 },
    rawName: "Unnamed cannon on Kale",
    tags: "historic=memorial, memorial=cannon",
    reasonUnresolved: "Unnamed artillery piece near Kale / Museum of Contemporary Art with no inscription or provenance in OSM.",
  },
  {
    osmId: "node/13306457968",
    coordinates: { lat: 41.9923254, lng: 21.4335525 },
    rawName: "Monument ('on the fasade of the building')",
    tags: "historic=monument, name=Monument",
    reasonUnresolved: "Generic OSM pin noting a facade relief/plaque without subject name or inscription.",
  },
  {
    osmId: "node/5324070425",
    coordinates: { lat: 42.0017162, lng: 21.4213151 },
    rawName: "Staute (sic)",
    tags: "tourism=artwork, name=Staute",
    reasonUnresolved: "Unnamed park statue pin in City Park with a typo (`Staute`) and no subject metadata.",
  },
  {
    osmId: "node/6054035627",
    coordinates: { lat: 41.9953188, lng: 21.4274744 },
    rawName: "Unnamed memorial node",
    tags: "historic=memorial",
    reasonUnresolved: "Bare `historic=memorial` node in Centar with no name, inscription, or Wikidata link.",
  },
  {
    osmId: "node/6054036213",
    coordinates: { lat: 41.9995885, lng: 21.4195816 },
    rawName: "Unnamed memorial node (Debar Maalo)",
    tags: "historic=memorial",
    reasonUnresolved: "Bare `historic=memorial` node in Debar Maalo with no name or inscription.",
  },
  {
    osmId: "node/6054049805",
    coordinates: { lat: 41.9959384, lng: 21.4331831 },
    rawName: "Unnamed statue on Vardar quay",
    tags: "historic=memorial, memorial=statue",
    reasonUnresolved: "Unnamed statue node on the right-bank Vardar quay with no subject tag.",
  },
];

export const BOUNDARY_EXCLUDED_MONUMENTS: BoundaryExcludedMonument[] = [
  {
    osmId: "node/1867151652",
    name: "Споменик на Скендербег (Skanderbeg Monument)",
    coordinates: { lat: 41.9993163, lng: 21.437162 },
    neighborMunicipality: "Čair (Општина Чаир)",
    reason: "Lies east of the Centar municipal boundary polygon at Skanderbeg Square in Čair (`pointInCentar = false`).",
  },
  {
    osmId: "node/4242928035",
    name: "Споменик на Тодор Александров",
    coordinates: { lat: 41.9834333, lng: 21.439106 },
    neighborMunicipality: "Kisela Voda (Општина Кисела Вода)",
    reason: "Lies south-east of the Centar polygon in Kisela Voda (`pointInCentar = false`).",
  },
  {
    osmId: "node/4380846206",
    name: "Споменик на Јуриј Гагарин (Yuri Gagarin Monument)",
    coordinates: { lat: 41.9949279, lng: 21.4108745 },
    neighborMunicipality: "Karpoš (Општина Карпош)",
    reason: "Lies west of the Centar boundary in Karpoš (`pointInCentar = false`).",
  },
  {
    osmId: "node/8507800396",
    name: "Биста на Христијан Тодоровски Карпош",
    coordinates: { lat: 42.0038675, lng: 21.4135021 },
    neighborMunicipality: "Karpoš (Општина Карпош)",
    reason: "Lies west of the Centar boundary in Karpoš (`pointInCentar = false`).",
  },
  {
    osmId: "node/12151684560",
    name: "Биста на Орце Николов",
    coordinates: { lat: 42.0062114, lng: 21.4131748 },
    neighborMunicipality: "Karpoš (Општина Карпош)",
    reason: "Lies in the western park/Karpoš sector outside OSM relation 2439777 (`pointInCentar = false`).",
  },
];
