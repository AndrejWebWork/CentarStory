import { L } from "@/content/copy";
import type { Copy } from "@/content/types";

export const LEGAL_UPDATED = "2026-10-30";

export type LegalSlug = "legal" | "privacy" | "terms" | "cookies";

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
            "There is no user account, no newsletter signup, and no advertising tracker on this site. The codebase does not set analytics cookies. Location is not read on the public pages now in the app. Do not upload photographs of other people if you do not have a reason to do so.",
            "Нема корисничка сметка, пријава на билтен или рекламен следач. Кодот не поставува аналитички колачиња. Локацијата не се чита на јавните страници што сега се во апликацијата. Не прикачувајте фотографии од други луѓе без причина.",
            "Nema korisničkog naloga, prijave na bilten ni reklamnog pratioca. Kod ne postavlja analitičke kolačiće. Lokacija se ne čita na javnim stranicama koje su sada u aplikaciji. Ne otpremajte fotografije drugih ljudi bez razloga.",
            "Hesap, bülten kaydı veya reklam izleyicisi yoktur. Kod analitik çerezi koymaz. Konum, uygulamadaki mevcut genel sayfalarda okunmaz. Gerekçeniz yoksa başka insanların fotoğrafını yüklemeyin.",
            "Нема облікового запису, підписки на розсилку чи рекламного трекера. Код не ставить аналітичних файлів cookie. Геолокацію на поточних публічних сторінках застосунку не читають. Не завантажуйте світлини інших людей без підстави.",
           "Nuk ka llogari përdoruesi, as regjistrim në buletin, as gjurmues reklame në këtë sajt. Baza e kodit nuk vendos kuki analitike. Vendndodhja nuk lexohet në faqet publike që janë tani në aplikacion. Mos ngarkoni fotografi të personave të tjerë nëse nuk keni një arsye për ta bërë këtë."),
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
            "Do not use Scan to photograph people without a lawful reason. Do not treat the atlas as a live bus feed or as a complete register of every plaque in Centar. Reuse of text and photographs must respect the credits and licences printed on the source.",
            "Не користете Скен за фотографирање луѓе без законска причина. Не третирајте го атласот како жив автобуски канал или како целосен регистар на секоја плоча во Центар. Повторната употреба на текст и фотографии мора да ги почитува кредитите и лиценците на изворот.",
            "Ne koristite Sken za fotografisanje ljudi bez zakonskog razloga. Ne tretirajte atlas kao živi autobuski kanal ili kao potpun registar svake ploče u Centru. Ponovna upotreba teksta i fotografija mora poštovati kredite i licence izvora.",
            "Yasal bir nedeniniz yoksa Tarama’yı insan fotoğraflamak için kullanmayın. Atlası canlı otobüs yayını veya Centar’daki her plakanın tam sicili gibi görmeyin. Metin ve fotoğrafların yeniden kullanımı kaynaktaki kredi ve lisanslara uymalıdır.",
            "Не використовуйте Скен для фотографування людей без законної підстави. Не трактуйте атлас як живий автобусний канал або як повний реєстр кожної таблички в Центрі. Повторне використання тексту й світлин має поважати кредити й ліцензії джерела.",
           "Mos e përdorni Scan për të fotografuar njerëz pa një arsye të ligjshme. Mos e trajtoni atlasin si një rrjedhë të drejtpërdrejtë autobusësh ose si një regjistër të plotë të çdo pllake në Qendër. Ripërdorimi i tekstit dhe i fotografive duhet të respektojë kreditet dhe licencat e shtypura në burim."),
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: L("Cookie policy", "Политика за колачиња", "Politika kolačića", "Çerez politikası", "Політика файлів cookie", "Politika e kukive"),
    kicker: L("Cookies", "Колачиња", "Kolačići", "Çerezler", "Файли cookie", "Kuki"),
    lede: L(
      "CentarStory sets one first-party cookie to remember language. It does not set advertising cookies.",
      "CentarStory поставува едно сопствено колаче за да го запомни јазикот. Не поставува рекламни колачиња.",
      "CentarStory postavlja jedan sopstveni kolačić da zapamti jezik. Ne postavlja reklamne kolačiće.",
      "CentarStory dili hatırlamak için tek bir birinci taraf çerezi koyar. Reklam çerezi koymaz.",
      "CentarStory ставить один власний файл cookie, щоб запам'ятати мову. Рекламних cookie немає.",
     "CentarStory vendos një kuki të palës së parë për të mbajtur mend gjuhën. Nuk vendos kuki reklamash."),
    sections: [
      {
        heading: L("NEXT_LOCALE", "NEXT_LOCALE", "NEXT_LOCALE", "NEXT_LOCALE", "NEXT_LOCALE", "NEXT_LOCALE"),
        body: [
          L(
            "Name: NEXT_LOCALE. Purpose: keep the interface in English, Macedonian, Serbian, Turkish, or Ukrainian after you switch language. Duration: up to one year. SameSite: Lax. The cookie is set by this site, not by an advertiser.",
            "Име: NEXT_LOCALE. Цел: интерфејсот да остане на англиски, македонски, српски, турски или украински откако ќе смените јазик. Траење: до една година. SameSite: Lax. Колачето го поставува оваа страница, не рекламер.",
            "Ime: NEXT_LOCALE. Svrha: da interfejs ostane na engleskom, makedonskom, srpskom, turskom ili ukrajinskom pošto promenite jezik. Trajanje: do jedne godine. SameSite: Lax. Kolačić postavlja ovaj sajt, ne oglašivač.",
            "Ad: NEXT_LOCALE. Amaç: dil değiştirdikten sonra arayüzün İngilizce, Makedonca, Sırpça, Türkçe veya Ukraynaca kalması. Süre: bir yıla kadar. SameSite: Lax. Çerezi bu site koyar, bir reklamveren değil.",
            "Назва: NEXT_LOCALE. Мета: щоб інтерфейс лишався англійською, македонською, сербською, турецькою або українською після зміни мови. Тривалість: до одного року. SameSite: Lax. Файл ставить цей сайт, не рекламодавець.",
           "Emri: NEXT_LOCALE. Qëllimi: ta mbajë ndërfaqen në anglisht, maqedonisht, serbisht, turqisht ose ukrainisht pasi të ndërroni gjuhën. Kohëzgjatja: deri në një vit. SameSite: Lax. Kukia vendoset nga ky sajt, jo nga një reklamues."),
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
        heading: L("How to refuse", "Како да одбиете", "Kako da odbijete", "Nasıl reddedilir", "Як відмовитися", "Si të refuzoni"),
        body: [
          L(
            "Block cookies for this site in the browser if you do not want the locale remembered. The site will still open; it may fall back to English until you choose a language again. There is no separate cookie banner because no advertising cookie is set.",
            "Блокирајте ги колачињата за оваа страница ако не сакате јазикот да се памти. Страницата пак ќе се отвори; може да падне на англиски додека повторно не изберете јазик. Нема посебен банер за колачиња затоа што нема рекламно колаче.",
            "Blokirajte kolačiće za ovaj sajt ako ne želite da se jezik pamti. Stranica će se i dalje otvoriti; može pasti na engleski dok ponovo ne izaberete jezik. Nema posebnog banera za kolačiće jer nema reklamnog kolačića.",
            "Dilin hatırlanmasını istemiyorsanız bu site için tarayıcıda çerezleri engelleyin. Site yine açılır; yeniden dil seçene kadar İngilizceye düşebilir. Reklam çerezi olmadığı için ayrı bir çerez bandı yoktur.",
            "Заблокуйте cookie для цього сайту, якщо не хочете, щоб мова запам'ятовувалась. Сайт усе одно відкриється; може повернутися до англійської, доки знову не оберете мову. Окремого банера cookie немає, бо немає рекламного cookie.",
           "Bllokoni kukitë për këtë sajt në shfletues nëse nuk doni që lokaliteti të mbahet mend. Sajti do të hapet përsëri; mund të kthehet te anglishtja derisa të zgjidhni sërish një gjuhë. Nuk ka banderolë të veçantë kukish sepse nuk vendoset kuki reklame."),
        ],
      },
    ],
  },
];

export function getLegalDocument(slug: string) {
  return legalDocuments.find((document) => document.slug === slug);
}
