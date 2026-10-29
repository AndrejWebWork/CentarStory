# CentarStory content research

Verification date: **2026-10-29**.

This note records how the first evidence-based inventory for CentarStory was assembled. It is a research log, not a claim of completeness. The live dataset is the typed records under `src/content/knowledge/`.

## Scope

The inventory covers **the Municipality of Centar, Skopje**, not the City of Skopje as a whole.

Operational geographic rule:

- OSM relation **2439777** (ISO 3166-2 `MK-814`) is the municipal polygon used for point-in-polygon checks.
- Nominatim bounding box for that relation: **41.9780007–42.0141170 N**, **21.4056802–21.4510955 E**.
- A pin whose OSM `city_district` is Municipality of Centar, and which falls inside the polygon, may be marked `municipality: "centar"`.
- A pin outside the polygon is `municipality: "nearby"` and must be labelled as such in the application.
- Municipal or tourism pages that present a site as “theirs” do not override the OSM district assignment. Presentation conflicts are documented as claims, not silently resolved.

This atlas does **not** claim to include every monument, plaque, or listed building in Centar.

## Search methodology

1. Read the Municipality of Centar official website and the municipal profile page that names cultural, administrative, and architectural objects.
2. Check the City of Skopje portal for visitor institutions.
3. Check `heritage.gov.mk` (National Conservation Centre) and `uzkn.gov.mk` (cultural heritage administration) for a public Centar extract.
4. Read official pages of museums, memorial houses, the opera, and related institutions.
5. Read academic entries (CEIPA / UKIM, HAEMUS) and credible journalism (Prizma / BIRN Skopje 2014 Uncovered, Balkan Insight) for dates, authors, and dimensions.
6. Resolve coordinates with OpenStreetMap Nominatim (`addressdetails=1`) and test each pin against relation 2439777.
7. Cross-check Čair municipal tourism pages where they overlap Centar’s named objects.
8. Search Macedonian and English first; consult Albanian Čair pages and Turkish/Serbian name forms where they appear on OSM.

Queries that failed or were unusable in this pass:

- Overpass API returned HTTP 406 in the earlier extraction attempt; Nominatim was used instead.
- Wikidata SPARQL returned HTTP 429; Wikidata item Q1463152 was used only as a cross-check for the OSM relation and ISO code.
- UZKN `/registri/` returned HTTP 444; the UZKN homepage returned HTTP 500 on retry. No complete public register extract for Centar was obtained.
- Nominatim returned a pub for “GTC” / “ГТЦ”; the City Trade Center was omitted until a unique building coordinate is confirmed.
- Nominatim did not return a unique restaurant node for Destan; Destan is a **candidate** nearby venue.

## Sources consulted

### Official municipal and city

| ID | Source | Status on 2026-10-29 |
| --- | --- | --- |
| `centar-home` | https://www.centar.gov.mk/ | Live |
| `centar-profile` | https://www.centar.gov.mk/opstina/za-opstinata/profil-opstina | Live. Names Assembly, Government, National Library, Macedonian National Theatre, Opera and Ballet, Archaeological Museum, Museum of the Macedonian Struggle, Porta Macedonia, Kale, Sveti Spas, Stone Bridge, Ristiḱ Palace, Old Railway Station, City Park, Debar Maalo. Approximate verbal boundary from Vodno / Kapištec through Debar Maalo, City Park, and Kale, then the Old Bazaar edge, Krnjevo, the new station, Madžir Maalo, Novo Maalo. |
| `centar-walk-2026` | Municipal notice of a free thematic walk, 24 June 2026, gathering at the Memorial House of Mother Teresa; names GTC, Stone Bridge, Vardar quay, Daut Pasha Hammam | Live |
| `centar-culture-dept` | Culture department page | Live |
| `centar-walks-call` | Public call for citizen walks | Live |
| `skopje-gov` | https://skopje.gov.mk/ | Live |
| `cair-bridge` | Čair tourism page for the Stone Bridge | Live; presentation overlap |
| `cair-hammam` | Čair tourism page for Daut Pasha Hammam | Live; presentation overlap |
| `sobranie-home` | https://www.sobranie.mk/ | Live |
| `vlada-home` | https://vlada.mk/ | Live |

`https://srv1.centar.gov.mk/` was listed as a research starting point. It was not used as a source of record in this pass; claims are sourced from `www.centar.gov.mk` instead. Do not treat `srv1` as an endorsement or as a verified register.

### Heritage administration

| ID | Source | Status |
| --- | --- | --- |
| `heritage-ncc` | https://heritage.gov.mk/en/za-nas/ | Live. Confirms the National Conservation Centre maintains central registers of immovable monuments. The public site does not publish a searchable Centar-only inventory. |
| `uzkn-home` | http://uzkn.gov.mk/mk/ | Existence of the office confirmed; homepage HTTP 500 on retry; `/registri/` HTTP 444. **No Centar extract.** |

### Institutional

Memorial House of Mother Teresa, Museum of the City of Skopje, Archaeological Museum (`amm.org.mk`), Museum of the Macedonian Struggle (`mmb.org.mk`), Museum of Contemporary Art (`msu.mk`), Holocaust Fund (`holocaustfund.org.mk/posts/details/1` — content captured, later 404 on retry), National Opera and Ballet (`operabalet.mk`), Hotel / Restaurant Pelister (`pelisterhotel.com.mk`).

### Academic and journalism

CEIPA entries for the Stone Bridge and Daut Pasha Hammam; HAEMUS Stone Bridge; Concept for Culture Skopje (KKS) pages; Prizma / BIRN Skopje 2014 Uncovered (Equestrian Warrior, Mother Teresa Memorial Home); Balkan Insight 2011; Само прашај report on the 2008 Old Bazaar law.

### Geographic

- OSM relation 2439777 — https://www.openstreetmap.org/relation/2439777 (re-checked 2026-10-29; relation still named Municipality of Centar).
- Nominatim lookups for named sites (ODbL 1.0).
- Wikidata Q1463152 as a cross-check only.

**Do not confuse OSM relation 2528180 (Centar, Sarajevo) with Skopje.**

### Images

Three contemporary photographs from Wikimedia Commons, with credit, licence, and page URL stored in `src/content/knowledge/media.ts`:

- Diego Delso, Stone Bridge, CC BY-SA 3.0.
- kallerna, square from the bridge, CC BY-SA 4.0.
- August Dominus, Porta Macedonia, CC BY-SA 4.0.

No AI reenactments. No unlicensed commercial photography.

## Categories investigated

| Category | Result in this pass |
| --- | --- |
| Public monuments and sculptures | Stone Bridge; Porta Macedonia; Equestrian Warrior treated as part of Macedonia Square (official name is not “Alexander”; sculptor Valentina Stevanovska; investor Municipality of Centar). Many other Skopje 2014 figures remain **candidates / omissions**. |
| Memorial monuments and sites | Old Railway Station / Museum of the City of Skopje; Holocaust Memorial Center; Memorial House of Mother Teresa. |
| Historical figures on monuments | Warrior on the square: documented as Equestrian Warrior, not as a named Alexander monument. Mother Teresa: memorial house, architect Vangel Božinovski, opened January 2009. |
| Commemorative plaques | **Not inventoried.** No reliable plaque register was found. |
| Historic / architecturally significant buildings | Ristiḱ Palace; Army Hall Cultural Centre (OSM); Assembly; Government; National Library; Opera; Macedonian National Theatre. |
| Religious or cultural buildings with heritage significance | Cathedral of St. Clement of Ohrid (Debar Maalo); Church of Sveti Spas; Daut Pasha Hammam. |
| Historically important public spaces | Macedonia Square; Vardar quay; City Park (Centar OSM way). |
| Museums and memorial houses | Archaeological Museum; Museum of the Macedonian Struggle; Museum of Contemporary Art; Museum of the City of Skopje; Holocaust Memorial Center; Memorial House of Mother Teresa. Hammam as a gallery/collection space. |
| Food venues | Pelister confirmed on Macedonia Square. Destan **candidate**, nearby in Čair. Debar Maalo has no pinned restaurant. |
| Events | May Opera Evenings (confirmed recurring); Ilinden 2 August (confirmed state holiday in public space); Skopje Summer (**candidate**). Skopje Jazz Festival omitted: current-year venue not independently verified. |

## Records successfully verified

Confirmed cultural **sites** (pins inside OSM 2439777 unless noted):

1. Stone Bridge — 41.9971154, 21.4332499
2. Macedonia Square — 41.9956947, 21.4312483
3. Porta Macedonia — 41.9944508, 21.4324403
4. Ristiḱ Palace — 41.9955871, 21.4309922
5. Museum of the City of Skopje (old railway station) — 41.9909131, 21.4290087
6. Memorial House of Mother Teresa — 41.9938448, 21.4308635
7. Skopje Fortress (Kale) — 42.0008107, 21.4330288
8. Cathedral of St. Clement of Ohrid — 41.9985277, 21.4264089
9. Army Hall Cultural Centre — 41.9933823, 21.4319176
10. Vardar quay — 41.99555, 21.4284 (polygon-checked, not a single OSM node)
11. Archaeological Museum — 41.996804, 21.4344487
12. Holocaust Memorial Center — 41.9984656, 21.4333832
13. Museum of the Macedonian Struggle — 41.9979421, 21.4331865
14. Museum of Contemporary Art — 42.0038349, 21.4328806
15. National Opera and Ballet — 41.9975712, 21.4370887 (Goce Delčev 4; earlier demo coordinates on the west bank were wrong and were discarded)
16. Macedonian National Theatre — 41.9985826, 21.4323669
17. Daut Pasha Hammam — 41.9987239, 21.4357237
18. Church of Sveti Spas — 42.0008245, 21.4357189
19. National and University Library St. Clement of Ohrid — 41.997985, 21.4395071
20. Assembly of the Republic of North Macedonia — 41.9927805, 21.4324891
21. Government of the Republic of North Macedonia — 42.000615, 21.4286879
22. City Park (Centar OSM way) — 42.0045425, 21.4224667

Nearby (explicitly labelled, not presented as Centar interiors):

- Old Bazaar district centroid (Čair; 2008 heritage law reported as spanning Čair and Centar).
- Destan kebab house — candidate, Čair.

Confirmed culinary: Pelister, Macedonia Square b.b. (not Debar Maalo).

Thematic routes: River and stone; The hour of 5:17; Up to the fortress; Landmarks of Centar (from the 24 June 2026 municipal walk, GTC omitted); Houses of the republic (Assembly, library, Government, City Park).

## Candidates awaiting verification

- Destan (venue exists in common knowledge of the bazaar; Nominatim did not return a unique node).
- Skopje Summer (recurring city programme; stages change; not treated as a ticket).
- GTC / City Trade Center (named on the 2026 municipal walk; no unique OSM coordinate in this pass).
- Individual Skopje 2014 sculptures other than Porta Macedonia and the Equestrian Warrior as part of the square.
- Interior hours for several civic buildings.

## Missing information and suspected omissions

The municipal profile also implies, but this pass did not independently pin:

- University “Ss. Cyril and Methodius” buildings that sit in Centar.
- Kapištec monastery, used in the profile as a boundary description, not as a visitor site in the atlas.
- Madžir Maalo / Novo Maalo fabric beyond the Assembly pin.
- A complete plaque survey.
- A complete list of protected façades from UZKN / NCC registers.
- Hotels named only as lodging in the profile.

Suspected omissions relative to a full monument survey: dozens of Skopje 2014 sculptures and fountains on and around the square and quay; memorial plaques on residential streets; smaller Orthodox and other religious sites; school and ministry buildings with heritage status.

## Geographic boundary ambiguities

1. **Stone Bridge.** OSM and the Centar profile place it in Centar. Čair publishes a tourism page. Recorded as Centar with a documented presentation overlap.
2. **Daut Pasha Hammam.** Same pattern: OSM Centar vs Čair tourism page.
3. **Old Bazaar.** 2008 law, as reported, places the monument ensemble in Čair **and** Centar. Market streets are treated as a nearby district.
4. **Sveti Spas.** On the bazaar edge; OSM pin used; Čair/Centar presentation may overlap at the street scale.
5. **City Park.** OSM maps a City Park way in Centar and a continuation in Karpoš. Only the Centar way is pinned; the Karpoš continuation is not presented as a Centar interior.
6. **Verbal municipal profile** (Vodno, Kapištec, Debar Maalo, City Park, Kale, Old Bazaar, Krnjevo, new station, Madžir Maalo, Novo Maalo) is a narrative boundary, not a GIS polygon. OSM 2439777 is the operational geometry.

## Conflicting historical claims

| Subject | Conflict | How the atlas treats it |
| --- | --- | --- |
| Stone Bridge builder / patron | CEIPA/HAEMUS cite Evliya Çelebi for Mehmed II (1451–1481) and other indications for Murad II | Dated as a range; no invented builder |
| Equestrian statue on the square | Popular name “Alexander” vs Prizma official name Equestrian Warrior, sculptor Valentina Stevanovska, investor Municipality of Centar | Official name used; popular identification is not asserted as fact |
| Mother Teresa memorial architect | Earlier demo copy named Marjan Staševski | Corrected to Vangel Božinovski; opened January 2009 (institutional / Prizma) |
| Opera coordinates | Earlier demo used a west-bank point | Corrected to Goce Delčev 4 |
| Pelister location | Earlier demo placed it in Debar Maalo | Official address is Macedonia Square b.b. |
| Daut Pasha Hammam origin | CEIPA records a snake-legend then rejects it using 1546–1568 income of 5,833 akçe; construction 1468–1497, ~900 m² | Legend stored as `legend-folklore`; income/date as `documented-fact` |
| Sveti Spas iconostasis / burials | Conservation-page detail not independently re-fetched | Left `unverified` |

## History versus myth

Four claim kinds are stored on records: `documented-fact`, `legend-folklore`, `interpretation`, `unverified`.

A monument of a soldier, king, or national figure is **not** given an invented legend. Where no folkloric source was found, the record states that no independently verified legend was found.

The only sourced folkloric account in this dataset is the snake story at Daut Pasha Hammam, documented by CEIPA as a legend and then rejected by that same source using Ottoman income records.

No fabricated quotations, conversations, battles, or supernatural scenes are stored as fact.

## Data architecture in the application

- Source registry: `src/content/knowledge/sources.ts`
- Schemas: `src/content/knowledge/schema.ts`
- Polygon and PIP: `src/content/knowledge/polygon.ts`, `boundary.ts`
- Validation (duplicates, translations, unknown sources/relations, PIP vs municipality, claim-without-source, image rights): `src/lib/content/validate.ts`
- Quality report: `src/lib/content/quality.ts`, `GET /api/content/quality` (optional `?format=md`)
- Adapter into the existing Explore / Scan / Museums / Food / routes UI: `src/content/knowledge/adapter.ts`

Claim-level sources are required. A source on a monument record does not automatically validate every sentence.

## Outstanding research tasks

1. Obtain a public UZKN / NCC extract for immovable heritage in Centar and reconcile it with this atlas.
2. Pin GTC uniquely and decide whether to add it to the municipal-landmarks walk.
3. Survey commemorative plaques.
4. Confirm Destan with a unique OSM node or an official address page.
5. Re-fetch Holocaust Fund pages; the captured URL later 404’d.
6. Construction years and architects for Assembly, Government, Ristiḱ Palace, Sveti Spas iconostasis.
7. Licensed photographs for sites that currently have none.
8. Current-year confirmation for Skopje Summer stages and any jazz festival venue in Centar.
9. Individual Skopje 2014 sculptures, with official names, authors, and investors from Prizma or municipal procurement — only where sources exist.
10. Re-check `srv1.centar.gov.mk` if it publishes a cultural programme archive not mirrored on `www.centar.gov.mk`.

## Application mapping

| Surface | Dataset |
| --- | --- |
| Explore map and catalog | All site and district pins; nearby pins use a dashed marker and a nearby label |
| Scan | On-device profiles for distinctive façades; full verified catalog for manual choice; results open sourced detail pages |
| Monument / museum detail | Claims, myths, chronology, architecture, licensed photographs, visitor notes, source list, related sites, walks, events |
| Thematic routes | Five walks from verified stops |
| Museums index | Sites with an `institution` kind |
| Food | Districts (including nearby Old Bazaar), dishes, Pelister, Destan candidate |
| Events | May Opera Evenings, Skopje Summer (candidate), Ilinden |
