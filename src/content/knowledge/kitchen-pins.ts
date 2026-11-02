export type KitchenPin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  scope: "centar" | "nearby";
  osm: string;
  area?: "old-bazaar" | "debar-maalo" | "macedonia-square";
};

/**
 * Traditional kitchens from OpenStreetMap (ODbL), Nominatim search on 2 Nov 2026.
 * Kept when the place is a restaurant inside Centar, or in the Old Bazaar just outside,
 * and the name or cuisine is a kafana, gostilnica, grill, kebab, or Balkan kitchen.
 * Not a complete census. Several doors share the name Destan, so none is the house-page pin.
 */
export const kitchenPins: KitchenPin[] = [
  { id: "osm-node-5131832941", name: "7 Скара Ресторан", lat: 41.9948346, lng: 21.4277128, scope: "centar", osm: "node/5131832941" },
  { id: "osm-node-3505013893", name: "Destan", lat: 41.9947506, lng: 21.4319604, scope: "centar", osm: "node/3505013893", area: "macedonia-square" },
  { id: "osm-node-4436534289", name: "Destan", lat: 41.9996838, lng: 21.4361511, scope: "nearby", osm: "node/4436534289", area: "old-bazaar" },
  { id: "osm-node-5692608680", name: "Gostilnica Estel", lat: 41.9990664, lng: 21.4236496, scope: "centar", osm: "node/5692608680" },
  { id: "osm-node-5224224121", name: "Gostilnica Gurman", lat: 41.9916485, lng: 21.4223088, scope: "centar", osm: "node/5224224121" },
  { id: "osm-node-1748017584", name: "Marana", lat: 41.9904847, lng: 21.4204907, scope: "centar", osm: "node/1748017584" },
  { id: "osm-way-332382509", name: "Od Nas Za Vas", lat: 41.9891202, lng: 21.4296273, scope: "centar", osm: "way/332382509" },
  { id: "osm-node-6814236621", name: "Palas", lat: 42.002112, lng: 21.4385882, scope: "nearby", osm: "node/6814236621" },
  { id: "osm-node-10822535624", name: "Restaurant Gostilnica Vezenka", lat: 41.9945336, lng: 21.4282667, scope: "centar", osm: "node/10822535624" },
  { id: "osm-node-6102488864", name: "Restoran Frosina", lat: 41.9959518, lng: 21.4199442, scope: "centar", osm: "node/6102488864" },
  { id: "osm-node-12070680123", name: "Алтан", lat: 41.9925181, lng: 21.4168502, scope: "centar", osm: "node/12070680123" },
  { id: "osm-way-357827839", name: "Гостилница Дукат", lat: 41.994832, lng: 21.4129964, scope: "centar", osm: "way/357827839" },
  { id: "osm-node-5626432520", name: "Градска Кафеана „Идадија“", lat: 42.0013821, lng: 21.4210713, scope: "centar", osm: "node/5626432520" },
  { id: "osm-way-1566629304", name: "Дестан", lat: 42.0037051, lng: 21.4259668, scope: "centar", osm: "way/1566629304", area: "debar-maalo" },
  { id: "osm-node-1868812117", name: "Дестан", lat: 41.9987513, lng: 21.4204158, scope: "centar", osm: "node/1868812117", area: "debar-maalo" },
  { id: "osm-node-5813417254", name: "Кафана „Дебар Маало“", lat: 42.000778, lng: 21.4201149, scope: "centar", osm: "node/5813417254" },
  { id: "osm-way-1366553426", name: "Кај Жабар", lat: 42.0013841, lng: 21.4287406, scope: "centar", osm: "way/1366553426" },
  { id: "osm-node-1747649203", name: "Крчма", lat: 41.9946274, lng: 21.4151525, scope: "centar", osm: "node/1747649203" },
  { id: "osm-node-5624670966", name: "МЦМ Мезе Бар", lat: 42.0023813, lng: 21.4235595, scope: "centar", osm: "node/5624670966" },
  { id: "osm-node-309894643", name: "Пелистер", lat: 41.9953401, lng: 21.4314898, scope: "centar", osm: "node/309894643" },
  { id: "osm-node-3101726040", name: "Пивница АН", lat: 42.0000179, lng: 21.4366005, scope: "nearby", osm: "node/3101726040" },
  { id: "osm-way-176159879", name: "Стара куќа", lat: 41.9968368, lng: 21.4384354, scope: "centar", osm: "way/176159879" },
  { id: "osm-way-477026724", name: "Чардак", lat: 42.0020432, lng: 21.4221788, scope: "centar", osm: "way/477026724" },
];
