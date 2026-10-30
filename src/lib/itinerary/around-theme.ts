import { L } from "@/content/copy";
import type { Copy } from "@/content/types";

export const AROUND_YEAR_MIN = 1910;
export const AROUND_YEAR_MAX = 2026;

export type AroundThemeChoice = {
  themeId: string;
  year?: number;
  note: Copy;
};

export function isAroundBirthYear(year: number): boolean {
  return Number.isInteger(year) && year >= AROUND_YEAR_MIN && year <= AROUND_YEAR_MAX;
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
    ),
  };
}

export function aroundThemeForYear(year: number): AroundThemeChoice | null {
  if (!isAroundBirthYear(year)) return null;
  if (year <= 1963) {
    return {
      themeId: "1963-memory",
      year,
      note: L(
        "Your birth year is at or before 1963. The walk uses the documented earthquake-memory sequence in the atlas. It is not a biography of you.",
        "Годината на раѓање е во или пред 1963. Прошетката ја користи документираната низа за сеќавање на земјотресот во атласот. Не е биографија за вас.",
        "Godina rođenja je u ili pre 1963. Šetnja koristi dokumentovani niz sećanja na zemljotres u atlasu. To nije vaša biografija.",
        "Doğum yılınız 1963 veya öncesi. Yürüyüş atlasın belgelenmiş deprem-belleği dizisini kullanır. Bu sizin biyografiniz değildir.",
        "Рік народження — 1963 або раніше. Прогулянка бере документовану послідовність пам'яті землетрусу з атласу. Це не ваша біографія.",
      ),
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
      ),
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
      ),
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
      ),
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
    ),
  };
}
