---
title: Dolgok, amiket nem tudok 2018-ban
date: '2018-12-28'
spoiler: Elismerhetjük tudásunk gátjait anélkül, hogy értéktelenítenékn szaktudásunk.
---

Az emberek rendre több tudást feltételeznek belém, mint amennyivel valójában rendelkezem. Ez nem nagy baj, nem panaszkodom. (Kisebbségek tagjai általában ennek a torzításnak az ellenkezőjét szenvedik el kemény munkával összehozott eredményeik ellenére, és ez *szívás*.)

**Ebben a bejegyzésben a teljesség igénye nélkül kínálok egy listát azokról a programozással kapcsolatos témákról, amikre gyakran hamisan feltételezik, hogy ismerem.** Nem mondom, hogy  *te* nem kell, hogy megtanuld őket — vagy hogy nem ismerek *más* hasznos dolgot. De mivel nem vagyok jelenleg sérülékeny helyzetben, őszinte lehetek.

Itt van, hogy miért tartom ezt fontosnak.

---

Először is gyakran van az a valótlan elvárás, hogy egy tapasztalt mérnök minden, a területével kapcsolatos technológiát ismer. Láttál már könyvtárak és eszközök százaiból álló betanulási listát? Hasznos lehet - de félelmetes.

Ezen felül teljesen függetlennül attól, mennyire tapasztalt vagy, rendre csaponghatsz az alkalmas, az alkalmatlan ("Imposztor szindróma"), a túl magabiztos ("Dunning-Kruger hatás") állapotok között. Ez függ a környezetedtől, a munkádtól, jellemvonásaidtól, csapattársaidtól, lelkiállapotodtól, napszaktól, és így tovább.

Tapasztalt fejlesztők gyakran túloznak a bizonytalanságaikkal kapcsolatban, hogy bátorítsák a kezdőket. De egy világ választja el a rafinált sebészt, akit még mindig kiver a frász az először a kezében szikét fogó tanulótól.

A valós tudáshézaggal rendelkező tanulónak elszomorító, sőt üres duma lehet azt hallani, hogy "Mind kezdő fejlesztők vagyunk". A hozzám hasonló jó szándékú gyakorlók jó érzésű vallomásai nem tudják ezt áthidalni.

Mégis, még a tapasztalt mérnöknek is rengeteg hiányosság van a tudásában. Ez a bejegyzés az enyémekről szól, és arra buzdítok mindenkit, aki csak megteheti, ossza meg a magáét. Azonban még véletlenül se értékeljük le tudásunkat közben!

**Beismerhetjük hiányosságainkat, érezhetjük imposztornak magunkat vagy sem, s közben ugyanúgy rendkívül értékes szaktudás birtokában lehetünk, mely sokéves kemény munka eredménye.**

---
Félretéve ezt a felvezetést, itt van néhány dolog, amit nem tudok:

* **Unix parancsok és Bash.** Tudok `ls`-t és `cd`-t, de minden másra rákeresek. Ismerem a piping koncepcióját, de csak egyszerű esetekben használtam. Nem tudom, hogy kell `xargs`-szal bonyolult láncokat alkotni, vagy hogy hogyan állítunk össze és irányítunk át különböző kimeneti folyamokat. Továbbá sosem tanultam meg rendesen a Bash-t, így csak nagyon egyszerű (és gyakran hibás) shell szkriptet tudok írni.

* **Alacsony szintű nyelvek.** Értem, hogy Assembly-vel tudsz a memóriában tárolni dolgokat meg ugrálni a kódban, de nagyjából ennyi. Írtam pár sort C-ben és értem, mi a pointer, de fogalmam sincs, hogy kell használni a `malloc`-ot, vagy más kézi memóriamenedzsment módszert. Soha nem játszottam Rust-tal.

* **Hálózatok.** Tudom, hogy a számítógépnek van IP címe, meg hogy a DNS az, ahogy a hoszt neveket kibontjuk. Tudom, hogy vannak alacsony szintű protokollok, mint a TCP/IP csomag cserére és (talán?) azok sértetlenségének biztosítására. Ennyi — A részletek homályosak.

* **Konténerek.** Elképzelésem sincs, hogy használjak Docker-t vagy Kubernetes-t. (Van egyáltalán közük egymáshoz?) Halvány fogalmam van róla, hogy velük tudok kiszámíthatóan különálló virtuális gépeket indítani. Vagányul hangzik, sosem próbáltam.

* **Serverless.** Ez is menőnek hangzik. Soha nem próbáltam. Nem látom tisztán, hogy befolyásolja a backend fejlesztést ez a modell (ha egyáltalán változtatja).

* **Microservices.** Ha jól értem, ez csak annyit tesz, “sok API végpont beszélget egymással”. Nem értem, mik az előnyei, vagy hátulütői ennek a megközelítésnek, mert sosem csináltam.

* **Python.** E miatt szégyellem magam — Évekig *Dolgoztam* Python-nal egy ponton és sosem vettem a fáradságot, hogy rendesen megtanuljam. Rengeteg sötét folt van itt nekem, mint az import viselkedés.

* **Node backend-ek.** Értem, hogy kell Node-ot, használtam pár API-t, mint az `fs` tooling építéshez, és be tudok állítani egy Express-t. Soha nem kommunikáltam Node-ból egy adatbázissal és nem igazán tudom, hogy kell benne backendet írni. Nem igazán vagyok továbbá otthon a React keretrendszerekben, mint a Next egy "Hello World"-ön túl.

* **Natív platformok.** Próbáltam Objective C-t tanulni, de nem jött össze. Swift-et sem tanultam. Ugyanez Java-val. (Valószínűleg nem lenne gond, mivel C#-pal dolgoztam.)

* **Algoritmusok.** Egy jobb napon a legtöbb, amit kihozhatsz belőlem, az egy buborékrendezés és talán egy gyorsrendezés. Talán egyszerű gráfbejárást képes vagyok leírni, ha egy konkrét gyakorlati feladathoz tartozik. Megértem a O(n) jelölést, de nem sokkal mélyebben, mint  "ne tegyél loop-ba loop-ot”.

* **Funkcionális nyelvek.** Hacsak a JavaScript-et nem számítjuk, nem írok folyékonyan hagyományos funkcionális nyelvet. (csak C#-ban és JavaScript-ben írok — és a C# javát mré el is felejtettem.) Nyögdécselve olvasok LISP-ihlette (mint a Clojure), Haskell-ihlette (mint az Elm), vagy ML-ihlette (mint az OCaml) kódot.

* **Funkcionális terminológia.** Map és reduce - ennyi megy. nem ismerem a monoidokat, funktorokat, stb. Tudom, mi az a monád, azt hiszem. Vagy csak képzelem?.

* **Modern CSS.** Nem tanultam bele a Flexbox vagy Grid világába. A Float-ban elakadok.

* **CSS Módszertanok.** Használtam BEM-et (A CSS részét, nem az eredeti BEM-et), de ennyit tudok. Sosem próbálkoztam az OOCSS-sel, vagy bármi más módszerrel.

* **SCSS / Sass.** Sosem vettem rá magam.

* **CORS.** Rettegek ezektől a hibáktól! Tudom, hogy valamit be kell állítanom header-ekben, de régen órákat csesztem el erre.

* **HTTPS / SSL.** Sosem konfiguráltam. Fogalmam sincs a működkésről a privát és nyilvános kulcsokon túl.

* **GraphQL.** Ki tudok olvasni egy lekérést, de lövésem sincs, hogy írok le csomópontokkal és élekkel, mikor használunk töredékeket, vagy hogy megy itt a pagination.

* **Socket-ek.** Az az elképzelésem, hogy így tudnak a számítógépek a request/response modellen kívül beszélni, de ezzel vége a tudásomnak.

* **Stream-ek.** Az Rx Observable-ökön kívl nem foglalkoztam mélyen streamekkel. Használtam a régi Node stream-eket egyszer-egyszer, de mindig elfuseráltam a hibakezelést.

* **Electron.** Ki sem próbáltam.

* **TypeScript.** Értema  típusosság lényegét, és tudok jelölést olvasni, de sosem írtam. Ahányszor próbáltam, nehézségbe ütköztem.

* **Deployment és devops.** FTP-n még csak átküldök pár fájlt, vagy megölök egy folyamatot de itt véget is ér a devops tudásom.

* **Grafika.**Akár canvas, SVG, WebGL vagy low-level grafika, nem vagyok benne valami hatékony. Értem a lényeget, de be kéne gyakorolnom a primitíveket.

Ez a lista egyáltalán nem kimerítő. Nagyon sokmindent nem tudok még.

---

Furának tűnhet ezt vesézni. Még helytelenebbnek érzem leírni. Csak nem büszkélkedtem a tudatlanságommal? A tervezett tanulság a következő:

* **Még a kedvenc fejlesztőidnek is lehet olyan hiányossága, amit te nagyon jól ismersz.**

* **Az önbizalmad a tudásszintedtől függetlenül változékony.**

* **A tapasztalt fejlesztők a hiányosságaik ellenére is értékes gyakorlat birtokában vannak.**

Ismerem a hiányosságaim (legalább egy részüket). Ha szükségem van bármelyikre egy projekt kapcsán és érdekel is, fel tudom zárkóztatni magam.

Ez nem értékteleníti a tudásomat és tapasztalatomat. Rengeteg dolog van, amit jól tudok csinálni. Például technológiákat tanulni amikor szükségem van rájuk.

>Frissítés: [Írtam olyanról](/the-elements-of-ui-engineering/) is, amit tudok.
