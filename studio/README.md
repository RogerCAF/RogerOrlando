# Infinite Worlds — bronbestanden en veilige iteratie

## Hoe deze editie werkt
- `public/infinite-worlds.html` is de compacte, zelfstandige versie voor de Vercel-website en de Playground-iframe.
- `studio/infinite-worlds-source.html` is een zelfstandige, leesbare werkversie met alle SVG-illustraties en de MacBook-afbeelding inline. De bron is direct lokaal in de browser te bekijken. Bewerk toekomstige scènes bij voorkeur hier; maak vervolgens een nieuwe productie-export.
- De oudere `app/components/InfiniteZoom.tsx` en `infinite-world-art.ts` zijn **niet verwijderd**.

## Inzoommechaniek 0.3
Alle werelden gebruiken een logisch tekenvlak van 1600×900 px. Een kindwereld behoudt haar eigen 1600×900-coördinaten en wordt geschaald naar de exacte portaalafmetingen van de ouder. Daardoor blijven ook portalen twee of drie niveaus diep correct genest. Bij diepte 1.0, 2.0, enz. is de inkomende wereld dezelfde afbeelding in dezelfde camerastand als de nieuwe hoofdlaag. De renderer bewaart recent geopende hoofdscènes, decodeert de introafbeeldingen vooraf en houdt een kleine overscan aan zodat er rond de overgang geen stroken van de oude wereld zichtbaar blijven.

### Hoofdroute
1. Kleine retrocomputer: scherm 695,326,210,118.125
2. Verbindingshal: opening 688,351,224,126
3. Observatorium: lens 712,346,176,99
4. Overgangskamer: raam 704,352,192,108
5. Werkkamer: hoofdscherm 441,342,284,159.75

### Zijroutes vanaf de kamer
- MacBook en realistisch fantasy-universum: 213,563,210,118.125
- 10.00 en inktspiraal: 758,617,133,74.8125
- Infinity Mirror: 1369,376,114,64.125

## Validatie
De eerste vier overgangen zijn op 980×700 en 390×844 getest in Chromium met Playwright. Bij screenshots op dieptes 0.998/1.000, 1.998/2.000, enz. was het gemiddelde absolute pixelverschil circa 3–5/255 per kleurkanaal; voor de reparatie waren donkere randen rond de overgang zichtbaar. Er zijn geen JavaScript-consolefouten gevonden bij deze tests. De compacte HTML is ook apart als document geladen. Safari en echte iPhones vragen nog om een aparte praktijkcontrole.

## Ontwerpafspraken
- De eerste scènes blijven rustig en echt handgetekend; geen fotorealistische remake van de computerkamer.
- Geen planten in de werkkamer; belangrijk zijn de Domtoren links, twee hoofdmonitoren, MacBook, Lenovo, Lian Li Vector V150 INF met twee frontfans, trofee, vier kleine opgeloste kubussen en 10.00-klok.
- MacBook mag bewust de realistische originele fantasy-afbeelding behouden; de overige werelden blijven geïllustreerd.
- We breiden de wereldboom stapsgewijs uit zonder bestaande scènekoppelingen onnodig te verbreken.

## Volgende stap
Illustraties en openingcoördinaten per wereld verder op elkaar uitlijnen, vervolgens de filmset/cameralens en de overige vertakkingen uitwerken.