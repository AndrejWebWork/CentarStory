import { L } from "@/content/copy";
import type { Copy } from "@/content/types";

export const LEGAL_UPDATED = "2026-11-03";

export type LegalSlug = "legal" | "privacy" | "terms" | "cookies" | "impressum";

export type LegalSection = {
  heading: Copy;
  body: Copy[];
};

export type LegalDocument = {
  slug: LegalSlug;
  title: Copy;
  kicker: Copy;
  lede: Copy;
  sections: LegalSection[];
};

export const legalDocuments: LegalDocument[] = [
  {
    slug: "legal",
    title: L("Legal notice", "Правна напомена", "Pravna napomena", "Yasal uyarı", "Правове повідомлення", "Njoftim ligjor"),
    kicker: L("Publisher", "Издавач", "Izdavač", "Yayıncı", "Видавець", "Botuesi"),
    lede: L(
      "CentarStory is an independent cultural guide to the Municipality of Centar in Skopje. It is not the official website of the municipality, the City of Skopje, or any museum.",
      "CentarStory е независен културен водич за Општина Центар во Скопје. Не е службена страница на општината, на Град Скопје или на кој било музеј.",
      "CentarStory je nezavisni kulturni vodič za Opštinu Centar u Skoplju. Nije zvanična stranica opštine, Grada Skoplja niti bilo kog muzeja.",
      "CentarStory, Üsküp’teki Centar Belediyesi için bağımsız bir kültür rehberidir. Belediyenin, Üsküp kentinin veya herhangi bir müzenin resmi sitesi değildir.",
      "CentarStory — незалежний культурний гід громадою Центар у Скоп'є. Це не офіційний сайт громади, міста Скоп'є чи будь-якого музею.",
     "CentarStory është një udhërrëfyes kulturor i pavarur për Komunën e Qendrës në Shkup. Nuk është faqja zyrtare e komunës, e Qytetit të Shkupit apo e ndonjë muzeu."),
    sections: [
      {
        heading: L("What this site is", "Што е оваа страница", "Šta je ova stranica", "Bu site nedir", "Що це за сайт", "Çfarë është ky sajt"),
        body: [
          L(
            "The site publishes sourced notes on places, walks, municipal events, food, and transport in Centar. Nothing here is a ticket, a booking, a live timetable, or legal advice.",
            "Страницата објавува изворно поткрепени белешки за места, прошетки, општински настани, храна и превоз во Центар. Ништо тука не е билет, резервација, жив ред на возење или правен совет.",
            "Stranica objavljuje izvorno potkrepljene beleške o mestima, šetnjama, opštinskim događajima, hrani i prevozu u Centru. Ništa ovde nije karta, rezervacija, živi red vožnje ili pravni savet.",
            "Site, Centar’daki yerler, yürüyüşler, belediye etkinlikleri, yemek ve ulaşım hakkında kaynaklı notlar yayımlar. Buradaki hiçbir şey bilet, rezervasyon, canlı sefer çizelgesi veya hukuki tavsiye değildir.",
            "Сайт публікує підтверджені джерелами нотатки про місця, прогулянки, муніципальні події, їжу і транспорт у Центрі. Ніщо тут не є квитком, бронюванням, живим розкладом чи юридичною порадою.",
           "Sajti publikon shënime me burim për vende, shëtitje, ngjarje komunale, ushqim dhe transport në Qendër. Asgjë këtu nuk është biletë, rezervim, orar i drejtpërdrejtë apo këshillë ligjore."),
        ],
      },
      {
        heading: L("Sources and maps", "Извори и карти", "Izvori i mape", "Kaynaklar ve haritalar", "Джерела й мапи", "Burimet dhe hartat"),
        body: [
          L(
            "Place names, hours, fares, and events are taken from cited official pages. If a source and this page disagree, the source wins. Map geometry uses OpenStreetMap and public pedestrian routing. Photograph credits sit on the image.",
            "Имиња, часови, цени и настани се земени од наведени службени страници. Ако изворот и оваа страница се разидуваат, важи изворот. Геометријата на картата користи OpenStreetMap и јавно пешачко рутирање. Кредитите за фотографии стојат на сликата.",
            "Imena, sati, cene i događaji uzeti su sa navedenih zvaničnih stranica. Ako se izvor i ova stranica razilaze, važi izvor. Geometrija mape koristi OpenStreetMap i javno pešačko rutiranje. Krediti za fotografije stoje na slici.",
            "Yer adları, saatler, ücretler ve etkinlikler anılan resmi sayfalardan alınır. Kaynak ile bu sayfa çelişirse kaynak geçerlidir. Harita geometrisi OpenStreetMap ve kamuya açık yaya yönlendirmesini kullanır. Fotoğraf kredileri görselin üzerindedir.",
            "Назви місць, години, тарифи й події взято з наведених офіційних сторінок. Якщо джерело і ця сторінка розходяться, чинне джерело. Геометрія мапи використовує OpenStreetMap і публічну пішохідну маршрутизацію. Кредити світлин стоять на зображенні.",
           "Emrat e vendeve, oraret, tarifat dhe ngjarjet merren nga faqet zyrtare të cituara. Nëse një burim dhe kjo faqe nuk përputhen, fiton burimi. Gjeometria e hartës përdor OpenStreetMap dhe rutimin publik këmbësor. Kreditet e fotografisë qëndrojnë te imazhi."),
        ],
      },
      {
        heading: L("Project record", "Запис за проектот", "Zapis o projektu", "Proje kaydı", "Запис про проєкт", "Regjistrimi i projektit"),
        body: [
          L(
            "CentarStory is published as an independent atlas. The public source repository is github.com/AndrejWebWork/CentarStory. This notice is not a company register extract and does not claim a municipal mandate.",
            "CentarStory се објавува како независен атлас. Јавниот изворен репозиториум е github.com/AndrejWebWork/CentarStory. Оваа напомена не е извод од трговски регистар и не тврди општински мандат.",
            "CentarStory se objavljuje kao nezavisni atlas. Javni izvorni repozitorijum je github.com/AndrejWebWork/CentarStory. Ova napomena nije izvod iz trgovinskog registra i ne tvrdi opštinski mandat.",
            "CentarStory bağımsız bir atlas olarak yayımlanır. Kamuya açık kaynak deposu github.com/AndrejWebWork/CentarStory adresindedir. Bu uyarı ticaret sicili belgesi değildir ve belediye yetkisi iddia etmez.",
            "CentarStory публікується як незалежний атлас. Публічний репозиторій коду: github.com/AndrejWebWork/CentarStory. Це повідомлення не є витягом з торгового реєстру і не заявляє муніципального мандата.",
           "CentarStory botohet si atlas i pavarur. Depoja publike e burimit është github.com/AndrejWebWork/CentarStory. Ky njoftim nuk është ekstrakt i regjistrit të shoqërive dhe nuk pretendon një mandat komunal."),
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: L("Privacy policy", "Политика за приватност", "Politika privatnosti", "Gizlilik politikası", "Політика конфіденційності", "Politika e privatësisë"),
    kicker: L("Data", "Податоци", "Podaci", "Veri", "Дані", "Të dhënat"),
    lede: L(
      "CentarStory does not ask you to create an account. The site stores as little as it needs to remember your language and to run Scan.",
      "CentarStory не бара да направите сметка. Страницата чува само толку колку што треба за јазикот и за Скен.",
      "CentarStory ne traži da napravite nalog. Stranica čuva samo onoliko koliko treba za jezik i za Sken.",
      "CentarStory hesap açmanızı istemez. Site, dilinizi hatırlamak ve Tarama’yı çalıştırmak için gerekenin ötesini saklamaz.",
      "CentarStory не просить створювати обліковий запис. Сайт зберігає лише те, що потрібно для мови і Скену.",
     "CentarStory nuk ju kërkon të krijoni një llogari. Sajti ruan aq pak sa i duhet për të mbajtur mend gjuhën tuaj dhe për të ekzekutuar Scan."),
    sections: [
      {
        heading: L("What we process", "Што обработуваме", "Šta obrađujemo", "Neyi işleriz", "Що обробляємо", "Çfarë përpunojmë"),
        body: [
          L(
            "Language: a locale cookie named NEXT_LOCALE so the site opens in the language you last chose. Scan: the camera or an uploaded photograph, used only to match a monument in the atlas. In the default demo mode the photograph stays in this browser. If remote recognition is switched on for a deployment, that one request is sent to the configured vision provider and is not kept by CentarStory. A copy may sit in session storage so the story page can show the shot you just took; it leaves when the tab is closed. Maps may load tiles from OpenStreetMap and OpenFreeMap. Walking lines may be requested from a public OSRM pedestrian router.",
            "Јазик: колаче NEXT_LOCALE за да се отвори јазикот што последно го избравте. Скен: камера или прикачена фотографија, само за споредба со споменик од атласот. Во стандардниот демо режим фотографијата останува во овој прелистувач. Ако за една инсталација е вклучено далечинско препознавање, тоа барање оди кај поставениот давател и CentarStory не ја чува датотеката. Копија може да седи во session storage за приказната; исчезнува кога ќе се затвори јазичето. Картите може да влечат плочки од OpenStreetMap и OpenFreeMap. Пешачки линии може да се бараат од јавен OSRM пешачки рутер.",
            "Jezik: kolačić NEXT_LOCALE da se otvori jezik koji ste poslednji izabrali. Sken: kamera ili otpremljena fotografija, samo za poređenje sa spomenikom iz atlasa. U podrazumevanom demo režimu fotografija ostaje u ovom pregledaču. Ako je za instalaciju uključeno daljinsko prepoznavanje, taj zahtev ide podešenom davaocu i CentarStory ne čuva datoteku. Kopija može da sedi u session storage za priču; nestaje kad se zatvori jezičak. Mape mogu da vuku pločice sa OpenStreetMap i OpenFreeMap. Pešačke linije mogu da se traže od javnog OSRM pešačkog rutera.",
            "Dil: son seçtiğiniz dili açmak için NEXT_LOCALE çerezi. Tarama: yalnızca atlasdaki bir anıtla karşılaştırmak için kamera veya yüklenen fotoğraf. Varsayılan demo kipinde fotoğraf bu tarayıcıda kalır. Bir kurulumda uzaktan tanıma açıksa o istek yapılandırılmış sağlayıcıya gider ve CentarStory dosyayı tutmaz. Hikâye sayfası için kopya oturum deposunda durabilir; sekme kapanınca silinir. Haritalar OpenStreetMap ve OpenFreeMap karolarını çekebilir. Yürüme çizgileri kamuya açık OSRM yaya yönlendiricisinden istenebilir.",
            "Мова: файл cookie NEXT_LOCALE, щоб відкрити останню обрану мову. Скен: камера або завантажена світлина лише для порівняння з пам'яткою атласу. У стандартному деморежимі світлина лишається в цьому браузері. Якщо для встановлення ввімкнено віддалене розпізнавання, той запит іде до налаштованого надавача, і CentarStory файл не зберігає. Копія може бути в session storage для історії; зникає після закриття вкладки. Мапи можуть тягнути плитки з OpenStreetMap і OpenFreeMap. Пішохідні лінії можна запитувати в публічного OSRM-маршрутизатора.",
           "Gjuha: një kuki locale me emrin NEXT_LOCALE, që sajti të hapet në gjuhën që zgjodhët së fundmi. Scan: kamera ose një fotografi e ngarkuar, e përdorur vetëm për të përputhur një monument në atlas. Në mënyrën e paracaktuar demonstruese fotografia qëndron në këtë shfletues. Nëse njohja në distancë ndizet për një vendosje, ajo kërkesë e vetme dërgohet te ofruesi i konfiguruar i vizionit dhe nuk ruhet nga CentarStory. Një kopje mund të qëndrojë në ruajtjen e sesionit, që faqja e tregimit të tregojë shkrepjen që sapo bëtë; ajo largohet kur skeda mbyllet. Hartat mund të ngarkojnë pllaka nga OpenStreetMap dhe OpenFreeMap. Vijat e ecjes mund të kërkohen nga një rrugëzues publik këmbësor OSRM."),
        ],
      },
      {
        heading: L("What we do not collect", "Што не собираме", "Šta ne prikupljamo", "Neyi toplamayız", "Чого не збираємо", "Çfarë nuk mbledhim"),
        body: [
          L(
            "There is no user account, no newsletter signup, and no advertising tracker. The site does not set analytics cookies. Scan may ask the browser for your location once, only to improve a match, and only if you allow it. That reading is not stored. The walk guide can also read location while it is leading you, and it does not store it. A kitchen pin can open Google Maps walking directions, which is a separate site. Do not upload photographs of other people if you do not have a reason to do so.",
            "Нема корисничка сметка, пријава на билтен или рекламен следач. Страницата не поставува аналитички колачиња. Скен може еднаш да ја побара локацијата од прелистувачот, само за подобар споредбен резултат и само ако дозволите. Тоа читање не се чува. Водењето по рутата исто може да ја чита локацијата додека те води, и не ја чува. Пин на кујна може да отвори пешачка насока во Google Maps, што е друга страница. Не прикачувајте фотографии од други луѓе без причина.",
            "Nema korisničkog naloga, prijave na bilten ni reklamnog pratioca. Stranica ne postavlja analitičke kolačiće. Sken može jednom da zatraži lokaciju od pregledača, samo radi boljeg poređenja i samo ako dozvolite. To čitanje se ne čuva. Vođenje po ruti takođe može da čita lokaciju dok te vodi, i ne čuva je. Pin kuhinje može da otvori pešački pravac u Google Maps, što je drugi sajt. Ne otpremajte fotografije drugih ljudi bez razloga.",
            "Hesap, bülten kaydı veya reklam izleyicisi yoktur. Site analitik çerez koymaz. Tarama, yalnızca eşleşmeyi iyileştirmek için ve yalnızca izin verirseniz tarayıcıdan bir kez konum isteyebilir. Bu okuma saklanmaz. Rota yönlendirmesi seni götürürken konumu da okuyabilir ve saklamaz. Bir mutfak iğnesi, ayrı bir site olan Google Maps’te yürüyüş tarifi açabilir. Gerekçeniz yoksa başka insanların fotoğrafını yüklemeyin.",
            "Нема облікового запису, підписки на розсилку чи рекламного трекера. Сайт не ставить аналітичних файлів cookie. Скен може один раз запитати місцезнаходження в браузера, лише щоб поліпшити збіг і лише якщо ви дозволите. Це читання не зберігається. Ведення маршрутом також може читати місцезнаходження, поки веде, і не зберігає його. Позначка кухні може відкрити піший маршрут у Google Maps, а це інший сайт. Не завантажуйте світлини інших людей без підстави.",
           "Nuk ka llogari përdoruesi, as regjistrim në buletin, as gjurmues reklame. Sajti nuk vendos kuki analitike. Scan mund ta kërkojë një herë vendndodhjen nga shfletuesi, vetëm për ta përmirësuar përputhjen dhe vetëm nëse e lejoni. Ky lexim nuk ruhet. Udhëheqja e rrugës mund ta lexojë vendndodhjen gjatë kohës që të udhëheq, dhe nuk e ruan. Një pin kuzhine mund të hapë drejtim në këmbë te Google Maps, që është një sajt tjetër. Mos ngarkoni fotografi të personave të tjerë nëse nuk keni një arsye."),
        ],
      },
      {
        heading: L("Your choices", "Вашите избори", "Vaši izbori", "Seçimleriniz", "Ваші вибори", "Zgjedhjet tuaja"),
        body: [
          L(
            "You can refuse the camera and use the catalog instead. You can clear site data in the browser to drop the locale cookie and any stored scan shot. Third-party sites you open from here (JSP, app stores, official event pages) have their own policies.",
            "Камерата може да ја одбиете и да го користите каталогот. Податоците на страницата во прелистувачот ги бришете заедно со јазичното колаче и снимениот кадар. Надворешните страници што ги отворате оттука (ЈСП, продавници за апликации, службени настани) имаат свои правила.",
            "Kameru možete odbiti i koristiti katalog. Podatke sajta u pregledaču brišete zajedno sa jezičkim kolačićem i snimljenim kadrom. Spoljne stranice koje otvorite odavde (JSP, prodavnice aplikacija, zvanični događaji) imaju svoja pravila.",
            "Kamerayı reddedip kataloğu kullanabilirsiniz. Tarayıcıdaki site verisini silerek dil çerezini ve kayıtlı tarama karesini kaldırırsınız. Buradan açtığınız üçüncü taraf sitelerin (JSP, uygulama mağazaları, resmi etkinlik sayfaları) kendi politikaları vardır.",
            "Камеру можна відхилити і користуватися каталогом. Дані сайту в браузері стираються разом із мовним cookie і збереженим кадром. Сторонні сайти, які ви відкриваєте звідси (JSP, крамниці додатків, офіційні події), мають власні політики.",
           "Mund ta refuzoni kamerën dhe të përdorni katalogun. Mund t'i pastroni të dhënat e sajtit në shfletues për të hequr kukinë e lokalitetit dhe çdo shkrepje të ruajtur të skanimit. Sajtet e palëve të treta që hapni nga këtu (JSP, dyqanet e aplikacioneve, faqet zyrtare të ngjarjeve) kanë politikat e tyre."),
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: L("Terms of use", "Услови за користење", "Uslovi korišćenja", "Kullanım koşulları", "Умови використання", "Kushtet e përdorimit"),
    kicker: L("Use of the atlas", "Користење на атласот", "Korišćenje atlasa", "Atlasın kullanımı", "Користування атласом", "Përdorimi i atlasit"),
    lede: L(
      "By using CentarStory you accept that the atlas is a guide, not a contract for travel, tickets, or food.",
      "Со користење на CentarStory прифаќате дека атласот е водич, не договор за патување, билети или храна.",
      "Korišćenjem CentarStory prihvatate da je atlas vodič, ne ugovor o putovanju, kartama ili hrani.",
      "CentarStory’yi kullanarak atlasın bir rehber olduğunu, seyahat, bilet veya yemek sözleşmesi olmadığını kabul etmiş olursunuz.",
      "Користуючись CentarStory, ви приймаєте, що атлас є гідом, а не договором на подорож, квитки чи їжу.",
     "Duke përdorur CentarStory pranoni se atlasi është një udhërrëfyes, jo një kontratë për udhëtim, bileta apo ushqim."),
    sections: [
      {
        heading: L("No official mandate", "Без службен мандат", "Bez zvaničnog mandata", "Resmi yetki yok", "Без офіційного мандата", "Pa mandat zyrtar"),
        body: [
          L(
            "The Municipality of Centar, the City of Skopje, JSP Skopje, museums, and restaurants are not operators of this site unless a page says otherwise. Their names appear because the record cites them.",
            "Општина Центар, Град Скопје, ЈСП Скопје, музеите и рестораните не се оператори на оваа страница освен ако страницата не каже поинаку. Имињата се појавуваат затоа што записот ги цитира.",
            "Opština Centar, Grad Skoplje, JSP Skoplje, muzeji i restorani nisu operatori ovog sajta osim ako stranica ne kaže drugačije. Imena se pojavljuju zato što ih zapis citira.",
            "Centar Belediyesi, Üsküp kenti, JSP Üsküp, müzeler ve restoranlar, sayfa aksini söylemedikçe bu sitenin işletmecisi değildir. Adları, kayıt onları andığı için görünür.",
            "Громада Центар, місто Скоп'є, JSP Скоп'є, музеї й ресторани не є операторами цього сайту, якщо сторінка не каже інакше. Їхні назви з'являються, бо запис їх цитує.",
           "Komuna e Qendrës, Qyteti i Shkupit, JSP Shkup, muzetë dhe restorantet nuk janë operatorë të këtij sajti, përveç nëse një faqe thotë ndryshe. Emrat e tyre shfaqen sepse regjistrimi i citon."),
        ],
      },
      {
        heading: L("Accuracy", "Точност", "Tačnost", "Doğruluk", "Точність", "Saktësia"),
        body: [
          L(
            "Hours, menus, fares, and event dates change. Confirm them on the official page or at the door before you travel. Walking times are flat estimates. Scan is a helper, not a proof of identity of a building.",
            "Часовите, менијата, цените и датумите на настани се менуваат. Потврдете ги на службената страница или на врата пред да тргнете. Времињата на пешачење се рамни процени. Скен е помош, не доказ за идентитет на зграда.",
            "Sati, meniji, cene i datumi događaja se menjaju. Potvrdite ih na zvaničnoj stranici ili na vratima pre puta. Vremena hoda su ravne procene. Sken je pomoć, ne dokaz identiteta zgrade.",
            "Saatler, menüler, ücretler ve etkinlik tarihleri değişir. Yola çıkmadan resmi sayfada veya kapıda doğrulayın. Yürüme süreleri düz tahminlerdir. Tarama bir yardımcıdır, bir yapının kimliğinin kanıtı değildir.",
            "Години, меню, тарифи й дати подій змінюються. Підтверджуйте їх на офіційній сторінці або на дверях перед виходом. Час ходи — плоскі оцінки. Скен є допомогою, не доказом тотожності будівлі.",
           "Oraret, menytë, tarifat dhe datat e ngjarjeve ndryshojnë. Konfirmojini në faqen zyrtare ose te dera para se të udhëtoni. Kohët e ecjes janë vlerësime të rrafshëta. Scan është një ndihmës, jo një provë e identitetit të një ndërtese."),
        ],
      },
      {
        heading: L("Your conduct", "Ваше однесување", "Vaše ponašanje", "Sizin davranışınız", "Ваша поведінка", "Sjellja juaj"),
        body: [
          L(
            "Do not use Scan to photograph people without a lawful reason. Do not treat the atlas as a live bus feed or as a complete register of every plaque or kitchen in Centar. Reuse of text and photographs must respect the credits and licences printed on the source.",
            "Не користете Скен за фотографирање луѓе без законска причина. Не третирајте го атласот како жив автобуски канал или како целосен регистар на секоја плоча или кујна во Центар. Повторната употреба на текст и фотографии мора да ги почитува кредитите и лиценците на изворот.",
            "Ne koristite Sken za fotografisanje ljudi bez zakonskog razloga. Ne tretirajte atlas kao živi autobuski kanal ili kao potpun registar svake ploče ili kuhinje u Centru. Ponovna upotreba teksta i fotografija mora poštovati kredite i licence izvora.",
            "Yasal bir nedeniniz yoksa Tarama’yı insan fotoğraflamak için kullanmayın. Atlası canlı otobüs yayını veya Centar’daki her plakanın ya da mutfağın tam sicili gibi görmeyin. Metin ve fotoğrafların yeniden kullanımı kaynaktaki kredi ve lisanslara uymalıdır.",
            "Не використовуйте Скен для фотографування людей без законної підстави. Не трактуйте атлас як живий автобусний канал або як повний реєстр кожної таблички чи кухні в Центрі. Повторне використання тексту й світлин має поважати кредити й ліцензії джерела.",
           "Mos e përdorni Scan për të fotografuar njerëz pa një arsye të ligjshme. Mos e trajtoni atlasin si një rrjedhë të drejtpërdrejtë autobusësh ose si një regjistër të plotë të çdo pllake ose kuzhine në Qendër. Ripërdorimi i tekstit dhe i fotografive duhet të respektojë kreditet dhe licencat e shtypura në burim."),
        ],
      },
      {
        heading: L("Cookies", "Колачиња", "Kolačići", "Çerezler", "Файли cookie", "Kuki"),
        body: [
          L(
            "A cookie notice is required. It stays on screen until you accept it. Accepting stores the centarstory_consent cookie and confirms that you have read these terms and the cookie policy. NEXT_LOCALE may already be set so the language you chose is kept. There are no advertising cookies.",
            "Напомената за колачиња е задолжителна. Останува на екранот додека не ја прифатите. Прифаќањето го чува колачето centarstory_consent и потврдува дека ги прочитавте овие услови и политиката за колачиња. NEXT_LOCALE може веќе да е поставено за да се задржи јазикот што го избравте. Нема рекламни колачиња.",
            "Obaveštenje o kolačićima je obavezno. Ostaje na ekranu dok ga ne prihvatite. Prihvatanje čuva kolačić centarstory_consent i potvrđuje da ste pročitali ove uslove i politiku kolačića. NEXT_LOCALE može već da bude postavljen da se zadrži jezik koji ste izabrali. Nema reklamnih kolačića.",
            "Çerez uyarısı zorunludur. Kabul edene kadar ekranda kalır. Kabul, centarstory_consent çerezini saklar ve bu koşulları ile çerez politikasını okuduğunuzu doğrular. Seçtiğiniz dil kalsın diye NEXT_LOCALE önceden konmuş olabilir. Reklam çerezi yoktur.",
            "Повідомлення про cookie є обов'язковим. Воно лишається на екрані, доки ви його не приймете. Прийняття зберігає cookie centarstory_consent і підтверджує, що ви прочитали ці умови та політику cookie. NEXT_LOCALE може вже бути встановлено, щоб зберегти обрану мову. Рекламних cookie немає.",
           "Njoftimi i kukive është i detyrueshëm. Qëndron në ekran derisa ta pranoni. Pranimi ruan kukinë centarstory_consent dhe konfirmon se i keni lexuar këto kushte dhe politikën e kukive. NEXT_LOCALE mund të jetë vendosur tashmë që të mbahet gjuha që zgjodhët. Nuk ka kuki reklamash."),
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: L("Cookie policy", "Политика за колачиња", "Politika kolačića", "Çerez politikası", "Політика файлів cookie", "Politika e kukive"),
    kicker: L("Cookies", "Колачиња", "Kolačići", "Çerezler", "Файли cookie", "Kuki"),
    lede: L(
      "CentarStory requires a cookie notice. Accepting it stores two first-party cookies: one for language and one to remember that you accepted. There are no advertising cookies.",
      "CentarStory бара напомена за колачиња. Прифаќањето чува две сопствени колачиња: едно за јазик и едно за да се запомни дека сте прифатиле. Нема рекламни колачиња.",
      "CentarStory traži obaveštenje o kolačićima. Prihvatanje čuva dva sopstvena kolačića: jedan za jezik i jedan da se zapamti da ste prihvatili. Nema reklamnih kolačića.",
      "CentarStory bir çerez uyarısı ister. Kabul, iki birinci taraf çerezi saklar: biri dil için, biri kabul ettiğinizi hatırlamak için. Reklam çerezi yoktur.",
      "CentarStory вимагає повідомлення про cookie. Прийняття зберігає два власні файли cookie: один для мови і один, щоб запам'ятати, що ви прийняли. Рекламних cookie немає.",
     "CentarStory kërkon një njoftim kukish. Pranimi ruan dy kuki të palës së parë: një për gjuhën dhe një për të mbajtur mend se keni pranuar. Nuk ka kuki reklamash."),
    sections: [
      {
        heading: L("NEXT_LOCALE", "NEXT_LOCALE", "NEXT_LOCALE", "NEXT_LOCALE", "NEXT_LOCALE", "NEXT_LOCALE"),
        body: [
          L(
            "Name: NEXT_LOCALE. Purpose: keep the interface in English, Macedonian, Serbian, Turkish, Ukrainian, or Albanian after you switch language. Duration: up to one year. SameSite: Lax. The cookie is set by this site, not by an advertiser. It is necessary for the language you chose.",
            "Име: NEXT_LOCALE. Цел: интерфејсот да остане на англиски, македонски, српски, турски, украински или албански откако ќе смените јазик. Траење: до една година. SameSite: Lax. Колачето го поставува оваа страница, не рекламер. Потребно е за јазикот што го избравте.",
            "Ime: NEXT_LOCALE. Svrha: da interfejs ostane na engleskom, makedonskom, srpskom, turskom, ukrajinskom ili albanskom pošto promenite jezik. Trajanje: do jedne godine. SameSite: Lax. Kolačić postavlja ovaj sajt, ne oglašivač. Potreban je za jezik koji ste izabrali.",
            "Ad: NEXT_LOCALE. Amaç: dil değiştirdikten sonra arayüzün İngilizce, Makedonca, Sırpça, Türkçe, Ukraynaca veya Arnavutça kalması. Süre: bir yıla kadar. SameSite: Lax. Çerezi bu site koyar, bir reklamveren değil. Seçtiğiniz dil için gereklidir.",
            "Назва: NEXT_LOCALE. Мета: щоб інтерфейс лишався англійською, македонською, сербською, турецькою, українською або албанською після зміни мови. Тривалість: до одного року. SameSite: Lax. Файл ставить цей сайт, не рекламодавець. Він потрібен для мови, яку ви обрали.",
           "Emri: NEXT_LOCALE. Qëllimi: ta mbajë ndërfaqen në anglisht, maqedonisht, serbisht, turqisht, ukrainisht ose shqip pasi të ndërroni gjuhën. Kohëzgjatja: deri në një vit. SameSite: Lax. Kukia vendoset nga ky sajt, jo nga një reklamues. Është e nevojshme për gjuhën që zgjodhët."),
        ],
      },
      {
        heading: L("centarstory_consent", "centarstory_consent", "centarstory_consent", "centarstory_consent", "centarstory_consent", "centarstory_consent"),
        body: [
          L(
            "Name: centarstory_consent. Purpose: remember that you accepted the cookie notice and these terms. Duration: one year. SameSite: Lax. Value: 1. It is set only when you press Accept. It is a first-party cookie, not an advertising cookie. The notice stays until this cookie exists.",
            "Име: centarstory_consent. Цел: да се запомни дека ја прифативте напомената за колачиња и овие услови. Траење: една година. SameSite: Lax. Вредност: 1. Се поставува само кога ќе притиснете Прифати. Тоа е сопствено колаче, не рекламно. Напомената останува додека го нема ова колаче.",
            "Ime: centarstory_consent. Svrha: da se zapamti da ste prihvatili obaveštenje o kolačićima i ove uslove. Trajanje: jedna godina. SameSite: Lax. Vrednost: 1. Postavlja se samo kad pritisnete Prihvati. To je sopstveni kolačić, ne reklamni. Obaveštenje ostaje dok ovog kolačića nema.",
            "Ad: centarstory_consent. Amaç: çerez uyarısını ve bu koşulları kabul ettiğinizi hatırlamak. Süre: bir yıl. SameSite: Lax. Değer: 1. Yalnızca Kabul et’e basınca konur. Birinci taraf çerezidir, reklam çerezi değildir. Bu çerez yokken uyarı durur.",
            "Назва: centarstory_consent. Мета: запам'ятати, що ви прийняли повідомлення про cookie і ці умови. Тривалість: один рік. SameSite: Lax. Значення: 1. Ставиться лише коли ви натискаєте Прийняти. Це власний файл cookie, не рекламний. Повідомлення лишається, доки цього cookie немає.",
           "Emri: centarstory_consent. Qëllimi: të mbahet mend se e keni pranuar njoftimin e kukive dhe këto kushte. Kohëzgjatja: një vit. SameSite: Lax. Vlera: 1. Vendoset vetëm kur shtypni Prano. Është kuki e palës së parë, jo kuki reklame. Njoftimi qëndron derisa të ekzistojë kjo kuki."),
        ],
      },
      {
        heading: L("Other storage", "Друго складирање", "Drugo skladištenje", "Diğer depolama", "Інше зберігання", "Ruajtje tjetër"),
        body: [
          L(
            "Scan may keep a photograph in session storage for the current tab only. Map libraries may keep technical cache in the browser. Clearing site data in the browser settings removes the cookie and that cache.",
            "Скен може да чува фотографија во session storage само за тековното јазиче. Библиотеките за карта може да чуваат технички кеш. Бришењето на податоците на страницата ги отстранува колачето и тој кеш.",
            "Sken može da čuva fotografiju u session storage samo za tekući jezičak. Biblioteke mape mogu da čuvaju tehnički keš. Brisanje podataka sajta uklanja kolačić i taj keš.",
            "Tarama, yalnızca açık sekme için oturum deposunda bir fotoğraf tutabilir. Harita kütüphaneleri teknik önbellek tutabilir. Site verisini silmek çerezi ve o önbelleği kaldırır.",
            "Скен може зберігати світлину в session storage лише для поточної вкладки. Бібліотеки мапи можуть тримати технічний кеш. Очищення даних сайту прибирає cookie і той кеш.",
           "Scan mund të mbajë një fotografi në ruajtjen e sesionit vetëm për skedën e tanishme. Bibliotekat e hartave mund të mbajnë cache teknik në shfletues. Pastrimi i të dhënave të sajtit te cilësimet e shfletuesit heq kukinë dhe atë cache."),
        ],
      },
      {
        heading: L("Required notice", "Задолжителна напомена", "Obavezno obaveštenje", "Zorunlu uyarı", "Обов'язкове повідомлення", "Njoftim i detyrueshëm"),
        body: [
          L(
            "The notice at the bottom of the site is required. It leaves only after you accept. Accept writes centarstory_consent. If the browser blocks cookies, the notice returns and the language may fall back to English. Map tiles still load from OpenFreeMap and OpenStreetMap, and a kitchen pin can open Google Maps. Those services are not this site's cookies.",
            "Напомената на дното на страницата е задолжителна. Се трга само откако ќе прифатите. Прифати го запишува centarstory_consent. Ако прелистувачот ги блокира колачињата, напомената се враќа и јазикот може да падне на англиски. Плочките на картата и понатаму се влечат од OpenFreeMap и OpenStreetMap, а пин на кујна може да отвори Google Maps. Тие услуги не се колачиња на оваа страница.",
            "Obaveštenje na dnu stranice je obavezno. Sklanja se tek pošto prihvatite. Prihvati upisuje centarstory_consent. Ako pregledač blokira kolačiće, obaveštenje se vraća i jezik može da padne na engleski. Pločice mape i dalje dolaze sa OpenFreeMap i OpenStreetMap, a pin kuhinje može da otvori Google Maps. Te usluge nisu kolačići ovog sajta.",
            "Sitenin altındaki uyarı zorunludur. Yalnızca kabul edince kalkar. Kabul et, centarstory_consent yazar. Tarayıcı çerezleri engellerse uyarı geri gelir ve dil İngilizceye düşebilir. Harita karoları yine OpenFreeMap ve OpenStreetMap’ten gelir; bir mutfak iğnesi Google Maps açabilir. Bu hizmetler bu sitenin çerezleri değildir.",
            "Повідомлення внизу сайту є обов'язковим. Воно зникає лише після прийняття. Прийняти записує centarstory_consent. Якщо браузер блокує cookie, повідомлення повертається, а мова може повернутися до англійської. Плитки мапи й далі йдуть з OpenFreeMap і OpenStreetMap, а позначка кухні може відкрити Google Maps. Ці сервіси не є cookie цього сайту.",
           "Njoftimi në fund të sajtit është i detyrueshëm. Hiqet vetëm pasi të pranoni. Prano shkruan centarstory_consent. Nëse shfletuesi i bllokon kukitë, njoftimi kthehet dhe gjuha mund të bjerë te anglishtja. Pllakat e hartës vazhdojnë të vijnë nga OpenFreeMap dhe OpenStreetMap, dhe një pin kuzhine mund të hapë Google Maps. Ato shërbime nuk janë kukitë e këtij sajti."),
        ],
      },
    ],
  },
  {
    slug: "impressum",
    title: L("Impressum", "Импресум", "Impresum", "Künye", "Імпресум", "Impresum"),
    kicker: L("Origin", "Потекло", "Poreklo", "Köken", "Походження", "Origjina"),
    lede: L(
      "The idea for CentarStory came from ЛАПСИ, a youth programme of the Ohrid Institute. This atlas is not the municipality’s website.",
      "Идејата за CentarStory дојде од ЛАПСИ, младинска програма на Институт Охрид. Овој атлас не е страница на општината.",
      "Ideja za CentarStory došla je iz LAPSI, omladinskog programa Instituta Ohrid. Ovaj atlas nije stranica opštine.",
      "CentarStory fikri, Ohrid Enstitüsü’nün gençlik programı LAPSI’den geldi. Bu atlas belediyenin sitesi değildir.",
      "Ідея CentarStory прийшла з ЛАПСИ, молодіжної програми Інституту Охрид. Цей атлас не є сайтом громади.",
     "Ideja për CentarStory erdhi nga LAPSI, një program rinor i Institutit të Ohrit. Ky atlas nuk është faqja e komunës."),
    sections: [
      {
        heading: L("Where the idea came from", "Од каде дојде идејата", "Odakle je došla ideja", "Fikir nereden geldi", "Звідки прийшла ідея", "Nga erdhi ideja"),
        body: [
          L(
            "The idea came from ЛАПСИ — Local Active Platforms for Social Innovations (Локални активни платформи за социјални иновации). Municipal calls describe it as a project carried out by the Institute for Economic Strategies and International Relations Ohrid (Институт Охрид, oi.org.mk). It sits inside the regional programme BOOST, coordinated by ALDA — European Association for Local Democracy, with financial support from the French Development Agency (Agence Française de Développement). Teams in that programme research a local problem and pitch an idea for their own community. This page records that origin. It does not claim a prize, and it does not say the municipality publishes CentarStory.",
            "Идејата дојде од ЛАПСИ — Локални активни платформи за социјални иновации. Општинските повици го опишуваат како проект што го спроведува Институтот за економски стратегии и меѓународни односи Охрид (Институт Охрид, oi.org.mk). Стои во регионалната програма BOOST, координирана од ALDA — European Association for Local Democracy, со финансиска поддршка од Француската агенција за развој (Agence Française de Développement). Тимовите во таа програма истражуваат локален проблем и ја претставуваат идејата за својата заедница. Оваа страница го бележи тоа потекло. Не тврди награда и не вели дека општината го издава CentarStory.",
            "Ideja je došla iz LAPSI — Lokalne aktivne platforme za socijalne inovacije (Локални активни платформи за социјални иновации). Opštinski pozivi ga opisuju kao projekat koji sprovodi Institut za ekonomske strategije i međunarodne odnose Ohrid (Institut Ohrid, oi.org.mk). Stoji u regionalnom programu BOOST, koji koordinira ALDA — European Association for Local Democracy, uz finansijsku podršku Francuske agencije za razvoj (Agence Française de Développement). Timovi u tom programu istražuju lokalni problem i predstavljaju ideju za svoju zajednicu. Ova stranica beleži to poreklo. Ne tvrdi nagradu i ne kaže da opština izdaje CentarStory.",
            "Fikir, LAPSI — Yerel Aktif Sosyal İnovasyon Platformları’ndan (Локални активни платформи за социјални иновации) geldi. Belediye çağrıları bunu, Ekonomik Stratejiler ve Uluslararası İlişkiler Ohrid Enstitüsü’nün (Институт Охрид, oi.org.mk) yürüttüğü bir proje olarak anlatır. ALDA — European Association for Local Democracy’nin koordine ettiği, Fransız Kalkınma Ajansı’nın (Agence Française de Développement) mali destek verdiği bölgesel BOOST programının içindedir. Ekipler yerel bir sorunu araştırır ve kendi toplulukları için bir fikir sunar. Bu sayfa o kökeni kaydeder. Bir ödül iddia etmez ve belediyenin CentarStory’yi yayımladığını söylemez.",
            "Ідея прийшла з ЛАПСИ — Локальних активних платформ соціальних інновацій (Локални активни платформи за социјални иновации). Муніципальні оголошення описують її як проєкт, який проводить Інститут економічних стратегій і міжнародних відносин Охрид (Інститут Охрид, oi.org.mk). Він входить до регіональної програми BOOST, яку координує ALDA — European Association for Local Democracy, за фінансової підтримки Французького агентства розвитку (Agence Française de Développement). Команди в тій програмі досліджують місцеву проблему і представляють ідею для своєї громади. Ця сторінка фіксує те походження. Вона не заявляє нагороди і не каже, що громада видає CentarStory.",
           "Ideja erdhi nga LAPSI — Platformat Lokale Aktive për Inovacione Sociale (Локални активни платформи за социјални иновации). Thirrjet komunale e përshkruajnë si projekt që e zbaton Instituti për Strategji Ekonomike dhe Marrëdhënie Ndërkombëtare Ohër (Институт Охрид, oi.org.mk). Qëndron brenda programit rajonal BOOST, të koordinuar nga ALDA — European Association for Local Democracy, me mbështetje financiare nga Agjencia Franceze për Zhvillim (Agence Française de Développement). Ekipet në atë program hulumtojnë një problem lokal dhe e paraqesin idenë për bashkësinë e tyre. Kjo faqe e regjistron atë origjinë. Nuk pretendon një çmim dhe nuk thotë se komuna e boton CentarStory."),
        ],
      },
      {
        heading: L("This site", "Оваа страница", "Ova stranica", "Bu site", "Цей сайт", "Ky sajt"),
        body: [
          L(
            "CentarStory is an independent cultural atlas of the Municipality of Centar in Skopje. The public source repository is github.com/AndrejWebWork/CentarStory. The institute’s own site is oi.org.mk. The BOOST programme is described at alda-europe.eu/boost.",
            "CentarStory е независен културен атлас на Општина Центар во Скопје. Јавниот изворен репозиториум е github.com/AndrejWebWork/CentarStory. Страницата на институтот е oi.org.mk. Програмата BOOST е опишана на alda-europe.eu/boost.",
            "CentarStory je nezavisni kulturni atlas Opštine Centar u Skoplju. Javni izvorni repozitorijum je github.com/AndrejWebWork/CentarStory. Stranica instituta je oi.org.mk. Program BOOST opisan je na alda-europe.eu/boost.",
            "CentarStory, Üsküp’teki Centar Belediyesi’nin bağımsız kültür atlasıdır. Kamuya açık kaynak deposu github.com/AndrejWebWork/CentarStory adresindedir. Enstitünün sitesi oi.org.mk adresindedir. BOOST programı alda-europe.eu/boost adresinde anlatılır.",
            "CentarStory — незалежний культурний атлас громади Центар у Скоп'є. Публічний репозиторій: github.com/AndrejWebWork/CentarStory. Сайт інституту: oi.org.mk. Програму BOOST описано на alda-europe.eu/boost.",
           "CentarStory është një atlas kulturor i pavarur i Komunës së Qendrës në Shkup. Depoja publike e burimit është github.com/AndrejWebWork/CentarStory. Faqja e institutit është oi.org.mk. Programi BOOST përshkruhet te alda-europe.eu/boost."),
        ],
      },
      {
        heading: L("Municipal contact", "Општински контакт", "Opštinski kontakt", "Belediye iletişimi", "Контакт громади", "Kontakti komunal"),
        body: [
          L(
            "The contact in the footer is the one the Municipality of Centar publishes at centar.gov.mk/kontakt: Mihail Cokov 1, Skopje; +389 2 3203 693; +389 2 3203 600; kontakt@centar.gov.mk. A message to that address reaches the municipality, not the publisher of this atlas.",
            "Контактот во подножјето е оној што Општина Центар го објавува на centar.gov.mk/kontakt: ул. Михаил Цоков бр. 1, Скопје; +389 2 3203 693; +389 2 3203 600; kontakt@centar.gov.mk. Порака на таа адреса стигнува до општината, не до издавачот на овој атлас.",
            "Kontakt u podnožju je onaj koji Opština Centar objavljuje na centar.gov.mk/kontakt: ul. Mihail Cokov br. 1, Skoplje; +389 2 3203 693; +389 2 3203 600; kontakt@centar.gov.mk. Poruka na tu adresu stiže do opštine, ne do izdavača ovog atlasa.",
            "Sayfa altındaki iletişim, Centar Belediyesi’nin centar.gov.mk/kontakt adresinde yayımladığı kayıttır: Mihail Cokov No. 1, Üsküp; +389 2 3203 693; +389 2 3203 600; kontakt@centar.gov.mk. O adrese giden ileti belediyeye ulaşır, bu atlasın yayımcısına değil.",
            "Контакт у підвалі — той, який громада Центар публікує на centar.gov.mk/kontakt: вул. Михаїл Цоков 1, Скоп'є; +389 2 3203 693; +389 2 3203 600; kontakt@centar.gov.mk. Повідомлення на цю адресу доходить до громади, не до видавця цього атласу.",
           "Kontakti në fund është ai që Komuna e Qendrës e publikon te centar.gov.mk/kontakt: rr. Mihail Cokov nr. 1, Shkup; +389 2 3203 693; +389 2 3203 600; kontakt@centar.gov.mk. Një mesazh në atë adresë i arrin komunës, jo botuesit të këtij atlasi."),
        ],
      },
    ],
  },
];

export function getLegalDocument(slug: string) {
  return legalDocuments.find((document) => document.slug === slug);
}
