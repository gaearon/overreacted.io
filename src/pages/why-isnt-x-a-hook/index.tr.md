---
title: Neden X bir Hook Değil?
date: '2019-01-26'
spoiler: Sırf yapabiliyor olmamız, yapmamız gerektiği anlamına gelmez.
cta: 'react'
---

[React Hooks](https://reactjs.org/hooks) 'un ilk alfa sürümü piyasaya sürüldüğünden beri, tartışmalarda ortaya çıkan bir soru var: “Neden *\<başka bir API\>* bir Hook değil?“

Size hatırlatmak için, işte Hook *olan* birkaç şey:

* [`useState()`](https://reactjs.org/docs/hooks-reference.html#usestate) bir state değişkeni bildirmenize izin verir.
* [`useEffect()`](https://reactjs.org/docs/hooks-reference.html#useeffect) bir side effect bildirmenize izin verir.
* [`useContext()`](https://reactjs.org/docs/hooks-reference.html#usecontext) context okumanıza izin verir.

Ancak Hook *olmayan* başka API'ler de var, `React.memo()` ve `<Context.Provider>` gibi. Yaygın olarak önerilen Hook versiyonları *bileşik olmayan* veya *antimodüler* olacaktır. Bu makale nedenini anlamanıza yardımcı olacak.

**Not: Bu gönderi, API tartışmalarıyla ilgilenen kişiler için ayrıntılı bir incelemedir. React ile üretken olmak için bunların hiçbirini düşünmenize gerek yok!**

---

React API'lerinin korumasını istediğimiz iki önemli özellik var:

1. **Kompozisyon:** [Custom Hooklar](https://reactjs.org/docs/hooks-custom.html) Hooks API konusunda heyecan duymamızın büyük ölçüde nedenidir. İnsanlardan sık sık kendi Hook'larını yapmalarını bekliyoruz ve farklı kişiler tarafından yazılan Hook'ların birbiriyle çelişmediğinden emin olmalıyız.[don't conflict](/why-do-hooks-rely-on-call-order/#flaw-4-the-diamond-problem). (Bileşenlerin nasıl temiz bir şekilde oluşturulduğu ve birbirini bozmadığı konusu hepimizi şımartmıyor mu?)

2. **Hata Ayıklama:** Uygulama büyüdükçe hataların bulunmasının [kolay olmasını](/the-bug-o-notation/) istiyoruz.
React'in en iyi özelliklerinden biri, yanlış render edilmiş bir şey görürseniz, hangi bileşenin props'u veya state'inin hataya neden olduğunu bulana kadar bileşen ağacında gezebilirsiniz.

Bir araya getirilen bu iki kısıtlama bize neyin Hook olabileceğini ve neyin Hook *olamayacağını* söyleyebilir. Hadi birkaç örnek deneyelim.

---

## Gerçek bir Hook: `useState()`

### Kompozisyon

Her biri "useState ()" çağrısı yapan birden çok özel hook çakışmıyor:

```jsx
function useMyCustomHook1() {
const [value, setValue] = useState(0);
// What happens here, stays here.
}

function useMyCustomHook2() {
const [value, setValue] = useState(0);
// What happens here, stays here.
}

function MyComponent() {
useMyCustomHook1();
useMyCustomHook2();
// ...
}
```

Yeni bir koşulsuz "useState ()" çağrısı eklemek her zaman güvenlidir. Yeni bir state değişkeni bildirmek için bir bileşen tarafından kullanılan diğer Hook'lar hakkında hiçbir şey bilmenize gerek yoktur. Ayrıca, birini güncelleyerek diğer state değişkenlerini bozamazsınız.

**Karar:** ✅ `useState()` özel hookları kırılgan yapmaz.

### Hata Ayıklama

Hooklar kullanışlıdır çünkü Kancalar arasında *değerleri* geçirebilirsiniz:

```jsx{4,12,14}
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

Ama ya bir hata yaparsak? Hata ayıklama hikayesi nedir?

`theme.comment` den aldığımız CSS sınıfının yanlış olduğunu varsayalım. Bunu nasıl debug edeceğiz? Bileşenimizin gövdesinde bir breakpoint veya birkaç logs belirleyebiliriz.

Belki `tema` nın yanlış olduğunu ancak `width` ve `isMobile` ifadelerinin doğru olduğunu görebiliriz. Bu bize sorunun `useTheme ()` içinde olduğunu söyler. Ya da belki `width` in kendisinin yanlış olduğunu görürüz. Bu bize `useWindowWidth()` öğesine bakmamızı söyler.

**Ara değerlere tek bir bakış, bize en üst seviyedeki Hook'lardan hangisinin hatayı içerdiğini söyler.** Tüm implementasyon detaylarına bakmamıza gerek yok.

Daha sonra hata olanı “yakınlaştırabilir“ ve tekrar edebiliriz.

Özel Hook yerleştirme derinliği artarsa bu daha önemli hale gelir. Her seviyede 3 farklı özel Hook kullanan 3 seviyeli özel Hook yerleştirme seviyemiz olduğunu hayal edin. **3 yerde** bir hata aramak ile potansiyel olarak **3 + 3×3 + 3×3×3 = 39 yeri** kontrol etmek arasındaki [fark](/ the-bug-o-notation /) çok büyük . Neyse ki, `useState()` diğer Hook'ları veya bileşenleri sihirli bir şekilde “etkileyemez“. Geri dönen bir hatalı değer, tıpkı herhangi bir değişken gibi, arkasında bir iz bırakır. 🐛

**Karar:** ✅ `useState()`, kodumuzdaki neden-sonuç ilişkisini gizlemez. Kırıntıları doğrudan hataya kadar takip edebiliriz.

---

## Bir Hook Değil: `useBailout()`

Bir optimizasyon olarak, Hook'ları kullanan bileşenler yeniden oluşturma işleminden (re-rendering) kurtulabilir.

Bunu yapmanın bir yolu, bileşeni [`React.memo()`](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactmemo) ile sarmalamaktır. Props, son render sırasında sahip olduğumuza sığ bir şekilde eşitse, bileşen yeniden oluşturma işleminden kurtulur. Bu, sınıflarda (Class Components) "PureComponent" a benzemektedir.

`React.memo ()` bir bileşeni alır ve bir bileşen döndürür:

```jsx{4}
function Button(props) {
  // ...
}
export default React.memo(Button);
```

**Ama neden yalnızca bir Hook değil?**

İster `useShouldComponentUpdate()`, `usePure()`, `useSkipRender()` veya `useBailout()` olarak adlandırın, sonuç şunun gibi görünme eğilimindedir:

```jsx
function Button({ color }) {
  // ⚠️ Not a real API
  useBailout(prevColor => prevColor !== color, color);

  return (
    <button className={'button-' + color}>  
      OK
    </button>
  )
}
```

Birkaç varyasyon daha var (örneğin, basit bir `usePure()` işareti), ancak geniş vuruşlarda aynı kusurlara sahipler.

### Kompozisyon

Diyelim ki iki özel Hook'a `useBailout()` koymaya çalışıyoruz:

```jsx{4,5,19,20}
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  // ⚠️ Not a real API
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
  
  // ⚠️ Not a real API
  useBailout(prevWidth => prevWidth !== width, width);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return width;
}
```

Şimdi ikisini de aynı bileşende kullanırsanız ne olur?


```jsx{2,3}
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

Ne zaman yeniden oluşturulur?

Eğer her `useBailout()` çağrısı bir güncellemeyi atlama gücüne sahipse, o zaman `useWindowWidth()` deki güncellemeler `useFriendStatus()` tarafından engellenir ve bunun tersi de geçerlidir. **Bu Hooklar birbirini kırar.**

Ancak, eğer `useBailout()` yalnızca tek bir bileşen içindeki *tüm* çağrılar bir güncellemeyi engellemeyi kabul ettiğinde dikkate alınırsa, `ChatThread` imiz `isTyping` özelliğindeki değişiklikleri güncelleme konusunda başarısız olur.

Daha da kötüsü, bu anlambilimle, **`ChatThread` e yeni eklenen tüm Hook'lar, *ayrıca* `useBailout()` çağrısı yapmazlarsa kırılırdı.** Aksi takdirde, `useWindowWidth()` ve `useFriendStatus()` içindeki kurtarmaya “oy veremezler“.

**Karar:** 🔴 `useBailout()` kompozisyonu bozar. Bir Hook'a eklemek, diğer Hook'lardaki durum güncellemelerini bozar. API'lerin [anti-kırılgan](/optimized-for-change/) olmasını istiyoruz ve bu davranış hemen hemen tam tersidir.


### Hata Ayıklama


`useBailout()` gibi bir Hook, hata ayıklamayı nasıl etkiler?

Aynı örneği kullanacağız:

```jsx
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

Diyelim ki `Typing ...` etiketi, biryerlerde birçok katman yukarıda prop değiştiği halde, görünmüyor. Nasıl hata ayıklayacağız?

**Normalde, React'te *yukarı* bakarak bu soruyu güvenle cevaplayabilirsiniz.** Eğer `ChatThread` yeni bir `isTyping` değeri almazsa, `<ChatThread isTyping={myVar} />` oluşturan bileşeni açabiliriz ve `myVar` ı kontrol edebiliriz vb. Bu düzeylerden birinde, ya bir hatalı `shouldComponentUpdate()` kurtarma paketi veya aktarılan yanlış bir `isTyping` değeri bulacağız. Zincirdeki her bileşene bir kez bakmak, sorunun kaynağını bulmak için genellikle yeterlidir.

Ancak, bu `useBailout()` Hook gerçek olsaydı, `ChatThread` ve sahip zincirindeki bileşenler tarafından kullanılan *her bir özel Hook'u* (derinlemesine) kontrol edene kadar bir güncellemenin neden atlandığını asla bilemezdiniz. Her üst bileşen özel Hook'ları *da* kullanabildiğinden, bu korkunç bir şekilde [ölçekler](/the-bug-o-notation/).

Sanki bir şifonyerde bir tornavida arıyormuşsunuz gibi ve her çekmecede bir grup daha küçük çekmece var ve tavşan deliğinin ne kadar derin olduğunu bilmiyorsunuz.

**Karar:** 🔴 `useBailout()` sadece Hook bileşimi (kompozisyon) bozmakla kalmaz, aynı zamanda hata ayıklama adımlarının sayısını ve hatalı bir kurtarma bulmaya yönelik bilişsel yükü büyük ölçüde artırır - bazı durumlarda, katlanarak.

---

Sadece bir gerçek Hook'a baktık, `useState()` ve kasıtlı olarak bir Hook *olmayan* yaygın bir öneriye baktık: `useBailout()` . Bunları Kompozisyon ve Hata Ayıklama prizmasıyla karşılaştırdık ve birinin neden çalışıp diğerinin çalışmadığını tartıştık.

`memo()` veya `shouldComponentUpdate()` için “Hook versiyonu“ olmasa da, React onun yerine [`useMemo()`](https://reactjs.org/docs/hooks-reference.html#usememo) sunuyor. *useMemo* benzer bir amaca hizmet ediyor, ancak semantiği yukarıda açıklanan tuzaklara girmeyecek kadar farklıdır.


`useBailout()` hook kadar iyi çalışmayan bir şeye sadece bir örnektir. Ama birkaç tane daha var — mesela, `useProvider()`, `useCatch()`, veya `useSuspense()`.

Nedenini görebiliyor musun?


*(Fısıltılar: Kompozisyon ... Hata Ayıklama ...)*