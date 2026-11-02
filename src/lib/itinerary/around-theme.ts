import { L } from "@/content/copy";
import { sites } from "@/content/knowledge/catalog";
import { programmes } from "@/content/knowledge/programmes";
import type { Copy } from "@/content/types";
import { ITINERARY_THEMES } from "@/lib/itinerary/types";

const YEAR_IN_DATE = /(?:1[0-9]{3}|20[0-9]{2})/g;

function yearsIn(value: string | undefined) {
  if (!value) return [];
  return [...value.matchAll(YEAR_IN_DATE)].map((match) => Number(match[0]));
}

/** Years that appear on a monument date or a dated event in the atlas. */
export function documentedAtlasYears(): number[] {
  const found = new Set<number>();
  for (const site of sites) {
    for (const year of yearsIn(site.installationDate)) found.add(year);
    for (const milestone of site.milestones) {
      if (milestone.precision === "century") continue;
      for (const year of yearsIn(milestone.date)) found.add(year);
    }
  }
  for (const event of programmes) {
    for (const year of yearsIn(event.calendar.startDate)) found.add(year);
    for (const year of yearsIn(event.calendar.endDate)) found.add(year);
  }
  return [...found].sort((a, b) => a - b);
}

const DOCUMENTED_YEARS = new Set(documentedAtlasYears());
const YEAR_SPAN = documentedAtlasYears();

export const AROUND_YEAR_MIN = YEAR_SPAN[0] ?? 1910;
export const AROUND_YEAR_MAX = YEAR_SPAN[YEAR_SPAN.length - 1] ?? 2026;

const RANDOM_THEMES = ITINERARY_THEMES.map((item) => item.id).filter(
  (id) => id !== "person:stevanovska" && id !== "quay-museums" && id !== "civic-institutions",
);

export function aroundMonumentStarts(): string[] {
  return sites
    .filter(
      (site) =>
        site.kinds.includes("monument") &&
        site.municipality === "centar" &&
        Number.isFinite(site.coordinates.lat),
    )
    .map((site) => site.slug);
}

export function aroundThemeRandom(): AroundThemeChoice {
  const themeId = RANDOM_THEMES[Math.floor(Math.random() * RANDOM_THEMES.length)] ?? "civic-axis";
  return {
    themeId,
    note: L(
      "A fresh walk through documented monuments. Each tap draws a different sequence. A year from the atlas, if you choose one, is the only thing that locks the theme.",
      "Нова прошетка низ документирани споменици. Секое допирање влече друга низа. Година од атласот, ако изберете една, е единственото што ја заклучува темата.",
      "Nova šetnja kroz dokumentovane spomenike. Svaki dodir vuče drugi niz. Godina iz atlasa, ako izaberete jednu, jedino zaključava temu.",
      "Belgelenmiş anıtlar arasında taze bir yürüyüş. Her dokunuş başka bir sıra çeker. Atlastan seçtiğiniz bir yıl temayı kilitleyen tek şeydir.",
      "Свіжа прогулянка документованими пам'ятниками. Кожен дотик тягне іншу послідовність. Рік з атласу, якщо обрати один, єдине, що фіксує тему.",
     "Një shëtitje e re nëpër monumente të dokumentuara. Çdo prekje nxjerr një radhë tjetër. Një vit nga atlasi, nëse zgjidhni një, është e vetmja gjë që e kyç temën."),
  };
}

export type AroundThemeChoice = {
  themeId: string;
  year?: number;
  note: Copy;
};

export function isAroundBirthYear(year: number): boolean {
  return DOCUMENTED_YEARS.has(year);
}

export function aroundThemeDefault(): AroundThemeChoice {
  return {
    themeId: "civic-axis",
    note: L(
      "A documented walk along the civic axis from Macedonia Square: the arch, the Stone Bridge, then the museum row.",
      "Документирана прошетка по граѓанската оска од плоштадот Македонија: портата, Камениот мост, потоа музејскиот ред.",
      "Dokumentovana šetnja duž građanske ose od trga Makedonija: kapija, Kameni most, zatim muzejski niz.",
      "Makedonya Meydanı’ndan belgelenmiş kamusal eksen yürüyüşü: zafer takı, Taş Köprü, sonra müze sırası.",
      "Документована прогулянка громадською віссю від площі Македонія: арка, Кам'яний міст, потім музейний ряд.",
     "Një shëtitje e dokumentuar përgjatë boshtit qytetar nga Sheshi i Maqedonisë: harku, Ura e Gurit, pastaj rreshti i muzeve."),
  };
}

export function aroundThemeForYear(year: number): AroundThemeChoice | null {
  if (!isAroundBirthYear(year)) return null;
  if (year <= 1963) {
    return {
      themeId: "1963-memory",
      year,
      note: L(
        "This year is at or before 1963. The walk uses the documented earthquake-memory sequence in the atlas.",
        "Годината е во или пред 1963. Прошетката ја користи документираната низа за сеќавање на земјотресот во атласот.",
        "Godina je u ili pre 1963. Šetnja koristi dokumentovani niz sećanja na zemljotres u atlasu.",
        "Bu yıl 1963 veya öncesi. Yürüyüş atlasın belgelenmiş deprem-belleği dizisini kullanır.",
        "Цей рік — 1963 або раніше. Прогулянка бере документовану послідовність пам'яті землетрусу з атласу.",
       "Ky vit është 1963 ose më parë. Shëtitja përdor radhën e dokumentuar të kujtesës së tërmetit në atlas."),
    };
  }
  if (year <= 1990) {
    return {
      themeId: "civic-institutions",
      year,
      note: L(
        "Those years are read here through documented houses of the republic on the civic walk, not through invented events from your childhood.",
        "Тие години се читаат тука преку документирани куќи на републиката на граѓанската прошетка, не преку измислени настани од детството.",
        "Te godine se ovde čitaju preko dokumentovanih kuća republike na građanskoj šetnji, ne preko izmišljenih događaja iz detinjstva.",
        "Bu yıllar burada, çocukluğunuza uydurulmuş olaylarla değil, belgelenmiş cumhuriyet evleriyle okunur.",
        "Ті роки читаються тут через документовані доми республіки на громадській прогулянці, не через вигадані події дитинства.",
       "Ato vite lexohen këtu përmes shtëpive të dokumentuara të republikës në shëtitjen qytetare, jo përmes ngjarjeve të trilluara nga fëmijëria juaj."),
    };
  }
  if (year <= 2009) {
    return {
      themeId: "civic-axis",
      year,
      note: L(
        "The walk follows the documented civic axis of square, arch, and bridge. The year only chooses this atlas theme; it does not invent a private itinerary.",
        "Прошетката ја следи документираната граѓанска оска: плоштад, порта и мост. Годината само ја бира оваа тема од атласот; не измислува приватна маршрута.",
        "Šetnja prati dokumentovanu građansku osu trga, kapije i mosta. Godina samo bira ovu temu atlasa; ne izmišlja privatnu rutu.",
        "Yürüyüş belgelenmiş kamusal ekseni izler: meydan, tak, köprü. Yıl yalnızca bu atlas temasını seçer; özel bir güzergâh uydurmaz.",
        "Прогулянка йде документованою громадською віссю: площа, арка, міст. Рік лише обирає цю тему атласу; не вигадує приватний маршрут.",
       "Shëtitja ndjek boshtin qytetar të dokumentuar të sheshit, harkut dhe urës. Viti zgjedh vetëm këtë temë të atlasit; nuk trillon një itinerar privat."),
    };
  }
  if (year <= 2018) {
    return {
      themeId: "skopje-2014",
      year,
      note: L(
        "Skopje 2014 is the documented civic-architecture programme whose dated works fall in these years. The walk uses those verified stops.",
        "Скопје 2014 е документираната програма за граѓанска архитектура чии датирани дела паѓаат во овие години. Прошетката ги користи тие потврдени постојки.",
        "Skoplje 2014 je dokumentovani program građanske arhitekture čija datirana dela padaju u ove godine. Šetnja koristi ta potvrđena stajališta.",
        "Skopje 2014, tarihli işleri bu yıllara düşen belgelenmiş kamusal mimari programıdır. Yürüyüş o doğrulanmış durakları kullanır.",
        "Скоп'є 2014 — документована програма громадської архітектури, датовані твори якої припадають на ці роки. Прогулянка бере ті підтверджені зупинки.",
       "Shkupi 2014 është programi i dokumentuar i arkitekturës qytetare, veprat e datuara të të cilit bien në këto vite. Shëtitja përdor ato ndalesa të verifikuara."),
    };
  }
  return {
    themeId: "municipal-programme",
    year,
    note: L(
      "Recent years are read through the Municipality of Centar landmarks walk printed in the 2026 culture programme.",
      "Поновите години се читаат преку прошетката со обележја на Општина Центар, испечатена во програмата за култура 2026.",
      "Novije godine se čitaju preko šetnje obeležjima Opštine Centar, štampane u programu kulture 2026.",
      "Yakın yıllar, 2026 kültür programında basılan Centar Belediyesi işaret yürüyüşü üzerinden okunur.",
      "Останні роки читаються через прогулянку орієнтирами Општини Центар, надруковану в програмі культури 2026.",
     "Vitet e fundit lexohen përmes shëtitjes së pikave dalluese të Komunës së Qendrës, të shtypur në programin kulturor të vitit 2026."),
  };
}
