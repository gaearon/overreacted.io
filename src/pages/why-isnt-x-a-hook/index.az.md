---
title: Nə üçün X Hook deyil?
date: '2019-01-26'
spoiler: Sadəcə edə bilməyimiz etməliyik anlamına gəlmir.
---

[React Hookları](https://reactjs.org/hooks) birinci alfa versiyası nəşr edildikdən sonra “Nə üçün *\<filan digər API\>* Hook deyil?” kimi suallar müzakirələrdə gəlməyə davam edir.

Xatırlatmaq üçün bəzi Hookları qeyd edim:

* [`useState()`](https://reactjs.org/docs/hooks-reference.html#usestate) hal dəyişənini elan etməyə imkan yaradır.
* [`useEffect()`](https://reactjs.org/docs/hooks-reference.html#useeffect) yan effekt yaratmağa imkan yaradır.
* [`useContext()`](https://reactjs.org/docs/hooks-reference.html#usecontext) müəyyən konteksti oxumağa imkan yaradır.

Amma `React.memo()` və `<Context.Provider>` kimi bəzi digər APIlar vardır ki, onlar Hook *deyildirlər*. Onların əsas təklif edildiyi Hook versiyalarını *kompozisyonalolmayan* və *qeyri-modulyar* hesab etmək olar. Bu məqalə sizə bunu anlamaqda kömək edəcək.

**Qeyd: Bu post API müzakirələrində maraqlı olanlar üçün dərinə gedişdir. Sizin bunların heç birinin React ilə məhsuldar olacağını düşünməyinizə ehtiyac yoxdur!**

---

React APIlarının saxlamaq istəyəcəyi iki mühüm xüsusiyyət vardır:

1. **Kompozisiya:** [Məxsusi Hooklar](https://reactjs.org/docs/hooks-məxsusi.html) Hooks API ilə həyəcanlı olmağımızın ən başdagələn səbəblərindən biridir. Biz insanların öz istədikləri Hooklarını yaradıcığını gözləyirik, və biz əmin olmaq istəyirik ki, müxtəlif insanlar tərəfindən yazılmış Hooklar bir-birilə [konfliktdə deyildirlər](/why-do-hooks-rely-on-call-order/#flaw-4-the-diamond-problem) (Aren’t we all spoiled by how components compose cleanly and don’t break each other?)

2. **Debaqinq:** Biz tətbiq böyüdükcə baqların [asantapılabilən olmağını](/the-bug-o-notation/) istəyirik. React-ın ən yaxşı özəlliklərindən biri odur ki, əgər siz nəyinsə yanlış render olunduğunu görürsünüzsə, o sizə hansı komponentin prop-nun və state-nin bu xətaya səbəb olmağını tapana qədər bütün ağacda gəzməyə şərait yaratmasıdır.

Bu iki məhdudiyyətləri bir yerə gətirsək bizə nəyin Hook ola biləcəyini və ola *bilməyəciyini* deyə bilər. Gəlin bir neçə nümunəyə baxaq.

---

##  Real Hook: `useState()`

### Kompozisiya

Bir neçə hər biri `useState()` çağıran məxsusi Hooklar konfliktdə deyildirlər:

```js
function useMyməxsusiHook1() {
  const [value, setValue] = useState(0);
  // Burada nə baş verirsə, burada qalır.
}

function useMyməxsusiHook2() {
  const [value, setValue] = useState(0);
  // Burada nə baş verirsə, burada qalır.
}

function MyComponent() {
  useMyməxsusiHook1();
  useMyməxsusiHook2();
  // ...
}
```

Yeni şərtsiz `useState()` çağırışı əlavə etmək təhükəsizdir. Yeni hal dəyişəni əlavə etmək üçün sizin komponentin istifadə etdiyi digər Hooklar barədə bilməyə ehtiyacınız yoxdur. Siz həmçinin bir hal dəyişənini dəyişməklə digərlərini qıra bilməzsiniz.

**Qərar:** ✅ `useState()` məxsusi Hookları qırılan etmir.

### Debaqinq

Hooklar faydalıdır, çünki siz Hooklar *arasında* dəyərlər ötürə bilərsiniz.

```js{4,12,14}
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  // ...
  return width;
}

function useTheme(isMobile) {
  // ...
}

function Comment() {
  const width = useWindowWidth();
  const isMobile = width < MOBILE_VIEWPORT;
  const theme = useTheme(isMobile);
  return (
    <section className={theme.comment}>
      {/* ... */}
    </section>
  );
}
```

Amma birdən biz xəta etsək? Debaqing hekayəsi nədir?

Deyək ki, `theme.comment`dan əldə etdiyimiz CSS class yanlışdır. Bunu necə debaq edə bilərik? Biz komponentimizdə qırılmanöqtəsi və bir neçə loglama yerləşdirə bilərik.

Ola bilər ki, biz `theme` yanlış olduğunu, amma `width` və `isMobile` düzgün olduğunu görərdik. Bu bizə deyə bilər ki, problem `useTheme()`in içindədir. Ya da ehtimal ki, biz `width`in özünün yanlış olduğunu görərdik. Bu isə bizə `useWindowWidth()`a baxmalı olduğumuzu deyərdi.

**Sadəcə ortalıqda olan dəyərlərə bir baxışla biz üstdə olan hansı Hookun baqı daşıdığını deyə bilərik.** Biz onların tətbiq olunduğu *bütün* yerlərə baxmaq məcburiyyətində deyilik.

Sonra biz baq olan birində “yaxınlaşdıra", və bunu təkrarlaya bilərik.

Bu məxsusi Hookların içi-içə olma dərinliyi artdığı zaman daha da mühüm olmağa başlayır. Təsəvvür edin ki, bizim 3 səviyyə iç-içə məxsusi Hookumuz var, hər səviyyə özü də içində 3 müxtəlif Hook istifadə edir. Baqa  **3 yerdə** baxmaqla potensial olaraq **3 + 3×3 + 3×3×3 = 39 yerdə** baxmaq arasında [fərq](/the-bug-o-notation/) çox böyükdür. Xoşbəxtlikdən `useState()` sehrli şəkildə digər Hookları və komponentləri “təsirləndirə” bilməz. Baqlı dəyər özündən geridə bir iz buraxır, sadəcə başqa bir dəyişən kimi. 🐛

**Qərar:** ✅ `useState()` səbəb-nəticə əlaqəsini bizim kodda gizlətmir. Biz baqa qədər bütün nöqtələri izləyə bilərik.

---

## Hook olmayan: `useBailout()`

Optimizasiya olaraq, Hook istifadə edən komponentlər yenidən-renderolunmadan azad oluna bilərlər.

Bunu etməyin bir yolu bütün komponentə bir [`React.memo()`](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactmemo) örtüyü yerləşdirməkdir. Əgər proplar son renderdən sonra olanlarla səthi olaraq bərabərdirsə, o yenidən-renderolunmadan azad olunur.

`React.memo()` bir komponent götütür və bir komponent qaytarır:

```js{4}
function Button(props) {
  // ...
}
export default React.memo(Button);
```

**Amma bu niyə sadəcə bir Hook deyil?**

İstəyirsiniz siz bunu `useShouldComponentUpdate()`, `usePure()`, `useSkipRender()`, və ya `useBailout()` adlandırın, təklif bunun kimi bir şeyə bənzəməyə meyl edir:

```js
function Button({ color }) {
  // ⚠️ real API deyil
  useBailout(prevColor => prevColor !== color, color);

  return (
    <button className={'button-' + color}>  
      OK
    </button>
  )
}
```

Bir az daha da variasiyalar vardır (məs. `usePure()` markeri), amma geniş vuruşlarda onların hamsının eyni qüsurları vardır.

### Kompozisiya

Deyək ki, biz `useBailout()`ı iki məxsusi Hookda yoxlayırıq:

```js{4,5,19,20}
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  // ⚠️ Real API deyil
  useBailout(prevIsOnline => prevIsOnline !== isOnline, isOnline);

  useEffect(() => {
    const handleStatusChange = status => setIsOnline(status.isOnline);
    ChatAPI.subscribe(friendID, handleStatusChange);
    return () => ChatAPI.unsubscribe(friendID, handleStatusChange);
  });

  return isOnline;
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  // ⚠️ Real API deyil
  useBailout(prevWidth => prevWidth !== width, width);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return width;
}
```

İndi siz onların hər ikisini eyni komponentdə istifadə etsəniz nə baş verər?

```js{2,3}
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'Typing...'}
    </ChatLayout>
  );
}
```

O nəyi yenidən render edər?

Əgər hər bir `useBailout()` çağırışının yenilənməni atlama kimi bir gücü varsa, onda `useWindowWidth()`dan olan yenilənmələr `useFriendStatus()` tərəfindən bloklanardı, və ya əksinə. **Bu Hooklar bir-birini qırardı.**

Lakin, əgər `useBailout()`

However, if `useBailout()` was only respected when *all* calls to it inside a single component “agree” to block an update, our `ChatThread` would fail to update on changes to the `isTyping` prop.

Daha da pisi, bütün bu sematikalarla **`ChatThread`ə `useBailout()` çağırmayan hər hansı bir yeni əlavə edilmiş Hook, onu qırardı.**

**Qərar:** 🔴 `useBailout()` kompozisiyanı qırır. Onu Hooka əlavə etmək digər Hooklarda hal yenilənmələrini qırır. Biz APIların [qırılabilən olmamasını](/optimized-for-change/) istəyirik, bu davranış isə bunun tamamilə əksidir.

### Debaqinq

`useBailout()` kimi bir Hook debaqqinqə necə təsir göstərir.

Biz eyni misaldan istifadə edəcəyik:

```js
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'Typing...'}
    </ChatLayout>
  );
}
```

Deyək ki, `Typing...` etiketi biz gözlədiyimiz zaman görünmür, baxmayaraq ki, bir neçə qat yuxarıda prop dəyişir. Bunu necə debaq edirik?


**Adətən, React-da bir az nəzər yetirməklə siz buna əminliklə cavab verə bilərsiniz.** Əgər `ChatThread` yeni `isTyping` dəyəri qəbul etmirsə, biz `<ChatThread isTyping={myVar} />` render edən komponenti aça və `myVar` nəzər yetirə bilərik, və beləcə davam edə bilərik. Bu səviyyələrin hansısa birində biz ya baqlı `shouldComponentUpdate()` bailout-unu ya da aşağıya yanlış ötürülən `isTyping` dəyərini tapa bilərik. Zincirdəki hər komponentə bir baxış adətən problemin qaynağını tapmağa kifayət edir.

Lakin, əgər bu `useBailout()` real olsa idi, siz heç vaxt nə üçün yenilənmənin ötürüldüyünü bizim `ChatThread` və onun altında olduğu zincir tərəfindən istifadə olunan *hər bir məxsusi Hook*a (dərindən) baxana qədər bilə bilməzdiniz. Bütün valideyn komponentlər *həm də* məxsusi Hook istifadə edə bildiyindən bu çox pis [miqyaslanır](/the-bug-o-notation/).

Bu sizin özünün də içində balaca çəkməcələri olan çəkməcələrdə vintaçan axtarmağınıza bənzəyir. Ən pisi isə siz nə qədər dərində axtaracağınızı bilmirsiniz.

**Qərar:** 🔴 `useBailout()` sadəcə kompozisiyaları parçalamır, həm də debaqqing addımlarını önəmli dərəcədə artırır və baqlı bailoutun tapılmasındakı idraki yüklənməni - bəzən eksponensial olaraq - artırır.

---

Biz indi real bir Hooka, `useState()` və adətən məsləhət görülən və məqsədli şəkildə Hook *olmayan* - `useBailout()`a baxdıq.
Biz onları Kompozisiya və Debaqqinq prizmasından müqayisə etdik və onlardan birinin işlədiyini və digərinin işləmədiyini müzakirə etdik.

Baxmayaraq ki, `memo()` və ya `shouldComponentUpdate()` üçün “Hook versiyası” yoxdur, React [`useMemo()`](https://reactjs.org/docs/hooks-reference.html#usememo) adlanan Hook təqdim *edir*. O oxşar məqsəd təqdim edir, amma onun semantikası yuxarıda qeyd olunan çökəklərə düşürməyəcək qədər fərqlidir.

`useBailout()` Hook olaraq yaxşı işləməyən sadəcə bir nümunədir. Amma başqaları da mövcuddur - məsələn, `useProvider()`, `useCatch()`, və ya `useSuspense()`.

Görə bilirisiniz niyə?


*(Pıçıltılar: Kompozisiya... Debaqqinq...)*
