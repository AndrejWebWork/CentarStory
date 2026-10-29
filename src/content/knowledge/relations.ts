import { L } from "@/content/copy";
import { routes } from "@/content/knowledge/programmes";
import type { RelationshipRecord } from "@/content/knowledge/schema";

function R(
  partial: Omit<RelationshipRecord, "historical"> & { historical?: boolean },
): RelationshipRecord {
  return {
    ...partial,
    historical: partial.historical ?? true,
  };
}

const sourced: RelationshipRecord[] = [
  R({
    id: "rel-stevanovska-square-porta",
    kind: "same-creator",
    from: "macedonia-square",
    to: "porta-macedonia",
    explanation: L(
      "Both works are attributed to sculptor Valentina Stevanovska in Skopje 2014 reporting: Prizma names her as author of the Equestrian Warrior; Balkan Insight (2011) reported her as designer of the triumphal arch then under construction.",
      "Двете дела ѝ се припишуваат на вајарката Валентина Стевановска во известувањето за Скопје 2014: Призма ја именува како авторка на Воинот на коњ; Balkan Insight (2011) ја наведе како авторка на триумфалната порта тогаш во изградба.",
      "Oba dela se pripisuju vajarki Valentini Stevanovskoj u izveštavanju o Skoplju 2014: Prizma je imenuje kao autorku Ratnika na konju; Balkan Insight (2011) naveo ju je kao autorku trijumfalne kapije tada u izgradnji.",
      "Her iki iş, Üsküp 2014 haberlerinde heykeltıraş Valentina Stevanovska’ya bağlanır: Prizma onu Atlı Savaşçı’nın yazarı olarak adlandırır; Balkan Insight (2011) o sırada inşa halindeki zafer takının tasarımcısı olarak bildirdi.",
      "Обидва твори в репортажах про «Скоп'є 2014» приписують скульпторці Валентині Стевановській: Prizma називає її авторкою Вершника; Balkan Insight (2011) назвав її авторкою тріумфальної арки, тоді ще в будівництві.",
    ),
    sourceIds: ["prizma-warrior", "balkaninsight-2011"],
    verificationStatus: "confirmed",
    themeIds: ["person:stevanovska", "skopje-2014"],
  }),
  R({
    id: "rel-style-square-porta",
    kind: "architectural-movement",
    from: "macedonia-square",
    to: "porta-macedonia",
    explanation: L(
      "The square's fountain monument and Porta Macedonia are both recorded as Skopje 2014 civic architecture.",
      "Споменик-фонтана на плоштадот и Порта Македонија се обата запишани како граѓанска архитектура на Скопје 2014.",
      "Spomenik-fontana na trgu i Porta Makedonija oba su zabeleženi kao građanska arhitektura Skoplja 2014.",
      "Meydanın çeşme anıtı ve Porta Makedonya, ikisi de Üsküp 2014 kamusal mimarisi olarak kaydedilir.",
      "Пам'ятник-фонтан на площі і Порта Македонія обидва записані як громадська архітектура «Скоп'є 2014».",
    ),
    sourceIds: ["prizma-warrior", "balkaninsight-2011"],
    verificationStatus: "confirmed",
    themeIds: ["skopje-2014"],
  }),
  R({
    id: "rel-style-porta-amm",
    kind: "architectural-movement",
    from: "porta-macedonia",
    to: "archaeological-museum",
    explanation: L(
      "Porta Macedonia and the Archaeological Museum's quay building are both documented as Skopje 2014 architecture.",
      "Порта Македонија и кејската градба на Археолошкиот музеј се обата документирани како архитектура на Скопје 2014.",
      "Porta Makedonija i kejska zgrada Arheološkog muzeja obe su dokumentovane kao arhitektura Skoplja 2014.",
      "Porta Makedonya ve Arkeoloji Müzesi’nin rıhtım binası, ikisi de Üsküp 2014 mimarisi olarak belgelenir.",
      "Порта Македонія і будівля набережної Археологічного музею обидві задокументовані як архітектура «Скоп'є 2014».",
    ),
    sourceIds: ["balkaninsight-2011", "amm-about"],
    verificationStatus: "confirmed",
    themeIds: ["skopje-2014"],
  }),
  R({
    id: "rel-style-square-amm",
    kind: "architectural-movement",
    from: "macedonia-square",
    to: "archaeological-museum",
    explanation: L(
      "The Equestrian Warrior ensemble and the Archaeological Museum quay façade belong to the documented Skopje 2014 civic programme.",
      "Ансамблот на Воинот на коњ и кејската фасада на Археолошкиот музеј припаѓаат на документираната граѓанска програма Скопје 2014.",
      "Ansambl Ratnika na konju i kejska fasada Arheološkog muzeja pripadaju dokumentovanom građanskom programu Skoplje 2014.",
      "Atlı Savaşçı bütünü ve Arkeoloji Müzesi rıhtım cephesi belgelenmiş Üsküp 2014 kamusal programına aittir.",
      "Ансамбль Вершника і фасад набережної Археологічного музею належать до задокументованої громадської програми «Скоп'є 2014».",
    ),
    sourceIds: ["prizma-warrior", "amm-about"],
    verificationStatus: "confirmed",
    themeIds: ["skopje-2014"],
  }),
  R({
    id: "rel-style-quay-amm",
    kind: "architectural-movement",
    from: "vardar-quay",
    to: "archaeological-museum",
    explanation: L(
      "The Archaeological Museum sits on the Vardar quay in a Skopje 2014 museum building; the quay record itself notes stone edges added in that programme.",
      "Археолошкиот музеј седи на кејот на Вардар во музејска градба од Скопје 2014; самиот запис за кејот бележи камени рабови додадени во таа програма.",
      "Arheološki muzej sedi na keju Vardara u muzejskoj zgradi Skoplja 2014; sam zapis o keju beleži kamene ivice dodate u tom programu.",
      "Arkeoloji Müzesi, Üsküp 2014 müze binasında Vardar rıhtımında durur; rıhtım kaydı o programda eklenen taş kenarları not eder.",
      "Археологічний музей стоїть на набережній Вардару в музейній будівлі «Скоп'є 2014»; сам запис набережної фіксує кам'яні краї, додані в тій програмі.",
    ),
    sourceIds: ["amm-about", "centar-profile"],
    verificationStatus: "confirmed",
    themeIds: ["skopje-2014", "quay-museums"],
  }),
  R({
    id: "rel-style-quay-square",
    kind: "architectural-movement",
    from: "vardar-quay",
    to: "macedonia-square",
    explanation: L(
      "The quay record documents successive river-edge works including Skopje 2014; the square's fountain monument is part of the same documented civic programme.",
      "Записот за кејот ги документира последователните работи на речниот раб вклучувајќи Скопје 2014; споменикот-фонтана на плоштадот е дел од истата документирана граѓанска програма.",
      "Zapis o keju dokumentuje uzastopne radove na rečnom rubu uključujući Skoplje 2014; spomenik-fontana na trgu deo je istog dokumentovanog građanskog programa.",
      "Rıhtım kaydı Üsküp 2014 dahil ardışık ırmak kenarı işlerini belgeler; meydanın çeşme anıtı aynı belgelenmiş kamusal programın parçasıdır.",
      "Запис набережної документує послідовні роботи на краї річки включно зі «Скоп'є 2014»; пам'ятник-фонтан на площі є частиною тієї самої задокументованої громадської програми.",
    ),
    sourceIds: ["prizma-warrior", "centar-profile"],
    verificationStatus: "confirmed",
    themeIds: ["skopje-2014"],
  }),
  R({
    id: "rel-style-teresa-prizma",
    kind: "architectural-movement",
    from: "mother-teresa-house",
    to: "macedonia-square",
    explanation: L(
      "Prizma's Skopje 2014 file records the Memorial House of Mother Teresa in that civic building programme, alongside the square's Equestrian Warrior.",
      "Досието на Призма за Скопје 2014 ја запишува Спомен-куќата на Мајка Тереза во таа граѓанска градежна програма, покрај Воинот на коњ на плоштадот.",
      "Dosije Prizme za Skoplje 2014 beleži Spomen-kuću Majke Tereze u tom građanskom građevinskom programu, pored Ratnika na konju na trgu.",
      "Prizma’nın Üsküp 2014 dosyası Rahibe Teresa Anı Evi’ni, meydandaki Atlı Savaşçı’nın yanında, o kamusal yapı programında kaydeder.",
      "Досьє Prizma про «Скоп'є 2014» записує меморіальний дім Матері Терези в тій громадській будівельній програмі, поряд із Вершником на площі.",
    ),
    sourceIds: ["prizma-teresa", "prizma-warrior"],
    verificationStatus: "confirmed",
    themeIds: ["skopje-2014"],
  }),
  R({
    id: "rel-period-bridge-hammam",
    kind: "same-period",
    from: "stone-bridge",
    to: "daut-pasha-hammam",
    explanation: L(
      "CEIPA dates both the Stone Bridge and Daut Pasha Hammam to 15th-century Ottoman masonry. That shared period is documented; it is not a claim that the two were designed as a pair.",
      "ЦЕИПА ги датира и Камениот мост и Даут-пашиниот амам во османска ѕидарија од XV век. Тој заеднички период е документиран; тоа не е тврдење дека биле проектирани како пар.",
      "CEIPA datira i Kameni most i Daut-pašin amam u osmansko zidanje 15. veka. Taj zajednički period je dokumentovan; to nije tvrdnja da su projektovani kao par.",
      "CEIPA hem Taş Köprü’yü hem Daut Paşa Hamamı’nı 15. yüzyıl Osmanlı yığma işçiliğine tarihler. Paylaşılan dönem belgelidir; ikisinin bir çift olarak tasarlandığı iddiası değildir.",
      "CEIPA датує і Кам'яний міст, і хамам Даут-паші османською кладкою XV століття. Той спільний період задокументований; це не твердження, що їх спроєктували як пару.",
    ),
    sourceIds: ["ceipa-bridge", "ceipa-hammam"],
    verificationStatus: "confirmed",
    themeIds: ["ottoman-masonry"],
  }),
  R({
    id: "rel-event-1963-station-teresa",
    kind: "same-event",
    from: "old-railway-station",
    to: "mother-teresa-house",
    explanation: L(
      "Both sites are tied to 26 July 1963 in their institutional records: the City Museum occupies the damaged 1939 station; the Memorial House stands where the Catholic church of the Sacred Heart stood until that earthquake.",
      "Двете места се врзани за 26 јули 1963 во нивните институционални записи: Музејот на градот ја зазема оштетената станица од 1939; Спомен-куќата стои каде што до тој земјотрес стоела католичката црква Пресвето Срце.",
      "Oba mesta vezana su za 26. jul 1963. u svojim institucijskim zapisima: Muzej grada zauzima oštećenu stanicu iz 1939; Spomen-kuća stoji gde je do tog zemljotresa stajala katolička crkva Presveto Srce.",
      "Her iki yer kurumsal kayıtlarında 26 Temmuz 1963’e bağlıdır: Kent Müzesi hasarlı 1939 garını işgal eder; Anı Evi, o depreme kadar Kutsal Kalp Katolik kilisesinin durduğu yerde durur.",
      "Обидва місця в інституційних записах пов'язані з 26 липня 1963: Міський музей займає пошкоджений вокзал 1939 року; Меморіальний дім стоїть там, де до того землетрусу стояла католицька церква Пресвятого Серця.",
    ),
    sourceIds: ["museumskopje", "mother-teresa-official"],
    verificationStatus: "confirmed",
    themeIds: ["1963-memory"],
  }),
  R({
    id: "rel-event-ilinden-square-kale",
    kind: "same-event",
    from: "macedonia-square",
    to: "skopje-fortress",
    explanation: L(
      "Ilinden on 2 August is recorded as a public observance in Centar on Macedonia Square and at Kale, as described in the municipal profile.",
      "Илинден на 2 август е запишан како јавно одбележување во Центар на плоштадот Македонија и на Кале, според општинскиот профил.",
      "Ilinden 2. avgusta zabeležen je kao javno obeležavanje u Centru na trgu Makedonija i na Kale, prema opštinskom profilu.",
      "2 Ağustos İlinden, belediye profiline göre Centar’da Makedonya Meydanı’nda ve Kale’de kamusal bir anma olarak kaydedilir.",
      "Ілінден 2 серпня записаний як публічне відзначення в Центрі на площі Македонія і в Кале, за муніципальним профілем.",
    ),
    sourceIds: ["centar-profile"],
    verificationStatus: "confirmed",
    themeIds: ["ilinden", "event:ilinden"],
  }),
  R({
    id: "rel-event-summer-square-quay",
    kind: "same-event",
    from: "macedonia-square",
    to: "vardar-quay",
    historical: true,
    explanation: L(
      "Skopje Summer is treated as a recurring city programme whose stages include the square and the quay. Yearly dates must be confirmed with the City of Skopje.",
      "Скопско лето се третира како повторлива градска програма чии сцени ги вклучуваат плоштадот и кејот. Годишните датуми треба да се потврдат со Град Скопје.",
      "Skopljansko leto tretira se kao ponavljajući gradski program čije scene uključuju trg i kej. Godišnji datumi treba da se potvrde sa Gradom Skopljem.",
      "Üsküp Yazı, sahneleri meydanı ve rıhtımı içeren yinelenen bir kent programı olarak ele alınır. Yıllık tarihler Üsküp kentiyle doğrulanmalıdır.",
      "Скопське літо трактується як повторювана міська програма, сцени якої включають площу і набережну. Річні дати треба підтвердити з містом Скоп'є.",
    ),
    sourceIds: ["skopje-gov"],
    verificationStatus: "candidate",
    themeIds: ["event:skopje-summer"],
  }),
  R({
    id: "rel-ensemble-bridge-square",
    kind: "documented-ensemble",
    from: "stone-bridge",
    to: "macedonia-square",
    explanation: L(
      "The Municipality of Centar names the Stone Bridge among its defining cultural objects and describes it as the crossing between Macedonia Square and the Old Bazaar.",
      "Општина Центар го именува Камениот мост меѓу определувачките културни објекти и го опишува како премин меѓу плоштадот Македонија и Старата чаршија.",
      "Opština Centar imenuje Kameni most među određujućim kulturnim objektima i opisuje ga kao prelaz između trga Makedonija i Stare čaršije.",
      "Centar Belediyesi Taş Köprü’yü belirleyici kültür varlıkları arasında adlandırır ve onu Makedonya Meydanı ile Eski Çarşı arasındaki geçit olarak tarif eder.",
      "Громада Центар називає Кам'яний міст серед визначальних культурних об'єктів і описує його як перехід між площею Македонія і Старим базаром.",
    ),
    sourceIds: ["centar-profile", "ceipa-bridge"],
    verificationStatus: "confirmed",
    themeIds: ["civic-axis"],
  }),
  R({
    id: "rel-ensemble-holocaust-bridge",
    kind: "documented-ensemble",
    from: "holocaust-memorial",
    to: "stone-bridge",
    explanation: L(
      "The Holocaust Fund states the memorial center stands in the former Jewish quarter on the left bank of the Vardar, between the Stone Bridge and Kale.",
      "Фондот на холокаустот наведува дека меморијалниот центар стои во поранешното Еврејско маало на левиот брег на Вардар, меѓу Камениот мост и Кале.",
      "Fond Holokausta navodi da memorijalni centar stoji u nekadašnjoj Jevrejskoj mahali na levoj obali Vardara, između Kamenog mosta i Kale.",
      "Holokost Fonu, anma merkezinin Vardar’ın sol kıyısında, Taş Köprü ile Kale arasında, eski Yahudi mahallesinde durduğunu belirtir.",
      "Фонд Голокосту зазначає, що меморіальний центр стоїть у колишньому єврейському кварталі на лівому березі Вардару, між Кам'яним мостом і Кале.",
    ),
    sourceIds: ["holocaust-fund"],
    verificationStatus: "confirmed",
    themeIds: ["quay-museums"],
  }),
  R({
    id: "rel-ensemble-holocaust-kale",
    kind: "documented-ensemble",
    from: "holocaust-memorial",
    to: "skopje-fortress",
    explanation: L(
      "The Holocaust Fund locates the center in the former Jewish quarter between the Stone Bridge and Kale.",
      "Фондот на холокаустот го сместува центарот во поранешното Еврејско маало меѓу Камениот мост и Кале.",
      "Fond Holokausta smešta centar u nekadašnju Jevrejsku mahalu između Kamenog mosta i Kale.",
      "Holokost Fonu merkezi Taş Köprü ile Kale arasındaki eski Yahudi mahallesine yerleştirir.",
      "Фонд Голокосту розташовує центр у колишньому єврейському кварталі між Кам'яним мостом і Кале.",
    ),
    sourceIds: ["holocaust-fund"],
    verificationStatus: "confirmed",
    themeIds: ["quay-museums"],
  }),
  R({
    id: "rel-ensemble-amm-quay",
    kind: "documented-ensemble",
    from: "archaeological-museum",
    to: "vardar-quay",
    explanation: L(
      "The City of Skopje and the Centar municipal profile place the Archaeological Museum among central cultural institutions on the quay.",
      "Град Скопје и општинскиот профил на Центар го ставаат Археолошкиот музеј меѓу централните културни установи на кејот.",
      "Grad Skoplje i opštinski profil Centra stavljaju Arheološki muzej među središnje kulturne ustanove na keju.",
      "Üsküp kenti ve Centar belediye profili Arkeoloji Müzesi’ni rıhtımdaki merkezi kültür kurumları arasında koyar.",
      "Місто Скоп'є і муніципальний профіль Центру ставлять Археологічний музей серед центральних культурних установ на набережній.",
    ),
    sourceIds: ["skopje-gov", "centar-profile"],
    verificationStatus: "confirmed",
    themeIds: ["quay-museums", "civic-axis"],
  }),
  R({
    id: "rel-ensemble-mmb-bridge",
    kind: "documented-ensemble",
    from: "macedonian-struggle",
    to: "stone-bridge",
    explanation: L(
      "The Museum of the Macedonian Struggle is recorded beside the Stone Bridge at Iljo Vojvoda, in Municipality of Centar.",
      "Музејот на македонската борба е запишан покрај Камениот мост на Иљо Војвода, во Општина Центар.",
      "Muzej makedonske borbe zabeležen je pored Kamenog mosta na Ilji Vojvodi, u Opštini Centar.",
      "Makedon Mücadelesi Müzesi, Centar Belediyesi’nde Iljo Vojvoda’da Taş Köprü yanında kaydedilir.",
      "Музей македонської боротьби записаний біля Кам'яного мосту на Ільо Воєвода, у громаді Центар.",
    ),
    sourceIds: ["mmb-en", "nominatim-lookup"],
    verificationStatus: "confirmed",
    themeIds: ["quay-museums", "civic-axis"],
  }),
  R({
    id: "rel-ensemble-teresa-army",
    kind: "documented-ensemble",
    from: "mother-teresa-house",
    to: "officers-hall",
    explanation: L(
      "Prizma notes that the Memorial House of Mother Teresa was built in front of the Army Hall façade. This atlas keeps the OSM-verified hall distinct from any separately labelled Skopje 2014 Officers' Hall reconstruction.",
      "Призма бележи дека Спомен-куќата на Мајка Тереза била изградена пред фасадата на Домот на АРМ. Овој атлас го држи OSM-потврдениот дом одвоен од секоја посебно означена реконструкција на Офицерски дом од Скопје 2014.",
      "Prizma beleži da je Spomen-kuća Majke Tereze sagrađena ispred fasade Doma ARM. Ovaj atlas OSM-potvrđeni dom drži odvojenim od svake posebno označene rekonstrukcije Oficirskog doma iz Skoplja 2014.",
      "Prizma, Rahibe Teresa Anı Evi’nin ARM Evi cephesinin önüne yapıldığını not eder. Bu atlas OSM doğrulamalı salonu, Üsküp 2014 Subay Evi diye ayrıca etiketlenmiş herhangi bir rekonstrüksiyondan ayrı tutar.",
      "Prizma зазначає, що меморіальний дім Матері Терези зведено перед фасадом Дому АРМ. Цей атлас тримає OSM-підтверджений дім окремо від будь-якої окремо підписаної реконструкції Офіцерського дому «Скоп'є 2014».",
    ),
    sourceIds: ["prizma-teresa"],
    verificationStatus: "confirmed",
    themeIds: ["1963-memory"],
  }),
  R({
    id: "rel-institution-hammam-gallery",
    kind: "institution-link",
    from: "daut-pasha-hammam",
    to: "daut-pasha-hammam",
    explanation: L(
      "CEIPA records that the hammam is now adapted as the National Gallery. This is an institutional use of the same building, not a second site.",
      "ЦЕИПА запишува дека амамот денес е адаптиран како Национална галерија. Тоа е институционална употреба на истата градба, не второ место.",
      "CEIPA beleži da je amam danas adaptiran kao Nacionalna galerija. To je institucijska upotreba iste zgrade, ne drugo mesto.",
      "CEIPA hamamın bugün Ulusal Galeri olarak uyarlandığını kaydeder. Bu aynı binanın kurumsal kullanımıdır, ikinci bir yer değildir.",
      "CEIPA фіксує, що хамам нині адаптований як Національна галерея. Це інституційне використання тієї самої будівлі, не друге місце.",
    ),
    sourceIds: ["ceipa-hammam"],
    verificationStatus: "confirmed",
    themeIds: ["ottoman-masonry"],
  }),
];

function routeEdges(): RelationshipRecord[] {
  const out: RelationshipRecord[] = [];
  for (const route of routes) {
    for (let i = 0; i < route.stops.length - 1; i += 1) {
      const from = route.stops[i];
      const to = route.stops[i + 1];
      out.push(
        R({
          id: `rel-route-${route.slug}-${i}`,
          kind: "documented-route",
          from,
          to,
          historical: false,
          explanation: L(
            `These consecutive stops follow the documented itinerary “${route.name.en}”. That is a sourced walking sequence, not by itself proof of a shared historical origin.`,
            `Овие последователни постојки ја следат документираната маршрута „${route.name.mk}“. Тоа е изворен редослед за пешачење, не само по себе доказ за заедничко историско потекло.`,
            `Ova uzastopna stajališta prate dokumentovanu rutu „${route.name.sr}“. To je izvorni redosled hoda, ne samo po sebi dokaz zajedničkog istorijskog porekla.`,
            `Bu ardışık duraklar belgelenmiş “${route.name.tr}” güzergâhını izler. Bu kaynaklı bir yürüyüş dizisidir, tek başına ortak tarihî köken kanıtı değildir.`,
            `Ці послідовні зупинки йдуть задокументованим маршрутом «${route.name.uk}». Це джерельна пішохідна послідовність, не сама по собі доказ спільного історичного походження.`,
          ),
          sourceIds: route.sourceIds,
          verificationStatus: route.verificationStatus,
          themeIds: [route.theme, route.slug],
        }),
      );
    }
  }
  return out;
}

export const relations: RelationshipRecord[] = [...sourced, ...routeEdges()];

export function getRelation(id: string) {
  return relations.find((item) => item.id === id);
}
