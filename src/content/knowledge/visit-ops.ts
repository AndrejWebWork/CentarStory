import { L } from "@/content/copy";
import type { Copy } from "@/content/types";
import type { DayWindow } from "@/lib/visit/hours";

export type VisitOps = {
  slug: string;
  sourceIds: string[];
  lastChecked: string;
  windows?: DayWindow[];
  timetable: Copy;
  tickets?: Copy;
  accessibility?: Copy;
  lastAdmission?: Copy;
};

const CHECKED = "2026-10-29";

export const visitOps: VisitOps[] = [
  {
    slug: "mother-teresa-house",
    sourceIds: ["mother-teresa-official", "mother-teresa-visit"],
    lastChecked: CHECKED,
    windows: [
      { weekday: 2, open: "10:00", close: "18:00" },
      { weekday: 3, open: "10:00", close: "18:00" },
      { weekday: 4, open: "10:00", close: "18:00" },
      { weekday: 5, open: "10:00", close: "18:00" },
      { weekday: 6, open: "10:00", close: "18:00" },
      { weekday: 0, open: "10:00", close: "18:00" },
    ],
    timetable: L(
      "Tuesday–Sunday 10:00–18:00; last visitor 17:45; closed Monday and on state holidays.",
      "Вторник–недела 10:00–18:00; последен посетител 17:45; затворено понеделник и државни празници.",
      "Utorak–nedelja 10:00–18:00; poslednji posetilac 17:45; zatvoreno ponedeljkom i državnim praznicima.",
      "Salı–Pazar 10:00–18:00; son ziyaretçi 17:45; Pazartesi ve resmi tatiller kapalı.",
      "Вівторок–неділя 10:00–18:00; останній відвідувач 17:45; понеділок і державні свята зачинено.",
    ),
    tickets: L(
      "The house publishes free admission and free guided visits. Organised groups must announce in advance.",
      "Куќата објавува бесплатен влез и бесплатно водење. Организирани групи мора да се најават однапред.",
      "Kuća objavljuje besplatan ulaz i besplatno vođenje. Organizovane grupe moraju da se najave unapred.",
      "Ev ücretsiz giriş ve ücretsiz rehberlik yayımlar. Organize gruplar önceden haber vermelidir.",
      "Дім публікує безкоштовний вхід і безкоштовний супровід. Організовані групи мають заявитися заздалегідь.",
    ),
    lastAdmission: L("Last visitor 17:45.", "Последен посетител 17:45.", "Poslednji posetilac 17:45.", "Son ziyaretçi 17:45.", "Останній відвідувач 17:45."),
  },
  {
    slug: "old-railway-station",
    sourceIds: ["museumskopje"],
    lastChecked: CHECKED,
    windows: [
      { weekday: 2, open: "10:00", close: "16:30" },
      { weekday: 3, open: "10:00", close: "16:30" },
      { weekday: 4, open: "10:00", close: "16:30" },
      { weekday: 5, open: "10:00", close: "16:30" },
      { weekday: 6, open: "10:00", close: "16:30" },
      { weekday: 0, open: "10:00", close: "13:30" },
    ],
    timetable: L(
      "Tuesday–Saturday 10:00–16:30; Sunday 10:00–13:30; closed on state holidays, as printed by the City Museum.",
      "Вторник–сабота 10:00–16:30; недела 10:00–13:30; државни празници неработни, според Музејот на град Скопје.",
      "Utorak–subota 10:00–16:30; nedelja 10:00–13:30; državni praznici neradni, prema Muzeju grada Skoplja.",
      "Kent Müzesi’nin basımına göre Salı–Cumartesi 10:00–16:30; Pazar 10:00–13:30; resmi tatiller kapalı.",
      "Вівторок–субота 10:00–16:30; неділя 10:00–13:30; державні свята неробочі, за Міським музеєм.",
    ),
  },
  {
    slug: "holocaust-memorial",
    sourceIds: ["holocaust-fund"],
    lastChecked: CHECKED,
    windows: [
      { weekday: 2, open: "09:00", close: "19:00" },
      { weekday: 3, open: "09:00", close: "19:00" },
      { weekday: 4, open: "09:00", close: "19:00" },
      { weekday: 5, open: "09:00", close: "19:00" },
      { weekday: 6, open: "09:00", close: "15:00" },
      { weekday: 0, open: "09:00", close: "15:00" },
    ],
    timetable: L(
      "Tuesday–Friday 09:00–19:00; Saturday–Sunday 09:00–15:00; Monday closed, as printed by the Holocaust Fund.",
      "Вторник–петок 09:00–19:00; сабота–недела 09:00–15:00; понеделник затворен, според Фондот на холокаустот.",
      "Utorak–petak 09:00–19:00; subota–nedelja 09:00–15:00; ponedeljak zatvoren, prema Fondu Holokausta.",
      "Holokost Fonu’nun basımına göre Salı–Cuma 09:00–19:00; Cumartesi–Pazar 09:00–15:00; Pazartesi kapalı.",
      "Вівторок–п'ятниця 09:00–19:00; субота–неділя 09:00–15:00; понеділок зачинено, за Фондом Голокосту.",
    ),
  },
  {
    slug: "contemporary-art",
    sourceIds: ["msu-home", "msu-home-2026"],
    lastChecked: CHECKED,
    windows: [
      { weekday: 2, open: "10:00", close: "17:00" },
      { weekday: 3, open: "10:00", close: "17:00" },
      { weekday: 4, open: "10:00", close: "17:00" },
      { weekday: 5, open: "10:00", close: "17:00" },
      { weekday: 6, open: "10:00", close: "17:00" },
      { weekday: 0, open: "09:00", close: "13:00" },
    ],
    timetable: L(
      "Tuesday–Saturday 10:00–17:00; Sunday 09:00–13:00, as printed on msu.mk on 29 October 2026.",
      "Вторник–сабота 10:00–17:00; недела 09:00–13:00, според msu.mk на 29 октомври 2026.",
      "Utorak–subota 10:00–17:00; nedelja 09:00–13:00, prema msu.mk 29. oktobra 2026.",
      "29 Ekim 2026’da msu.mk’nin bastığı üzere Salı–Cumartesi 10:00–17:00; Pazar 09:00–13:00.",
      "Вівторок–субота 10:00–17:00; неділя 09:00–13:00, за msu.mk 29 жовтня 2026.",
    ),
    tickets: L(
      "100 MKD as printed on msu.mk on 29 October 2026. Confirm at the desk.",
      "100 денари како што печати msu.mk на 29 октомври 2026. Потврдете на шалтер.",
      "100 denara kako što štampa msu.mk 29. oktobra 2026. Potvrdite na šalteru.",
      "29 Ekim 2026’da msu.mk’nin bastığı üzere 100 MKD. Gişede doğrulayın.",
      "100 денарів, як друкує msu.mk 29 жовтня 2026. Підтвердьте на касі.",
    ),
  },
  {
    slug: "archaeological-museum",
    sourceIds: ["amm-visit"],
    lastChecked: CHECKED,
    timetable: L(
      "The museum’s plan-your-visit page does not print a complete weekday timetable. It states that last tickets can be purchased no later than 17:00.",
      "Страницата за посета не печати целосен распоред по денови. Наведува дека последни билети се купуваат најдоцна до 17:00.",
      "Stranica za posetu ne štampa kompletan raspored po danima. Navodi da se poslednje karte kupuju najkasnije do 17:00.",
      "Ziyaret sayfası tam bir haftalık çizelge basmaz. Son biletlerin en geç 17:00’de alınabileceğini belirtir.",
      "Сторінка візиту не друкує повний розклад за днями. Зазначає, що останні квитки купують не пізніше 17:00.",
    ),
    tickets: L(
      "Domestic: 200 MKD individual; 350 MKD family; 100 MKD group over 6, pensioners, pupils, students. Free for children under 7, socially vulnerable visitors, children from orphanages, and persons with disabilities. Students free every Thursday; high-school students free every Wednesday; first Saturday of the month free for all. Foreign visitors: 400 MKD individual; 200 MKD student (ISIC, Euro 26 — not for special exhibitions); 700 MKD family; 200 MKD group over 6. Agency and licensed-guide foreign tickets 200 MKD. Guided tours included. Confirm at the desk.",
      "Домашни: 200 ден. поединечно; 350 ден. семејно; 100 ден. група над 6, пензионери, ученици, студенти. Бесплатно за деца под 7, социјално ранливи, деца од домови и лица со попреченост. Студенти бесплатно секој четврток; средношколци секоја среда; прва сабота во месецот бесплатно за сите. Странски: 400 ден. поединечно; 200 ден. студент (ISIC, Euro 26 — не за посебни изложби); 700 ден. семејно; 200 ден. група над 6. Агенциски и лиценцирани водичи 200 ден. Водењето е во цената. Потврдете на шалтер.",
      "Domaći: 200 den. pojedinačno; 350 den. porodično; 100 den. grupa preko 6, penzioneri, učenici, studenti. Besplatno za decu ispod 7, socijalno ugrožene, decu iz domova i lica sa invaliditetom. Studenti besplatno svakog četvrtka; srednjoškolci svake srede; prva subota u mesecu besplatno za sve. Stranci: 400 den. pojedinačno; 200 den. student (ISIC, Euro 26 — ne za specijalne izložbe); 700 den. porodično; 200 den. grupa preko 6. Agencije i licencirani vodiči 200 den. Vođenje je u ceni. Potvrdite na šalteru.",
      "Yurttaş: 200 MKD bireysel; 350 MKD aile; 100 MKD 6’dan fazla grup, emekli, öğrenci. 7 yaş altı, sosyal olarak kırılgan ziyaretçiler, yetimhane çocukları ve engelli kişiler ücretsiz. Her Perşembe üniversite, her Çarşamba lise öğrencileri ücretsiz; ayın ilk Cumartesi herkes ücretsiz. Yabancı: 400 MKD bireysel; 200 MKD öğrenci (ISIC, Euro 26 — özel sergiler hariç); 700 MKD aile; 200 MKD 6’dan fazla grup. Acente ve lisanslı rehber 200 MKD. Rehberlik fiyata dahildir. Gişede doğrulayın.",
      "Для громадян: 200 ден. індивідуально; 350 ден. родина; 100 ден. група понад 6, пенсіонери, учні, студенти. Безкоштовно для дітей до 7, соціально вразливих, дітей з інтернатів і осіб з інвалідністю. Студенти безкоштовно щочетверга; школярі щосереди; перша субота місяця безкоштовно для всіх. Іноземці: 400 ден. індивідуально; 200 ден. студент (ISIC, Euro 26 — не для спеціальних виставок); 700 ден. родина; 200 ден. група понад 6. Агенції й ліцензовані гіди 200 ден. Екскурсія в ціні. Підтвердьте на касі.",
    ),
    accessibility: L(
      "The museum states it is accessible to visitors with disabilities and works with organisations for autistic spectrum, ADHD, physical and mental disability, deaf and hard of hearing, and visually impaired visitors.",
      "Музејот наведува дека е пристапен за посетители со попреченост и соработува со организации за аутистичен спектар, АДХД, физичка и ментална попреченост, глуви и наглуви и слепи посетители.",
      "Muzej navodi da je pristupačan posetiocima sa invaliditetom i sarađuje sa organizacijama za autistični spektar, ADHD, fizički i mentalni invaliditet, gluve i nagluve i slepe posetioce.",
      "Müze, engelli ziyaretçilere erişilebilir olduğunu ve otizm spektrumu, ADHD, bedensel ve zihinsel engel, sağır-ağır işiten ve görme engelli ziyaretçiler için kuruluşlarla çalıştığını belirtir.",
      "Музей зазначає, що він доступний для відвідувачів з інвалідністю і співпрацює з організаціями щодо спектру аутизму, СДУГ, фізичної й ментальної інвалідності, глухих, слабочуючих і незрячих відвідувачів.",
    ),
    lastAdmission: L("Last tickets no later than 17:00.", "Последни билети најдоцна до 17:00.", "Poslednje karte najkasnije do 17:00.", "Son biletler en geç 17:00.", "Останні квитки не пізніше 17:00."),
  },
];

const bySlug = new Map(visitOps.map((item) => [item.slug, item]));

export function getVisitOps(slug: string) {
  return bySlug.get(slug);
}
