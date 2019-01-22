---
title: Saker som jag inte vet 2018
date: '2018-12-28'
spoiler: Vi kan erkänna att det finns hål i våran kunskap utan att dra ner värdet på vår expertis.
---

Folk brukar ofta anta att jag vet mer än jag faktiskt gör. Det är inte ett dåligt problem att ha och jag klagar inte. (Människor från minoritetsgrupper upplever ofta helt motsatta fördomar trots deras hårt förvärvade kreditiv och det *suger*.)

**I den här artikeln kommer jag att erbjuda en inkomplett lista av programmeringsämnen som folk ofta antar att jag kan.** Jag säger inte att *du* inte måste lära dig dem - eller att jag inte vet *andra* användbara saker. Men eftersom att jag själv inte är i en sårbar position just nu så kan jag vara ärlig gällande detta.

Här är anledningen till varför jag tycker att det är viktigt.

---

Först, det finns ofta en orealistisk förväntan att en erfaren ingenjör vet alla teknologier inom deras fält. Har du sett en "läroplan" som innehåller hundratals bibliotek och verktyg? Det är användbart - men det är lätt att bli bortskrämd.

Mer än så, det spelar ingen roll hur erfaren du blir, du kan fortfarande komma på dig själv skiftandes mellan att känna dig kapabel, otillräcklig ("Bluffsyndrom / Impostor syndrome"), och övermodig ("Dunning-Kruger effekten"). Vilket det är beror på vilken miljö du är i, jobb, personalitet, kollegor, mentalt tillstånd, tid på dagen och så vidare.

Erfarna utvecklare öppnar ibland upp om sina osäkerheter för att motivera nybörjare. Men det är en enorm skillnad mellan en erfaren kirurg som fortfarande blir nervös inför en operation och en student som håller sin första skalpell!

Att höra hur "vi är alla juniorer" kan vara omotiverande och låter som tomprat till de som vill lära sig och har ett faktiskt hål i sin kunskap. "Feel-good" bekännelser från andra välmenande utvecklare som mig kan brygga det hålet.

Även erfarna ingenjörer kan fortfarande ha många hål i sina kunskaper. Den här artikeln handlar om mina egna, och jag uppmanar alla de som har råd att vara lika sårbara att göra dela sina egna berättelser. Men låt oss inte dra ner värdet på våran erfarenhet medan vi gör det.

**Vi kan erkänna hålen i våra kunskaper, ibland känna oss som bedragare eller bluffare, och fortfarande ha djupt värdefull expertis som har tagit år av hårt arbete att utveckla.**

---

Med den varningen ur vägen, här är ett par saker som jag inte vet:

* **Unix kommandon och Bash.** Jag kan `ls` och `cd` men jag kollar upp allt annat. Jag förstår konceptet för "piping" men jag har bara använt det i enklare sammanhang. Jag vet inte hur man använder `xargs` för att skapa komplexa kedjor, eller hur man komponerar och dirigerar om output strömmar. Jag har aldrig heller riktigt lärt mig Bash så jag kan bara skriva väldigt enkla (och ofta buggiga) shell skript.

* **Lågnivåspråk.** Jag förstår att Assembly låter dig lagra saker i minnet och hoppa runt i koden men där tar det stopp. Jag skrev ett par rader C och jag förstår vad en pekare ("pointer") är, men jag vet inte hur man använder `malloc` eller andra manuella tekniker för att hantera minneslagring. Jag har aldrig provat Rust.

* **Nätverk.** Jag vet att datorer har IP adresser och att DNS är hur vi resolverar domännamn. Jag vet att det finns lågnivå protokoll som TCP/IP för att skicka paket fram och tillbaka som (kanske?) säkerställer integritet. Det är allt, jag är lite otydlig när det kommer till detaljer.

* **Containers.** Jag har ingen aning om hur man använder Docker eller Kubernetes. (Har de något med varandra att göra?). Jag har en ungefärlig idé om att de låter mig starta separata virtuella maskiner på ett förutsägbart sätt. Låter häftigt, men jag har inte provat det.

* **Serverless.** Låter också häftigt. Aldrig provat det. Jag har inte en klar idé av hur den modellen ändrar backend-programmering (om den gör det alls).

* **Mikrotjänster.** Om jag förstår det rätt så betyder det här bara "många API ändpunkter som pratar med varandra". Jag vet inte vad de praktiska för- och nackdelarna är med denna metoden för jag har aldrig jobbat med det.

* **Python.** Jag har en dålig känsla om den här punkten - jag *har* vid en tidpunkt jobbat med Python under många år och jag har aldrig brytt mig om att faktiskt lära mig det. Det finns många saker där som jag har svårt att se hur det fungerar, till exempel import-betéendet.

* **Node backend.** Jag förstår hur man kör Node, har använt några API:er som `fs` för att skapa byggverktyg och jag kan sätta upp Express. Men jag har aldrig pratat med en databas från Node och jag vet inte hur man skriver en backend i det. Jag är inte heller bekant med React-ramverk som Next mer än hur man skriver ett "hello world".

* **Native plattformar.** Jag försökte lära mig Objective C vid en tidpunkt men det gick inte vägen. Jag har inte lärt mig Swift heller. Samma sak med Java. (Jag skulle förmodligen kunna plocka upp det eftersom att jag har jobbat med C#.)

* **Algoritmer.** Det mesta du kan få ut av mig är en bubble sort och kanske en quicksort på en bra dag. Jag kan förmodligen göra enkla graftraverserings-uppgifter om de är bundna till något specifikt praktiskt problem. Jag förstår O(n) noteringen men min förståelse är inte djupare än "stoppa inte loopar inuti loopar".

* **Funktionella språk.** Om du inte räknar med JavaScript så är jag inte flytande i något traditionellt funktionellt språk. (Jag är bara flytande på C# och JavaScript - och jag har redan glömt det mesta av C#.) Jag kämpar med att läsa antingen LISP-inspirerad (som Clojure), Haskell-inspirerad (som Elm), eller ML-inspirerad (som OCaml) kod.

* **Funktionell terminologi.** Map och reduce är så långt jag går. Jag kan inte monoider, functors, etc. Jag vet vad en monad är men det kanske är en illusion.

* **Modern CSS.** Jag kan inte Flexbox eller Grid. Floats är min grej.

* **CSS Metodologier.** Jag använde BEM (menar CSS delen, inte det originella BEM) men det är allt jag vet. Jag har inte provat OOCSS eller andra metodologier.

* **SCSS / Sass.** Jag har aldrig lärt mig dem.

* **CORS.** Jag fruktar dessa fel! Jag vet att jag måste ställa in några headers för att fixa dem men jag har slösat ett flertal timmar här förr.

* **HTTPS / SSL.** Har aldrig satt upp det. Vet inte hur det fungerar mer än idén om privata och publika nycklar.

* **GraphQL.** Jag kan läsa en query men jag vet inte riktigt hur man uttrycker saker med nodes och edges, när man ska använda fragments eller hur paginering funkar här.

* **Sockets.** Min mentala modell är att de låter datorer prata med varandra utanför anrop/svar modellen men det är allt jag vet.

* **Streams/Strömmar.** Förutom Rx Observables så har jag inte jobbat så mycket med strömmar. Jag använde en gammal Node ström en eller två gånger men jag lyckades aldrig få till felhantering.

* **Electron.** Aldrig provat.

* **TypeScript.** Jag förstår konceptet av typer och jag kan läsa annoteringar men jag har aldrig skrivit dem. De få gånger jag har försökt så sprang jag på svårigheter.

* **Deployment och devops.** Jag fixar att skicka filer över FTP eller att döda några processer men där går gränsen av mina devops färdigheter.

* **Grafik.** Huruvida det är canvas, SVG, WebGL eller lågnivå grafik så är jag inte produktiv inom det. Jag förstår den övergripande idén men jag måste lära mig primitiverna.

Självklart så är inte denna lista utförlig. Det finns många andra saker som jag inte vet/kan.

---

Det kanske känns som en konstig sak att diskutera. Det kanske till och med känns fel att skriva det. Skryter jag om min okunnighet? Det jag vill att läsaren ska ta med sig av den här artikeln är:

* **Även dina favorit utvecklare vet förmodligen inte många saker som du vet.**

* **Oavsett din kunskapsnivå så kan ditt självförtroende variera kraftigt.**

* **Erfarna utvecklare har värdefull expertis trots att de har hål i sin kunskap.**

Jag är medveten om hålen i min kunskap (ett par av dem, i alla fall). Jag kan fylla dem senare om jag blir nyfiken eller om jag behöver dem i ett projekt.

This doesn’t devalue my knowledge and experience. There’s plenty of things that I can do well. For example, learning technologies when I need them.

Det här drar inte ner värdet på min kunskap och erfarenhet. Det finns många saker som jag kan göra bra. Till exempel, lära mig nya teknologier när jag behöver dem.

>Uppdatering: Jag [skrev](/the-elements-of-ui-engineering/) också om ett par saker som jag vet.
