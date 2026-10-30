import { L } from "@/content/copy";
import { getSite } from "@/content/knowledge/catalog";
import { routes } from "@/content/knowledge/programmes";
import {
  approximateWalkMeters,
  approximateWalkMinutes,
} from "@/lib/mapping/walk";
import {
  bestEdge,
  coordinatesOf,
  historicalEdgesFor,
  sitesByTheme,
} from "@/lib/graph/query";
import { explainLegs } from "@/lib/graph/query";
import { openingFor } from "@/lib/itinerary/hours";
import { nearestNeighborOrder, nearestSlug } from "@/lib/itinerary/order";
import type { ItineraryInput, ItineraryPlan, ItineraryStop } from "@/lib/itinerary/types";

function routeStopsForTheme(themeId: string): string[] {
  const slugs = new Set<string>();
  for (const route of routes) {
    if (route.theme === themeId || route.slug === themeId) {
      for (const stop of route.stops) slugs.add(stop);
    }
  }
  return [...slugs];
}

function candidatePool(themeId: string, start: string): string[] {
  const pool = new Set<string>([start, ...sitesByTheme(themeId), ...routeStopsForTheme(themeId)]);
  for (const slug of [...pool]) {
    for (const edge of historicalEdgesFor(slug)) {
      if (edge.themeIds.includes(themeId) || edge.historical) {
        pool.add(edge.from);
        pool.add(edge.to);
      }
    }
  }
  return [...pool].filter((slug) => {
    const site = getSite(slug);
    if (!site) return false;
    if (!Number.isFinite(site.coordinates.lat)) return false;
    return true;
  });
}

function scoreSlug(slug: string, themeId: string, start: string) {
  let score = 0;
  if (sitesByTheme(themeId).includes(slug)) score += 6;
  if (routeStopsForTheme(themeId).includes(slug)) score += 4;
  const link = bestEdge(start, slug);
  if (link?.historical) score += 5;
  if (link && !link.historical) score += 1;
  const hist = historicalEdgesFor(slug).filter((edge) => edge.themeIds.includes(themeId));
  score += hist.length * 2;
  return score;
}

function trimToBudget(ordered: string[], budget: ItineraryInput["budget"]): string[] {
  if (budget.mode === "stops") return ordered.slice(0, budget.count);
  const cap = budget.minutes;
  const kept = ordered.slice(0, 2);
  for (const slug of ordered.slice(2)) {
    const next = [...kept, slug];
    const points = next.map((item) => coordinatesOf(item)).filter((item) => item !== undefined);
    const minutes = approximateWalkMinutes(approximateWalkMeters(points));
    if (minutes > cap && kept.length >= 2) break;
    kept.push(slug);
  }
  return kept;
}

export function planItinerary(input: ItineraryInput): ItineraryPlan {
  const today = input.today ?? new Date();
  const warnings: ItineraryPlan["warnings"] = [];
  let startSlug = "macedonia-square";
  let startSource: ItineraryPlan["startSource"] = "fallback-square";

  if (input.start.kind === "site") {
    const site = getSite(input.start.slug);
    if (site && Number.isFinite(site.coordinates.lat)) {
      startSlug = site.slug;
      startSource = "site";
    } else {
      warnings.push(
        L(
          "The chosen start has no verified coordinates. The route starts at Macedonia Square.",
          "Избраниот старт нема потврдени координати. Маршрутата почнува на плоштадот Македонија.",
          "Izabrani start nema potvrđene koordinate. Ruta počinje na trgu Makedonija.",
          "Seçilen başlangıcın doğrulanmış koordinatı yok. Güzergâh Makedonya Meydanı’nda başlar.",
          "Вибраний старт не має підтверджених координат. Маршрут починається на площі Македонія.",
         "Nisja e zgjedhur nuk ka koordinata të verifikuara. Rruga nis te Sheshi i Maqedonisë."),
      );
    }
  } else {
    const mapped = candidatePool(input.themeId, "macedonia-square");
    const near = nearestSlug({ lat: input.start.lat, lng: input.start.lng }, mapped, 800);
    if (near) {
      startSlug = near;
      startSource = "gps";
    } else {
      warnings.push(
        L(
          "Your position is outside the mapped walking area of Centar. The route starts at Macedonia Square.",
          "Вашата положба е надвор од картографираната пешачка зона на Центар. Маршрутата почнува на плоштадот Македонија.",
          "Vaš položaj je van kartografisane pešačke zone Centra. Ruta počinje na trgu Makedonija.",
          "Konumunuz Centar’ın haritalanmış yürüme alanının dışında. Güzergâh Makedonya Meydanı’nda başlar.",
          "Ваша позиція поза картографованою пішохідною зоною Центру. Маршрут починається на площі Македонія.",
         "Pozicioni juaj është jashtë zonës së hartuar të ecjes në Qendër. Rruga nis te Sheshi i Maqedonisë."),
      );
    }
  }

  const pool = candidatePool(input.themeId, startSlug);
  const ranked = pool
    .filter((slug) => slug !== startSlug)
    .sort((a, b) => scoreSlug(b, input.themeId, startSlug) - scoreSlug(a, input.themeId, startSlug));
  const themed = ranked.filter((slug) => scoreSlug(slug, input.themeId, startSlug) > 0);
  const usable = themed.length ? themed : ranked;
  const monuments = usable.filter((slug) => getSite(slug)?.kinds.includes("monument"));
  const drawn = input.shuffle
    ? shuffleSlugs(monuments.length >= 4 ? monuments : usable).slice(0, 12)
    : usable;
  const ordered = nearestNeighborOrder(startSlug, [startSlug, ...drawn]);
  const trimmed = trimToBudget(ordered, input.budget);
  const unique = trimmed.filter((slug, index) => trimmed.indexOf(slug) === index);

  const stops: ItineraryStop[] = unique.map((slug) => {
    const hours = openingFor(slug, today);
    return { slug, likelyClosedToday: hours.likelyClosedToday, openingNote: hours.openingNote };
  });

  if (stops.some((stop) => stop.likelyClosedToday)) {
    warnings.push(
      L(
        "At least one stop prints today as closed. Confirm hours at the door before you walk.",
        "Барем една постојка печати денес како затворена. Потврдете часови на врата пред да одите.",
        "Bar bar jedno stajalište štampa danas kao zatvoreno. Potvrdite sate na vratima pre hodanja.",
        "En az bir durak bugünü kapalı basıyor. Yürümeden önce saatleri kapıda doğrulayın.",
        "Принаймні одна зупинка друкує сьогодні як зачинену. Перед ходою підтвердьте години на дверях.",
       "Të paktën një ndalesë e shtyp të sotmen si të mbyllur. Konfirmoni orarin te dera para se të ecni."),
    );
  }

  const points = unique.map((slug) => coordinatesOf(slug)).filter((item) => item !== undefined);
  const estimatedMeters = approximateWalkMeters(points);
  const estimatedMinutes = approximateWalkMinutes(estimatedMeters);

  return {
    themeId: input.themeId,
    startSlug,
    startSource,
    stops,
    legs: explainLegs(unique),
    estimatedMeters,
    estimatedMinutes,
    warnings,
  };
}

function shuffleSlugs(slugs: string[]) {
  const copy = [...slugs];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap] ?? current;
    copy[swap] = current ?? copy[swap];
  }
  return copy;
}

export function reorderStops(slugs: string[]): ItineraryPlan["legs"] {
  return explainLegs(slugs);
}
