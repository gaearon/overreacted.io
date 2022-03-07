---
title: useEffect İçin Eksiksiz Bir Rehber
date: '2019-03-09'
spoiler: Efektler veri akışınızın bir parçasıdır.
cta: 'react'
---

[Hooklar](https://reactjs.org/docs/hooks-intro.html) ile birkaç bileşen yazdınız. Belki bir de küçük bir uygulama. Durumdan gayet memnunsunuz. API’yı kullanırken rahatsınız ve bu süreçte bir iki de numara kaptınız. Hatta kod tekrarları için birkaç tane [custom hook](https://reactjs.org/docs/hooks-custom.html) yazdınız (300 satır yok oldu!). İş arkadaşlarınıza gururla sundunuz ve “Harika iş çıkarmışsın,” dediler.

Ancak bazen `useEffect`’i kullanırken bazı parçalar tam olarak yerine oturmuyordur. İçten içe bir şeyleri kaçırdığınızı hissedersiniz. Class lifecycle metotlarına benziyor gibidir fakat… Tam olarak öyle mi? Kendinizi şu soruları sorarken bulursunuz:

* 🤔 `componentDidMount`’u `useEffect` kullanarak nasıl tekrar yazabilirim?
* 🤔 `useEffect` içerisinde veriyi nasıl doğru şekilde çekebilirim? `[]` nedir?
* 🤔 Fonksiyonları efekt bağımlılıkları içerisinde belirtmeli miyim?
* 🤔 Neden bazen sonsuz veri çekme döngüsü alıyorum?
* 🤔 Neden bazen efektim içerisinde eski bir state ya da prop değerini görüyorum?

Hookları yeni kullanmaya başladığımda tüm bu sorular benim de kafamı karıştırıyordu. İlk dokümanları yazarken bile bazı inceliklerini tam olarak kavramış değildim. O zamandan beri yaşadığım birkaç aydınlanma anını sizlerle paylaşmak istiyorum. **Bu derinlemesine bakış, bu soruların cevaplarını size olabildiğince bariz bir hale getirecek.**

Cevapları *görebilmemiz* için bir adım geriye çekilmemiz gerekiyor. Bu makalenin amacı sizlere maddeler halinde oluşturulmuş çözüm listeleri sunmak değil. Amaç, `useEffect`’in tam anlamıyla “özünü kavramanıza” yardımcı olmak. Öğrenecek pek bir şey olmayacak. Aksine, zamanımızın büyük bir kısmını öğrendiklerimizi *unutmak* için harcayacağız.

**Ne zaman ki o bilindik lifecycle yöntemlerinin gölgesi ile `useEffect` hook’una bakmayı bıraktım, işte o zaman her şey benim için anlamlı bir hale gelmeye başladı.**

>“Öğrendiğin her şeyi unut” — Yoda

![Yoda havayı kokluyor. Altyazı: “Bacon kokuyor”](./yoda.jpg)

---

**Bu makale [`useEffect`](https://reactjs.org/docs/hooks-effect.html) API’ına bir şekilde aşina olduğunuzu varsaymaktadır.**

**Bu aynı zamanda *oldukça* uzun bir yazı. Bir mini-kitap gibi. Bu, benim tercih ettiğim bir format. Fakat aceleniz varsa ya da pek de umurunuzda değilse aşağıya bir TLDR yazdım.**

**Derinlemesine incelemelerle aranız iyi değilse bu açıklamalar başka bir yerlerde karşınıza çıkana kadar beklemek isteyebilirsiniz. Tıpkı 2013'te React çıktığında olduğu gibi, insanların bunu farklı bir zihinsel model ile tanıyıp öğretmesi biraz zaman alacaktır.**

---

## TLDR

Tüm yazıyı okumak istemiyorsanız, burada kısa bir TLDR var. Bazı kısımlar mantıklı gelmezse benzer bir şeyler bulana dek aşağı kaydırabilirsiniz.

Eğer tüm yazıyı okumayı planlıyorsanız bu kısmı atlamaktan çekinmeyin. Yazının sonuna bir bağlantı linki ekleyeceğim.

**🤔 Soru: `componentDidMount`’u `useEffect` kullanarak nasıl tekrar yazabilirim?**

`useEffect(fn, [])` olarak yazabilirsiniz fakat tam anlamıyla karşılığı değildir. Bu, `componentDidMount`’un aksine props ve stateleri tutacaktır. Yani callback’in içinde bile props’un ve statelerin ilk değerini görüyor olacaksınız. Eğer bir şeyin “en son halini” görmek istiyorsanız bunu bir referansa yazabilirsiniz. Fakat genellikle bunu yapmanıza gerek kalmayacak daha basit bir yol vardır. Efektler için zihinsel modelin `componentDidMount` ve diğer lifecyclelardan farklı olduğunu ve bunların tam eşdeğerlerini bulmaya çalışmanın size yardımdan çok kafa karışıklığı vereceğini unutmayın. Verimli olabilmek adına “efektlerin dilinde düşünmelisiniz”. Onların zihinsel modelleri lifecyclelara yanıt vermekten ziyade senkronizasyonu uygulamaya çok daha yakındır.

**🤔 Soru: `useEffect` içerisinde veriyi nasıl doğru şekilde çekebilirim? `[]` nedir?**

[Bu makale](https://www.robinwieruch.de/react-hooks-fetch-data/) `useEffect` ile veri çekme konusuna iyi bir başlangıç niteliğindedir. Sonuna kadar okuduğunuzdan emin olun! Bunun kadar uzun bir yazı değil. `[]`, efektin React veri akışına katılan herhangi bir değeri kullanmadığı ve bu nedenle bir kez çalışmasının güvenli olduğu anlamına gelir. Bu değer halihazırda kullanılmış ise sıkça karşılaşılan bir hata kaynağıdır. Yanlışlıkla bir bağımlılığı dahil etmemiş olmaktan ziyade bu ihtiyacı ortadan kaldıracak birkaç stratejiyi (`useReducer` ve `useCallback` başta olmak üzere) öğrenmeniz gerekecektir.

**🤔 Soru: Fonksiyonları efekt bağımlılıkları içerisinde belirtmeli miyim?**

Önerilen, prop veya state’e ihtiyaç duymayan fonksiyonları yukarı çekerek (hoisting) bileşeninizin dışına almanız ve sadece efekt tarafından kullanılanları o efektin içine almanızdır. Efektiniz render kapsamındaki fonksiyonları kullanmaya devam ederse (propstaki fonksiyon dahil), onları tanımlandıkları yerde `useCallback` içine alın ve işlemi tekrarlayın. Peki bu neden önemlidir? Çünkü fonksiyonlar, props ve state’teki değerleri “görebilirler” ve böylece bunlar veri akışına dahil olurlar. SSS kapsamında [daha detaylı](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies) bir cevabımız bulunuyor.

**🤔 Soru: Neden bazen sonsuz veri çekme döngüsü alıyorum?**

İkinci bir bağımlılık olmadan veri çekme işlemi yapıyorsanız olabilir. Bu olmadan efektler her render’da tekrar çalışır ve state’i tekrar set etmek efektlerin tekrar çalışmasına sebep olur. Bağımlılık dizisi içerisinde tanımladığınız değer sürekli değişiyorsa sonsuz bir döngü gerçekleşebilir. Buna sebep olanın hangisi olduğunu teker teker silmeyi deneyerek bulabilirsiniz. Fakat kullandığınız bir bağımlılığı silmek (ya da hiç düşünmeden `[]` yazmak) genellikle yanlış bir çözüm olacaktır. Bunun yerine sorunu temelden çözün. Örneğin, fonksiyonlar bu probleme sebep olabilir ve bu fonksiyonları efektlerin içine almak, yukarı taşımak (hoisting) ya da `useCallback` ile sarmak yardımcı olabilir. Objeleri tekrar tekrar oluşturmaktan kaçınmak için de `useMemo` benzer bir amaca hizmet edebilir.

**🤔 Neden bazen efektim içerisinde eski bir state ya da prop değerini görüyorum?**

Efektler, her zaman tanımlandığı render’daki props ve stateleri “görür”. Bu [hataları engellemeye](/how-are-function-components-different-from-classes/) yardımcı olsa da bazı durumlarda can sıkıcı olabilir. Bu gibi durumlarda değiştirilebilir (mutable) bir referans içerisinde bazı değerleri açıkça tutabilirsiniz (yazının sonunda bağlantısı verilmiş makalede bu durum açıklanmakta). Beklemediğiniz bir şekilde eski bir render’daki props veya state değerlerini görüyorsanız muhtemelen bazı bağımlılıkları gözden kaçırmışsınızdır. Bunları fark edebilme konusunda kendinizi eğitebilmek adına şu [lint kuralını](https://github.com/facebook/react/issues/14920) uygulamayı deneyin. Birkaç gün içerisinde bu bir alışkanlık haline gelecektir. Buna ek olarak, şu SSS [cevabına](https://reactjs.org/docs/hooks-faq.html#why-am-i-seeing-stale-props-or-state-inside-my-function) da bakın.

---

Umarım bu TLDR faydalı olmuştur! Öyleyse, başlayalım.

---

## Her Render’ın Kendi State ve Propları Vardır

Efektlerden bahsetmeden önce render sürecinden bahsetmemiz gerekiyor.

Bu bir sayaç. Vurgulanmış satıra dikkatle bakın:

```jsx{6}
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

Bu ne anlama geliyor? `Count` bir şekilde state’imizdeki değişiklikleri “izliyor” ve otomatik olarak güncelliyor mu? Bu, React’i öğrenirken faydalı bir ön sezgi olabilir ancak [doğru bir zihinsel model](https://overreacted.io/react-as-a-ui-runtime/) değildir.

**Bu örnekte, `count` yalnızca bir sayıdır.** Mucizevi bir “veri bağlayıcı”, “izleyici”, “proxy” ya da benzer bir şey değildir. Şunun gibi sıradan bir sayıdır:

```jsx
const count = 42;
// ...
<p>You clicked {count} times</p>
// ...
```

Bileşenimiz ilk render edildiğinde `useState()` fonksiyonundan gelen `count` değişkeni `0`'dır. `setCount(1)` fonksiyonunu çağırdığımızda, React bileşenimizi tekrar çağırır. Bu sefer `count`, `1` olacaktır. Ve bu şekilde devam eder:

```jsx{3,11,19}

// İlk render esnasında
function Counter() {
  const count = 0; // useState() fonksiyonundan döner  
  // ...
  <p>You clicked {count} times</p>
  // ...
}

// Tıklama sonrası fonksiyonumuz tekrar çağırılır 
function Counter() {
  const count = 1;  // useState() fonksiyonundan döner  
  // ...
  <p>You clicked {count} times</p>
  // ...
}

//  Yeni bir tıklamadan sonra fonksiyonumuz tekrar çağırılır
function Counter() {
  const count = 2; // useState() fonksiyonundan döner 
  // ...
  <p>You clicked {count} times</p>
  // ...
}
```
**Biz state’i güncelledikçe, React bileşeni tekrar çağırır. Her render sonucu fonksiyonun içerisinde tanımlanmış bir constant olan kendi `counter` state değerini “görür”.**

Bu durumda, bu satır herhangi bir özel veri bağlama işlemi yapmaz.

```jsx
<p>You clicked {count} times</p>
```

**Bu, sadece render çıktısına bir sayı değeri ekler.** Bu sayı React tarafından sağlanmaktadır. `setCount`’u çağırdığımızda, React bileşenimizi farklı bir `count` değeri ile tekrar çağırır. Ardından React, DOM’u en son render çıktısı ile eşleşecek şekilde günceller.

Buradaki anahtar nokta herhangi bir render’daki `count` sabitinin zamanla değişmiyor oluşudur. Tekrar çağırılan şey bizim bileşenimizin kendisidir. Her bir render’da, renderlar arası soyutlanmış kendi `count` değerini “görür”.

*(Bu sürece derinlemesine bir genel bakış için [Bir UI Runtime’ı Olarak React](https://overreacted.io/react-as-a-ui-runtime/) yazıma bir göz atın.)*

## Her Render’ın Kendi Event Handlerları Vardır

İyi gidiyoruz. Peki ya event handlerlar?

Şu örneğe bir bakın. Üç saniye sonra `count` değeri ile bir alert fonksiyonu çalıştırıyor:

```jsx{4-8,16-18}
function Counter() {
  const [count, setCount] = useState(0);

  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
      <button onClick={handleAlertClick}>
        Show alert
      </button>
    </div>
  );
}
```

Şu sıralı adımları yapıyorum diyelim:
* Counter’ı 3'e **arttır**
* Show Alert’e **tıkla**
* Timeout gerçekleşmeden önce sayıyı 5'e **arttır**

![Counter demo](./counter.gif)

Alert’in ne göstermesini beklersiniz? Alert fonksiyonu çalıştığında counter’ın o anki state’i olan 5'i mi gösterecek? Yoksa tıkladığım zamanki state olan 3'ü mü gösterecek?

----

*Spoiler geliyor.*

---

Hadi, [kendiniz deneyin!](https://codesandbox.io/s/w2wxl3yo0l)

Eğer bu davranış size mantıklı gelmiyorsa, daha işlevsel bir örnek hayal edin: state içerisinde mevcut alıcı durumunda olan bir ID ve bir gönder butonu. [Bu makale](https://overreacted.io/how-are-function-components-different-from-classes/), nedenlerini derinlemesine bir şekilde inceliyor olsa da kısaca doğru cevap 3 olacak.

Alert fonksiyonu, benim butona tıkladığım anki state’i “yakalıyor”.

*(Farklı yaklaşımları uygulamanın yolları da vardır fakat şimdilik mevcut duruma odaklanacağım. Zihinsel model oluştururken “kolaya kaçmayı” isteğe bağlı kaçışlardan ayırmamız önemlidir.)*

---

Ancak bu nasıl çalışıyor?

Fonksiyonumuza yapılan her çağrıda `count` değerinin bir constant olduğunu söylemiştik. Şunu vurgulamakta fayda var; **fonksiyonumuz birkaç kere çağırılır (her render’da birer kere) fakat her seferinde içerideki `count` değeri constant ile tanımlanmıştır ve belirli bir değere set edilmiştir (o anki render’daki state değeri).**

Bu sadece React özelinde bir şey değildir, sıradan fonksiyonlar da benzer şekilde çalışır:

```jsx{2}
function sayHi(person) {
  const name = person.name;
  setTimeout(() => {
    alert('Hello, ' + name);
  }, 3000);
}

let someone = {name: 'Dan'};
sayHi(someone);

someone = {name: 'Yuzhi'};
sayHi(someone);

someone = {name: 'Dominic'};
sayHi(someone);
```

[Bu örnekte](https://codesandbox.io/s/mm6ww11lk8) dışarıda tanımlanmış `someone` değişkeni birkaç kere tekrar farklı değerlere atanmış. (Tıpkı React’te bir yerlerde, *mevcut* bileşen state’inin değişebildiği gibi.) **Ancak `sayHi` fonksiyonu içerisinde, çağırılma durumuna özgü `person` değerine bağımlı, lokal bir constant `name` değeri bulunmakta.** Bu constant değeri lokaldir, bu yüzden fonksiyon çağrılmalarından soyutlanmıştır! Sonuç olarak timeout’lar çalıştığında her biri kendi `name` değerini “hatırlayacaktır”.

Bu bizim event handler’ımızın tıklama anında `count` değerini nasıl yakaladığını da açıklar. Eğer aynı yerine geçirme prensibini (substitution principle) kullanırsak her render kendi `count` değerini görecektir:


```jsx{3,15,27}
// İlk render esnasında
function Counter() {
  const count = 0; // useState() fonksiyonundan döner
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}

// Tıklama sonrası fonksiyonumuz tekrar çağırılır
function Counter() {
  const count = 1; // useState() fonksiyonundan döner
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}

// Yeni bir tıklama sonrası fonksiyonumuz tekrar çağırılır
function Counter() {
  const count = 2; // useState() fonksiyonundan döner
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}
```

Böylelikle her bir render kendi `handleAlertClick` “sürümünü” döndürür. Bu “sürümlerin” her biri kendi `count` değerini “hatırlar”:


```jsx{6,10,19,23,32,36}
// İlk render esnasında
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 0);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // İçinde 0 olan 
  // ...
}

// Tıklama sonrası fonksiyonumuz tekrar çağırılır
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 1);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // İçinde 1 olan 
  // ...
}

// Yeni bir tıklama sonrası fonksiyonumuz tekrar çağırılır
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 2);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // İçinde 2 olan 
  // ...
}
```

Bu nedenle, [bu demoda](https://codesandbox.io/s/w2wxl3yo0l) event handlerlar belirli render’lara “aittir” ve tıkladığınızda, `counter`, mevcut render’daki state değerini kullanmaya devam eder.

**Herhangi mevcut bir render içerisinde, props ve state her zaman aynı kalır.** Fakat props ve state, renderler arası ayrılmışsa, bunları kullanan veriler de ayrılmıştır (event handlerlar da dahil olmak üzere). Bunlar aynı zamanda belirli renderlara “aittirler”. Böylece event handler içerisindeki asenkron bir fonksiyon bile aynı `count` değerini “görecektir”.

*Not: Yukarıdaki `handleAlertClick` fonksiyonlarında somutlaşmış `count` değerlerini satır içinde kullandım. Bu zihinsel yer değiştirme güvenlidir, çünkü `count` değerinin belirli bir render içerisinde değişmesi mümkün değildir. `Const` ile tanımlanmıştır ve bir sayıdır. Bu state’i değiştirmeyeceğimiz(mutation) garantisini verdiğimizde, objeler gibi diğer değerler için de güvenli olabilir. Değiştirmekten ziyade yeni oluşturulmuş bir obje ile `setSomething(newObj)` fonksiyonunu çağırmakta sıkıntı yoktur çünkü bir önceki render’a ait state bozulmamış durumdadır.*

## Her Render’ın Kendi Efekti Vardır

Bunun efektlerle ilgili bir yazı olması gerekiyordu fakat henüz efektler hakkında konuşmaya başlamadık bile! Şimdi toparlayacağız. Görünüşe göre, efektlerin de pek bir farkı yok.

[Dokümanda](https://reactjs.org/docs/hooks-effect.html) bulunan şu örneğe bir dönelim:

```jsx{4-6}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

**Size bir soru: bu efekt nasıl oluyor da `count` state’inin son halini okuyabiliyor?**

Belki efekt fonksiyonunun içindeki `count` değerinin güncellemesini yapan bir tür “veri bağlama” veya “izleme” vardır? Belki de `count`, React’in bileşenimiz içerisinde set ettiği değiştirilebilir (mutable) bir değişkendir ve böylece efektimizin her zaman en son değeri görebiliyordur?

Hayır.

Mevcut bileşen render’ı içerisindeki `count` değerinin bir constant olduğunu zaten biliyoruz. Event handlerlar, `count` state’ini “ait” oldukları render’dan görürler çünkü `count`, onların kapsamı (scope) içerisinde olan bir değişkendir. Aynısı efektler için de geçerlidir!

**Bu “değişmez” efektin içerisinde bir yolunu bulup değişen şey `count` değildir. Bu, her render’da farklı olan efekt fonksiyonun kendisidir.**

Her bir sürüm, ait olduğu render’daki kendi `count` değerini “görür”:


```jsx{5-8,17-20,29-32}
// İlk render esnasında
function Counter() {
  // ...
  useEffect(
    // İlk render'daki efekt fonksiyonu
    () => {
      document.title = `You clicked ${0} times`;
    }
  );
  // ...
}

// Tıklamadan sonra fonksiyonumuz tekrar çağırılır
function Counter() {
  // ...
  useEffect(
    // İkinci render'daki efekt fonksiyonu
    () => {
      document.title = `You clicked ${1} times`;
    }
  );
  // ...
}

// Yeni bir tıklamadan sonra fonksiyonumuz tekrar çağırılır
function Counter() {
  // ...
  useEffect(
    // Üçüncü render'daki efekt fonksiyonu
    () => {
      document.title = `You clicked ${2} times`;
    }
  );
  // ..
}
```

React, tanımladığınız efekt fonksiyonunu hatırlar ve DOM’daki değişiklikleri temizleyip tarayıcının ekranı donatmasından sonra çalıştırır.

Dolayısıyla burada tek bir kavramsal *efekt*ten (document başlığının güncellenmesi) bahsetsek bile bu her render’da *farklı bir fonksiyon* ile temsil edilir. Her bir efekt fonksiyonu “ait olduğu” render’daki props ve state’i görür.


**Kavramsal açıdan, efektleri *render sonucunun bir parçası* olarak düşünebilirsiniz.**

Kesin konuşmak gerekirse, öyle değiller (dağınık söz dizimi ya da runtime aşımı olmadan [hook yapısına izin verebilmek](https://overreacted.io/why-do-hooks-rely-on-call-order/) amacıyla). Fakat bizim inşa ettiğimiz zihinsel modelde, efekt fonksiyonları, event handlerlarında olduğu gibi belirli bir render’a *aittirler*.

---

Sağlam bir altyapımız olduğundan emin olmak için ilk render’ımızı özetleyelim:

* **React:** State `0` olduğu zaman bana kullanıcı arayüzünü ver.
* **Bileşeniniz:**
  * Render sonucunuz şöyle: 
  `<p>You clicked 0 times</p>`.
  * Ayrıca işiniz bittikten sonra şu efekti çalıştırmayı unutmayın: `() => { document.title = 'You clicked 0 times' }`.
* **React:** Tabii. Kullanıcı arayüzü güncelleniyor. Hey tarayıcı, DOM’a bir şeyler ekliyorum.
* **Tarayıcı:** Harika, ben ekrana yansıtırım.
* **React:** Tamam, şimdi senin verdiğin efekti çalıştıracağım.
  * `() => { document.title = 'You clicked 0 times' }` çalıştırılıyor.

---

Şimdi de tıklamanın ardından neler olduğunu bir özetleyelim:

* **Bileşeniniz:** Hey React, state'imi `1`.
* **React:** State `1` olduğu zaman bana kullanıcı arayüzünü ver.
* **Bileşeniniz:**
  * Render sonucunuz şöyle: 
  `<p>You clicked 1 times</p>`.
  * Ayrıca işiniz bittikten sonra şu efekti çalıştırmayı unutmayın: `() => { document.title = 'You clicked 1 times' }`.
* **React:** Tabii. Kullanıcı arayüzü güncelleniyor. Hey tarayıcı, DOM’u değiştirdim.
* **Tarayıcı:**  Harika, değişikliklerini ekrana yansıttım.
* **React:** Tamam, şimdi az önce yaptığım render’a ait efekti çalıştıracağım.
  * `() => { document.title = 'You clicked 1 times' }` çalıştırılıyor.

---

## Her Renderın Kendi… Her Şeyi Vardır

**Artık efektlerin her render’dan sonra çalıştığını, kavramsal olarak bileşenin çıktısının bir parçası olduğunu ve o render’daki props ve state’i gördüğünü biliyoruz.**

Şimdi bir düşünce deneyi yapalım. Şu kodu göz önünde bulundurun:

```jsx{4-8}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      console.log(`You clicked ${count} times`);
    }, 3000);
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

Kısa süreli bir gecikmeyle birkaç kez tıklarsam, konsolda nasıl gözükecek?

---

*Spoiler geliyor.*

---

Bunun beklenmedik bir sorun olduğunu ve sonuçların sezgisel olmadığını düşünebilirsiniz. Öyle değil! Her biri belirli bir işleme ait ve dolayısı ile kendi `count` değerine sahip bir dizi konsol çıktısı göreceğiz. [Kendiniz de deneyebilirsiniz](https://codesandbox.io/s/lyx20m1ol):


![Screen recording of 1, 2, 3, 4, 5 logged in order](./timeout_counter.gif)

“Tabii ki böyle çalışacaktı! Başka nasıl olabilirdi ki?” diye düşünebilirsiniz.

Eh, `this.state` class yapılarında böyle çalışmaz. Şu [class uygulamasının](https://codesandbox.io/s/kkymzwjqz3) eşdeğer olduğunu düşünme hatasına düşmek kolaydır:

```jsx
  componentDidUpdate() {
    setTimeout(() => {
      console.log(`You clicked ${this.state.count} times`);
    }, 3000);
  }
```

Ancak `this.state.count` her zaman ait olduğu render’dakine değil, en son count değerini işaret eder. Bu yüzden, her seferinde `5` değerinin konsola yazıldığını görürsünüz:

![Screen recording of 5, 5, 5, 5, 5 logged in order](./timeout_counter_class.gif)

Hookların JavaScript closurelarına bu denli güvenmesinin ironik olduğunu düşünüyorum, ancak yine de, genellikle closure ile ilişkilendirilen [geleneksel timeout’daki yanlış değer karmaşısından](https://wsvincent.com/javascript-closure-settimeout-for-loop/) muzdarip olan da class kullanımlarıdır. Bunun sebebi, bu örnekteki karışıklığın asıl sebebinin closure değil, mutation olmasıdır (React class yapılarındaki `this.state` değerini, en son state değerini işaret edebilmek için değiştirir).

**Closure, değerlerinizin değişmediği durumlarda harikadır. Bu, onlar üzerine düşünmeyi kolaylaştırır çünkü aslında bahsettiğiniz constant değerlerdir.** Ve daha önce de bahsettiğimiz gibi, props ve state, mevcut renderlarda asla değişmezler. Bu arada, bu class uygulamasını da bir şekilde düzeltebiliriz. [Closure kullanarak](https://codesandbox.io/s/w7vjo07055)...

## Akıntıya Kürek Çekmek

Bu noktada, şunu açıkça belirtmemiz önemlidir: Bileşenin render’ı içerisindeki **her** fonksiyon (içerisindeki event handlerlar, efektler, timeoutlar ya da API çağırıları da dahil) tanımlandıkları render içerisindeki props ve stateleri yakalar.

Şu iki örnek birbirlerine denktir:

```jsx{4}
function Example(props) {
  useEffect(() => {
    setTimeout(() => {
      console.log(props.counter);
    }, 1000);
  });
  // ...
}
```

```jsx{2,5}
function Example(props) {
  const counter = props.counter;
  useEffect(() => {
    setTimeout(() => {
      console.log(counter);
    }, 1000);
  });
  // ...
}
```
**Props ya da state’i bileşeniniz içerisinde daha “erken” okumanızın bir önemi yoktur.** Değişmeyecekler! Tek bir render’ın kapsamı(scope) içerisindeki props ve state aynı kalacaktır.(Props’a destruction işlemi uygulamak bunu daha belirgin hale getirir.)

Tabii ki bazen, efekt içerisinde tanımlanmış bir callback’te, yakalanmış değeri değil son değeri görmek isteyebilirsiniz. Bunun en kolay yolu [bu makalenin](https://overreacted.io/how-are-function-components-different-from-classes/) de sonunda bahsedildiği gibi referansları kullanmaktır.

Unutmayın; geçmiş render’daki bir fonksiyondan, gelecekteki props ve state’i istiyorsanız bu akıntıya kürek çekmek gibidir. Yanlış değildir (bazı durumlarda gereklidir de) fakat paradigmanın dışına çıkmak daha az ‘temiz’ görünebilir. Bu kasıtlı bir sonuçtur çünkü hangi kodun bozulmaya müsait ve zamanlamaya bağlı olduğunu vurgulamaya yardımcı olur. Bu durum class yapılarında daha az belirgindir.

Counter örneğimizin, bu class davranışını tekrar eden [versiyonu](https://codesandbox.io/s/rm7z22qnlp) aşağıda verilmiştir:


```jsx{3,6-7,9-10}
function Example() {
  const [count, setCount] = useState(0);
  const latestCount = useRef(count);

  useEffect(() => {
      // Değiştirilebilir (mutable) son değeri set et
    latestCount.current = count;
    setTimeout(() => {
      // Değiştirilebilir (mutable) son değeri oku
      console.log(`You clicked ${latestCount.current} times`);
    }, 3000);
  });
  // ...
```

![Screen recording of 5, 5, 5, 5, 5 logged in order](./timeout_counter_refs.gif)

React’te bir şeyi değiştirmek (mutation) tuhaf gelebilir. Ancak React’in kendisi class yapısında `this.state`’i bu şekilde yeniden tanımlar. Yakalanmış props ve statelerde olan durumun aksine belirli bir callback’te, `lastCount.current`’in aynı değerini vereceğine dair herhangi bir garantiniz yoktur. Tanımı itibari ile bunu istediğiniz zaman değiştirebilirsiniz. Bu yüzden varsayılan değildir ve bunu tercih etmelisiniz.

## Peki Ya Cleanuplar?

[Dokümanların da açıklandığı](https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup) gibi bazı efektlerin bir cleanup aşaması olabilir. Aslında bunun amacı, abonelikler gibi durumlar için bu efekti “geri almaktır”.

Şu kodu göz önünde bulundurun:

```jsx
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);
    };
  });
```

`Props`’un ilk render’da `{id: 10}`, ikinci render’da ise `{id: 20}` olduğunu düşünelim. Şöyle bir durumun olacağını düşünebilirsiniz:
* React, `{id: 10}` için efekti temizler.
* React, `{id: 20}` için kullanıcı arayüzünü oluşturur.
* React, `{id: 20}` için efekti çalıştırır.

(Pek de öyle sayılmaz.)

Bu zihinsel modelde, cleanup’ın, tekrar render edilmeden önce çalıştığı için eski props’u “gördüğünü” ve yeni efektin, tekrar render edildikten sonra çalıştığı için yeni props’u “gördüğünü” düşünebilirsiniz. Bu zihinsel model class yapılarındaki lifecycle’dan alınmıştır ve **bu duruma uygun değildir.** Neden olduğuna bir bakalım.

React, efektleri sadece tarayıcı [ekrana yansıttıktan](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f). sonra çalıştırır. Çoğu efektin ekran güncellemelerini engellemesi gerekmediğinden bu, uygulamanızın daha hızlı çalışmasını sağlar. Efekt cleanup’ları da bu sebeple ertelenir. **Bir önceki efekt, yeni props ile tekrar render edildikten sonra temizlenir:**

* **React, `{id: 20}` için kullanıcı arayüzünü oluşturur.**
* Tarayıcı ekrana yansıtır. Ekranda `{id: 20}` için olan kullanıcı arayüzünü görürüz.
* **React, `{id: 10}` için efekti temizler.**
* React `{id: 20}` için efekti çalıştırır. 

Merak ediyor olabilirsiniz: nasıl olur da bir önceki efektin cleanup’ı, props `{id: 20}` olmasına rağmen hala eski `{id: 10}` props’unu görebiliyor?

Bunu daha önce yaşamıştık…  🤔

![Deja vu (cat scene from the Matrix movie)](./deja_vu.gif)

Bir önceki bölümden alıntılarsak:

>Bileşenin render’ı içerisindeki her fonksiyon (içerisindeki event handlerlar, efektler, timeoutlar ya da API çağırıları da dahil) tanımlandıkları render içerisindeki props ve stateleri yakalar.

O zaman cevap gayet açık! Efekt cleanup’ı “en son” props’u okumaz, bu her ne anlama geliyorsa artık. Tanımlandığı render’a ait props’u okur.

```jsx{8-11}
// İlk render, props {id: 10}
function Example() {
  // ...
  useEffect(
    // İlk render'daki efekt
    () => {
      ChatAPI.subscribeToFriendStatus(10, handleStatusChange);
    // İlk render'daki efekt için cleanup
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(10, handleStatusChange);
      };
    }
  );
  // ...
}

// Bir sonraki render, props {id: 20}
function Example() {
  // ...
  useEffect(
    // İkinci render'daki efekt
    () => {
      ChatAPI.subscribeToFriendStatus(20, handleStatusChange);
      // İkinci render'daki efekt için cleanup
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(20, handleStatusChange);
      };
    }
  );
  // ...
}
```

Krallıklar yükselecek ve yerle bir olacak, Güneş dış katmanlarından beyaz cüce olmak üzere ayrılacak ve son medeniyet de sona erecek. Ancak hiçbir şey, `{id: 10}` dışında props’un, ilk render efektinin cleanup’ı tarafından “görülmesini” sağlayamayacak.

React’in ekrana yansıtmasından hemen sonra efektlerle ilgilenmesine izin veren de, uygulamalarınızı en başta daha hızlı halde getiren de budur. Eğer kodunuzun ihtiyacı olursa, eski props hala oradadır.

## Lifecycle Değil Senkronizasyon

React ile ilgili en sevdiğim şeylerden biri, ilk render sonucunu ve güncellemeleri betimlemeyi birleştirmesidir. Bu da programınızın [entropisini azaltır](https://overreacted.io/the-bug-o-notation/).

Bileşenimin böyle bir şey olduğunu düşünelim:

```jsx
function Greeting({ name }) {
  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

Önce `<Greeting name=”Dan” /> `sonra `<Greeting name=”Yuzhi” />` ya da sadece `<Greeting name=”Yuzhi” />` renderlamamın bir önemi yok. Sonuç olarak her iki durumda da “Hello, Yuzhi” göreceğiz.

İnsanlar “Önemli olan varılacak yer değil, yolculuğun kendisidir.” der. Konu React olduğunda bu tam tersidir. **Önemli olan yolculuk değil, sadece varılacak yerdir.** jQuery kodlarındaki `$.addClass` ve `$.removeClass` çağrıları(“yolculuk”) ile React kodundaki CSS classlarının nasıl olması gerektiğini(“varılacak yer”) belirtmek arasındaki fark budur.

**React, DOM’u mevcut props ve statelerimize uygun şekilde senkronize eder.** Render esnasında “oluşturma(mount)” ve “güncelleme(update)” arasında bir ayrım yoktur.

Efektleri de benzer şekilde düşünmelisiniz. **useEffect React ağacının dışındaki her şeyi props ve state’e uygun şekilde *senkronize* eder.**

```jsx{2-4}
function Greeting({ name }) {
  useEffect(() => {
    document.title = 'Hello, ' + name;
  });
  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

Bu, bilindik *“mount/update/unmount”* zihinsel modelinden biraz farklıdır. Bunu içselleştirmek gerçekten önemli. **Bileşenin ilk kez oluşturulup oluşturulmamasına bağlı olarak farklılaşan bir efekt yazmaya çalışıyorsanız, akıntıya karşı yüzüyorsunuz!** Sonucumuz “varış noktası” yerine “yolculuğa” bağlı olduğunda, senkronizasyonda başarısız oluyoruz.

A, B ve C props’u ile mi yoksa hemen C ile mi render ettiğimizinin bir önemi yok. Bazı geçici farklılıklar olsa da (veri çekerken olduğu gibi) nihayetinde alacağımız sonuç aynı olmalıdır.

Yine de, elbette tüm efektleri her render’da çalıştırmak verimli olmayabilir (bu bazen de sonsuz döngülere yol açabilir).

Peki bunu nasıl düzeltebiliriz?

## React’e Efektlerinize Karşılaştırma Yaptırmayı Öğretmek

Bu dersi DOM’un kendisi ile zaten öğrenmiştik. Her yeni render’da buna dokunmak yerine, React sadece DOM’un gerçekten değişen kısımlarını günceller.

Bunu:

```jsx
<h1 className="Greeting">
  Hello, Dan
</h1>
```

Şuna güncellerken:

```jsx
<h1 className="Greeting">
  Hello, Yuzhi
</h1>
```

React iki obje görür:

```jsx
const oldProps = {className: 'Greeting', children: 'Hello, Dan'};
const newProps = {className: 'Greeting', children: 'Hello, Yuzhi'};
```

İkisinin de props’una bakar; `children`’ın değiştiğini ve DOM güncellemesine ihtiyaç olduğunu belirler. Fakat `className` değişmemiştir. Bu sebeple sadece şöyle yapar:

```jsx
domNode.innerText = 'Hello, Yuzhi';
// domNode.className'e dokunmaya gerek yok
```

**Efektlerle de böyle bir şey yapabilir miyiz? Efekti uygulamanın gereksiz olduğu yerlerde tekrar tekrar çalıştırmaktan kaçınmak güzel olurdu.**

Örneğin, bir state değişikliği nedeniyle bileşenimiz tekrar render edilebilir:

```jsx{11-13}
function Greeting({ name }) {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    document.title = 'Hello, ' + name;
  });

  return (
    <h1 className="Greeting">
      Hello, {name}
      <button onClick={() => setCounter(count + 1)}>
        Increment
      </button>
    </h1>
  );
}
```

Fakat efektimiz `counter` state’ini kullanmıyor. **Efektimiz, `document.title`’ı name prop’u ile senkronize ediyor ve `name` prop’u hala aynı.** Bu yüzden her `counter` değişiminde `document.title`’ı baştan atamak çok da ideal durmuyor.

Pekala, o zaman React doğrudan… efektlere karşılaştırma(diff işlemi) yapabilir mi?


```jsx
let oldEffect = () => { document.title = 'Hello, Dan'; };
let newEffect = () => { document.title = 'Hello, Dan'; };
// React bu iki fonksiyonun aynı şeyi yaptığını görebilir mi?
```

Pek sayılmaz. React, fonksiyonu çağırmadan fonksiyonun ne yaptığını tahmin edemez. (Kaynak, belirli değerleri çok da kapsamaz, sadece `name` prop’u ile bir bağlantı oluşturur (close over).)

Bu yüzden, efektleri gereksiz yere tekrar çalıştırmanın önüne geçmek istiyorsanız `useEffect`’e bir bağımlılık dizisi (dependency array ya da “deps”) oluşturmalısınız.

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]); // Bağımlılıklarımız
```

**Bu, React’e “Hey, bu fonksiyonu göremediğini biliyorum fakat söz veriyorum render kapsamında sadece `name`’i kullanıyor. Başka bir şey kullanmıyor.” demek gibidir.**

Eğer bu değerlerin ikisi de efektin önceki ve mevcut çalışmalarında aynı kaldıysa, senkronize edilecek hiçbir şey yok demektir ve React bu efekti atlayabilir:

```jsx
const oldEffect = () => { document.title = 'Hello, Dan'; };
const oldDeps = ['Dan'];

const newEffect = () => { document.title = 'Hello, Dan'; };
const newDeps = ['Dan'];

// React içeriye bir göz atamaz ama bağımlılıkları karşılaştırabilir. 
// Tüm bağımlılıklar aynı olduğu için efekti tekrar çalıştırmasına gerek yoktur.

```

Eğer bu iki render arasında bağımlılık dizisindeki tek bir değer bile değiştiyse, biliyoruz ki efektin çalışması kaçınılmazdır. Her şeyi senkronize edin

## React’e Bağımlılıklarınız Hakkında Yalan Söylemeyin

React’e bağımlılıklar hakkında yalan söylemenin bazı kötü sonuçları olacaktır. Sezgisel olarak bu mantıklı geliyordur fakat class yapısının zihinsel modeli ile `useEffect`’i deneyen neredeyse herkesin bu kuralları çiğnemeye çalıştığını fark ettim. (Bunu başta ben de yapmıştım!)

```jsx
function SearchResults() {
  async function fetchData() {
    // ...
  }

  useEffect(() => {
    fetchData();
  }, []); // Bu doğru mu? Her zaman değil. Ve bunu daha iyi yazmanın bir yolu var. 

  // ...
}
```

*([Hooks SSS](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies), bunun yerine ne yapmak gerektiğini açıklıyor. Bu örneğe [aşağıda](#moving-functions-inside-effects) tekrar bakacağız.)*

“Ama onu sadece ilk oluşturmada(mount) çalıştırmak istiyorum!” diyebilirsiniz. Şimdilik sadece şunu unutmayın: bağımlılıkları belirtirseniz, **bileşeninizin içerisinde olan ve efekt tarafından kullanılan *tüm* değerler orada *olmalıdır*.** Props, state, fonksiyonlar dahil; bileşeninizdeki her şey.

Bazen bunu yaptığınızda, bir soruna neden olabilir. Örneğin, sonsuz bir veri çekme döngüsü görebilirsiniz ya da soketler çok sık yeniden oluşturulabilir. Bu sorunun çözümü, bir bağımlılığı ortadan kaldırmak değildir. Çözümlerine çok yakında bakıyor olacağız.

Çözümlere geçmeden önce sorunu daha yakından tanıyalım.

## Bağımlılıklar Yalan Söylerse Ne Olur

Eğer bağımlılık dizisi efekt tarafından kullanılan her değeri içeriyorsa React ne zaman yeniden render işlemini gerçekleştireceğini biliyor olacaktır.

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]);
```

![Diagram of effects replacing one another](./deps-compare-correct.gif)

*(Bağımlılıklar farklı, o halde efekti tekrar çalıştırıyoruz.)*

Fakat bu efekt için `[]` vermiş olsaydık, yeni efekt çalışmayacaktı.

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, []); // Yanlış: name değişkeni bağımlılıklarda eksik
```

![Diagram of effects replacing one another](./deps-compare-wrong.gif)

*(Bağımlılıklar eş, o halde bu efekti geçiyoruz.)*

Bu durumda sorun bariz görünebilir. Ancak başka durumlarda, bu sezgiler hafızanızdan “fırlayan” bir class çözümü ile sizi yanıltabilir.

Örneğin, her saniye artan bir sayaç yazdığımızı varsayalım. Class yapısı ile sezgilerimiz “interval’ı bir kez ayarlayın ve bir kez yok edin.” şeklinde olacaktır. Bunu nasıl yapabileceğimi şu [örnekte](https://codesandbox.io/s/n5mjzjy9kl) gösterilmiştir. Bu kodu zihinsel olarak `useEffect`’e çevirdiğimizde, bağımlılıklara içgüdüsel olarak `[]` ekleriz. Sonuçta, “Bir kere çalışmasını istiyorum,” değil mi?

```jsx{9}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
```

Fakat bu örnekte [yalnızca bir artış](https://codesandbox.io/s/91n5z8jo7r) oluyor. Ups.


Eğer zihinsel modeliniz “bağımlılıklar, efekti ne zaman yeniden tetiklemek istediğimi belirtmeme izin verin” ise bu örnek size varoluşsal bir kriz verebilir. Bu bir interval olduğu için bir kez tetiklemek istiyorsunuz. Öyleyse, neden sorunlara neden oluyor?

Bu ancak bağımlılıkların, efektin render kapsamında kullandığı her şeyin React’e sunduğumuz ipuçları olduğunu biliyorsanız mantıklıdır. `Count`’u kullanır fakat biz `[]` yazarak yalan söyledik. Bunun canımızı acıtması an meselesi!

İlk render’da `count`, 0'dır. Bu nedenle `setCount(count + 1)`, `setCount(0 + 1)` anlamına gelir. **`[]` bağımlılığı yüzünden tekrar render işlemi yapmadığımız için her saniyede `setCount(0 + 1)`’i çağırmaya devam ediyor olacağız:**

```jsx{8,12,21-22}
// İlk render'da state 0'dır.
function Counter() {
  // ...
  useEffect(
    // İlk render'daki efekt
    () => {
      const id = setInterval(() => {
        setCount(0 + 1); // Her zaman setCount(1)
      }, 1000);
      return () => clearInterval(id);
    },
    []// Asla tekrar çalışmaz
  );
  // ...
}

// Her yeni render'da state 1'dir
function Counter() {
  // ...
  useEffect(
    // Bu efekt her zaman görmezden gelinir
    // çünkü bağımlılıklarımız hakkında yalan söyledik
    () => {
      const id = setInterval(() => {
        setCount(1 + 1);
      }, 1000);
      return () => clearInterval(id);
    },
    []
  );
  // ...
}
```

Efektimize bileşenimiz içerisindeki bir değere bağlı olmadığını söyleyerek React’e yalan söyledik fakat aslında bağlıydı!

Efektimiz, bileşenimiz içerisinde (fakat efektin dışında) olan bir değer olan `count`’u kullanıyor:

```jsx{1,5}
  const count = // ...

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
```

Bu nedenle, bağımlılık olarak `[]` vermek hatalara sebep olacaktır. React, bağımlılıkları karşılaştıracak ve bu efekti güncellemeyi es geçecektir.

![Diagram of stale interval closure](./interval-wrong.gif)

*(Bağımlılıklar eş, o halde bu efekti geçiyoruz.)*

Bu tür sorunlar üzerine düşünmek zordur. Bu sebeple, efekt bağımlılıkları konusunda her zaman dürüst olmayı ve her birini belirtmeyi bir kural olarak benimsemenizi tavsiye ediyorum. (Bunu ekibinizle uygulamak istiyorsanız bir [lint kuralı](https://github.com/facebook/react/issues/14920) sağlıyoruz.)


## Bağımlılıklar Hakkında Dürüst Olmanın İki Yolu

Bağımlılıklar hakkında dürüst olmak için iki taktik vardır. Genellikle ilkinden başlamalı ve ancak gerekirse ikincisini uygulamalısınız.

**İlk strateji, bileşen dahilinde, efektte kullanılan tüm değerleri içerecek şekilde bağımlılık dizisini düzeltmektir.** O halde `count`’u bağımlılık olarak ekleyelim:

```jsx{3,6}
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);
```

Bu, bağımlılık dizinini doğru hale getirecektir. İdeal olmayabilir fakat düzeltmemiz gereken ilk sorun buydu. Şimdi `count` değiştiğinde efekt, her interval’da `count`’a referans vererek `setCount(count + 1)` fonksiyonu ile yeniden çalışacak.

```jsx{8,12,24,28}
// İlk render'da state değeri 0
function Counter() {
  // ...
  useEffect(
    // İlk render'daki efekt
    () => {
      const id = setInterval(() => {
        setCount(0 + 1); // setCount(count + 1)
      }, 1000);
      return () => clearInterval(id);
    },
    [0] // [count]
  );
  // ...
}

// İkinci render, state değeri 1
function Counter() {
  // ...
  useEffect(
    // İkinci render'daki efekt
    () => {
      const id = setInterval(() => {
        setCount(1 + 1); // setCount(count + 1)
      }, 1000);
      return () => clearInterval(id);
    },
    [1] // [count]
  );
  // ...
}
```
Bu [sorunu çözerdi](https://codesandbox.io/s/0x0mnlyq8l)  ancak count her değiştiğinde interval temizlenecek ve yeniden ayarlanacaktı. Bu da pek istenen bir şey olmayabilir:


![Diagram of interval that re-subscribes](./interval-rightish.gif)

*(Bağımlılıklar farklı, o halde efekti tekrar çalıştırıyoruz.)*

---

**İkinci taktik ise efekt kodumuzu istediğimizden daha sık değişen bir değere ihtiyaç duymayacak şekilde değiştirmektir.** Bağımlılıklar hakkında yalan söylemek istemiyoruz, sadece efektimizi daha az bağımlı olacak şekilde değiştirmek istiyoruz.

Bağımlılıkları kaldırmak için birkaç yaygın kullanılan tekniğe bakalım.

---

## Efektleri Kendi Kendine Yeterli Hale Getirmek

Efektimizdeki `count` bağımlılığından kurtulmak istiyoruz.

```jsx{3,6}
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [count]);
```

Bunu yapmak için kendimize şu soruyu sormalıyız: **`count`’ı ne için kullanıyoruz?** Görünüşe göre sadece `setCount` fonksiyonunu çağırırken kullanıyoruz. Bu durumda, aslında kapsam (scope) dahilinde `count`’a ihtiyacımız yok. State’i, bir önceki state’e göre güncellemek istediğimizde, setState’in [fonksiyonel güncelleme kalıbını](https://reactjs.org/docs/hooks-reference.html#functional-updates) kullanabiliriz:



```jsx{3}
  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
```

Bu tür durumları “yanlış bağımlılıklar” olarak düşünüyorum. Evet, efektin içine `setCount(count + 1)` yazdığımız için `count` gerekli bir bağımlılıktı. Ancak gerçekte, `count`’a sadece onu `count + 1`'e çevirmek ve React’e “tekrar geri göndermek” için ihtiyacımız vardı. Fakat React, mevcut `count` değerini zaten biliyor. **Bizim React’e söylememiz gereken tek şey, şu anki değeri her ne ise, o state değerini arttırmasıydı.**

`setCount(c => c + 1)` tam olarak bunu yapar. Bunu state’in nasıl değişmesi gerektiği konusunda React’e “talimat göndermek” olarak düşünebilirsiniz. Bu “güncelleme kalıbı” [birden çok güncellemeyi gruplamak](/react-as-a-ui-runtime/#batching) gibi farklı durumlarda da yardımcı olur.



**Bunu, aslında bağımlılıkları kaldırmak için yaptığımıza dikkat edin. Hile yapmadık. Efektimiz artık render kapsamındaki counter değerini okumuyor:**

![Diagram of interval that works](./interval-right.gif)

*(Bağımlılıklar eş, o halde bu efekti geçiyoruz.)*

[buradan](https://codesandbox.io/s/q3181xz1pj) deneyebilirsiniz.

Bu efekt yalnızca bir kere çalışsa da, ilk render’a ait olan interval callback’i, interval her tetiklendiğinde `c => c + 1` güncelleme talimatını gönderebilir durumdadır. Artık mevcut `counter` state’ini bilmesine gerek yok. React bunu zaten biliyor.

## Fonksiyonel Güncellemeler ve Google Dokümanlar

Efektler için zihinsel model olan senkronizasyon hakkında neler konuştuğumuzu hatırlıyor musunuz? Senkronizasyonun ilginç bir yönü de, sistemler arası “mesajları” statelerinden bağımsız tutmak istemenizdir. Örneğin, Google Dokümanlar’da bir dokümanı düzenlemek, aslında tüm sayfayı sunucuya göndermez. Bu oldukça verimsiz olur. Bunun yerine, kullanıcının yapmaya çalıştığı şeyin bir temsilini gönderir.

Kullanım senaryosu farklı olsa da, efektler için de benzer bir düşünce biçimi geçerlidir. **Bileşene, efektlerin içinden yalnızca minimum gerekli bilgileri göndermeye yardımcı olur.** `setCount( c => c + 1)` gibi bir güncelleme kalıbı, `setCount(count + 1)` fonksiyonundan çok daha az bilgi taşıyacaktır; çünkü bu, mevcut counter değeri tarafından “bozulmamıştır”. Bu yalnızca eylemi (artış) ifade eder. React dilinde düşünmek, [en sade state’i bulmayı](https://reactjs.org/docs/thinking-in-react.html#step-3-identify-the-minimal-but-complete-representation-of-ui-state)  ifade eder. Bu, güncellemeler için de geçerli olan aynı prensiptir.

Sonuçtan ziyade amacı koda dökmek, Google Dokümanlar’ın dosyalar üzerinde ortak çalışmaya yönelik bulduğu [çözüme](https://medium.com/@srijancse/how-real-time-collaborative-editing-work-operational-transformation-ac4902d75682) benzerdir. Bu yaptığımız karşılaştırmanın sınırlarını genişletiyor olsa da fonksiyonel güncellemeler de React’te benzer bir role hizmet eder. Birden çok kaynaktan (event handlers, efekt abonelikleri vs.) gelen güncellemelerin toplu olarak ve öngörülebilir bir şekilde doğru olarak uygulanabilmesini sağlar.

**Ancak `setCount(c => c + 1)` bile o kadar iyi değildir.** Biraz tuhaf görünüyor ve yapabilecekleri çok sınırlı. Örneğin, değerleri birbirine bağlı olan iki state değişkenimiz olsaydı veya bir sonraki state’i, bir prop’a göre olarak hesaplamamız gerekseydi, bize pek yardımcı olmaz. Neyse ki `setCount(c => c + 1)` fonksiyonun çok daha güçlü bir kardeşi var. Adı da `useReducer`.

## Güncellemeleri Actionlardan Ayırmak

Önceki örneği iki state değişkenine sahip olacak şekilde değiştirelim: `count` ve `step`. Interval’ımız, `count`’u `step` girdisinin(input) değeri kadar arttıracaktır.

```jsx{7,10}
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + step);
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  return (
    <>
      <h1>{count}</h1>
      <input value={step} onChange={e => setStep(Number(e.target.value))} />
    </>
  );
}
```

([Demo](https://codesandbox.io/s/zxn70rnkx) burada.)

**Hile yapmadığımızı** unutmayın. Efekt içerisinde step’i kullanmaya başladığım için onu bağımlılıklara ekledim. Bu yüzden de kod sorunsuz çalışıyor.

Bu örnekteki mevcut davranış, `step`’in değiştirilmesinin interval’ı yeniden başlatmasıdır. Çünkü bu bağımlılıklardan biridir. Ve pek çok durumda istediğimiz de tam olarak budur! Bir efekti parçalayıp yeniden kurmakta yanlış bir şey yoktur ve iyi bir sebebimiz olmadıkça bundan kaçınmamalıyız.

Ancak interval saatimizin step değiştiğinde sıfırlanmamasını istediğimizi varsayalım. O zaman `step` bağımlılığını efektimizden nasıl çıkaracağız?

**Bir state değişkenini set etmek, başka bir state değişkeninin mevcut değerine bağlıysa, ikisini de `useReducer` ile değiştirmeyi deneyebilirsiniz.**

Kendinizi `setBirSeyler(birSeyler => … )` yazarken bulduğunuzda bunun yerine bir reducer kullanmayı düşünmenin zamanı gelmiştir. Reducer, **bileşeninizde meydana gelen “actionları” ifade etmeyi, state’in bunlara yanıt olarak nasıl güncellediğinden ayırmanıza** olanak tanır.

Efektimiz içerisindeki `step` bağımlılığını bir `dispatch` bağımlılığı ile değiştirelim:

```jsx{1,6,9}
const [state, dispatch] = useReducer(reducer, initialState);
const { count, step } = state;

useEffect(() => {
  const id = setInterval(() => {
    dispatch({ type: 'tick' }); // Instead of setCount(c => c + step);
  }, 1000);
  return () => clearInterval(id);
}, [dispatch]);
```

([Demo](https://codesandbox.io/s/xzr480k0np) burada.)

Bana “Bu nasıl daha iyi olabilir?” diye sorabilirsiniz. Cevap, **React’in bileşen ömrü boyunca, `dispatch` fonksiyonunun sabit olmasını garanti etmesidir. Bu yüzden, yukarıdaki örneğin interval’a yeniden abone olmasına gerek kalmaz**.

Problemimizi çözdük!

*(React, statik olduklarını garanti ettiği için bağımlılıklarda `dispatch`’i, `setState`’i ve `useRef` kapsayıcı değerlerini atlayabilirsiniz. Ancak bunları belirtmenin de bir zararı olmayacaktır.)*

Bir efekt içerisindeki state’i okumak yerine, *ne olduğuyla* ilgili bilgileri içeren bir action gönderir. Bu efektimizin `step` state’inden ayrılmasını sağlar. Efektimiz, state’in *nasıl* güncellendiği ile ilgilenmez, o bize sadece *ne olduğunu* söyler. Reducer da güncelleme mantığını merkezileştirir:

```jsx{8,9}
const initialState = {
  count: 0,
  step: 1,
};

function reducer(state, action) {
  const { count, step } = state;
  if (action.type === 'tick') {
    return { count: count + step, step };
  } else if (action.type === 'step') {
    return { count, step: action.step };
  } else {
    throw new Error();
  }
}
```

(Az önce kaçırdıysanız [demo](https://codesandbox.io/s/xzr480k0np) burada).

## Neden useReducer Hookların Hile Modudur?

Bir efektin, bir önceki state’e veya başka bir state değişkenine göre state’i set etmesi gerektiğinde bağımlılıkların nasıl kaldırılacağını gördük. **Peki ya bir sonraki state’i hesaplamak için props’a ihtiyacımız olursa?** Örneğin, API’ımız `<Counter step={1} /> `olabilir. Elbette, böyle bir durumda `props.step`’i bağımlılık olarak göstermekten kaçınamayız, değil mi?

Aslına bakarsanız kaçınabiliriz Props’u okumak için reducer’ın kendisini bileşenimizin içine koyabiliriz:

```jsx{1,6}
function Counter({ step }) {
  const [count, dispatch] = useReducer(reducer, 0);

  function reducer(state, action) {
    if (action.type === 'tick') {
      return state + step;
    } else {
      throw new Error();
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'tick' });
    }, 1000);
    return () => clearInterval(id);
  }, [dispatch]);

  return <h1>{count}</h1>;
}
```

Bu model, birkaç optimizasyonu devre dışı bırakır; bu nedenle bunu her yerde kullanmamaya çalışın. Ancak gerekirse reducer’dan props’a erişebilirsiniz. ([Demo](https://codesandbox.io/s/7ypm405o8q) burada.)

**Bu durumda bile, `dispatch` kimliğinin renderlar arası istikrarlı olması garanti edilir.** Yani isterseniz efekt bağımlılıklarından çıkarabilirsiniz. Bu, efektin yeniden çalışmasına sebep olmayacaktır.

Bu nasıl olabilir diye merak ediyor olabilirsiniz. Reducer, başka bir render’a ait bir efektin içinden çağrıldığında props’u nasıl “bilebilir”? Cevap, `dispatch` işleminden sonra React’ın sadece action’ı hatırlamasıdır. Ancak reducer’ınızı, bir sonraki render’da çağıracaktır. Bu noktada, taze props kapsam (scope) dahilinde olacaktır ve bir efektin içerisinde olmayacaksınız.

**Bu yüzden `useReducer`’ı, hookların “hile modu” olarak görüyorum. Güncelleme mantığını, ne olduğunu betimlemekten ayırmama izin veriyor. Bu da, gereksiz bağımlılıkları efektimden kaldırmama ve bunları gereğinden fazla sıklıkla yeniden çalıştırmamı engellememe yardımcı oluyor.**

## Fonksiyonlarları Efektlerin İçine Almak

Fonksiyonların, bağımlılıklar içinde olmamasını düşünmek yaygın bir yanlış anlayıştır. Örneğin, bu çalışabilir gibi duruyor:

```jsx{13}
function SearchResults() {
  const [data, setData] = useState({ hits: [] });

  async function fetchData() {
    const result = await axios(
      'https://hn.algolia.com/api/v1/search?query=react',
    );
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []); // Bu uygun mu?

  // ...
```

*([Bu örnek ](https://codesandbox.io/s/8j4ykjyv0) Robin Wieruch’un harika makalesinden uyarlanmıştır  — [bir bakın!](https://www.robinwieruch.de/react-hooks-fetch-data/)!)*

Açık olmak gerekirse, bu kod gerçekten işe yarıyor. **Ancak, lokal fonksiyonları dahil etmemekle ilgili sorun, bileşen büyüdükçe, tüm durumları ele alıp almadığımızı söylemenin gittikçe zorlaşmasıdır!**

Kodumuzun bu şekilde bölündüğünü ve her fonksiyonun beş kat daha büyük olduğunu hayal edin:

```jsx
function SearchResults() {
  // Bu fonksiyonun uzun olduğunu hayal edin
  function getFetchUrl() {
    return 'https://hn.algolia.com/api/v1/search?query=react';
  }

  // Bu fonksiyonun da uzun olduğunu hayal edin
  async function fetchData() {
    const result = await axios(getFetchUrl());
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ...
}
```


Şimdi, daha sonra bu fonksiyonlardan birinde birkaç state ya da prop kullandığımızı varsayalım:

```jsx{6}
function SearchResults() {
  const [query, setQuery] = useState('react');

  // Bu fonksiyonun da uzun olduğunu hayal edin
  function getFetchUrl() {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  // Bu fonksiyonun da uzun olduğunu hayal edin
  async function fetchData() {
    const result = await axios(getFetchUrl());
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ...
}
```

Bu fonksiyonları çağıran herhangi bir efektin bağımlılıklarını güncellemeyi unutursak (muhtemelen diğer fonksiyonlar aracılığı ile), efektlerimiz, props ve state’teki değişiklikleri senkronize edemez. Bu da kulağa pek hoş gelmiyor.

Neyse ki, bu sorunun kolay bir çözümü var. **Eğer bir efektin içerisinde sadece bazı fonksiyonları kullanıyorsanız, bunları doğrudan o efektin *içerisine* taşıyın:**

```jsx{4-12}
function SearchResults() {
  // ...
  useEffect(() => {
    // Bu fonksiyonları içeri aldık
    function getFetchUrl() {
      return 'https://hn.algolia.com/api/v1/search?query=react';
    }

    async function fetchData() {
      const result = await axios(getFetchUrl());
      setData(result.data);
    }

    fetchData();
  }, []); // ✅ Bağımlılıklar tamam 
  // ...
}
```

([Demo](https://codesandbox.io/s/04kp3jwwql) burada.)

Peki, bunun faydası nedir? Artık “geçişli bağımlılıkları (transitive dependencies)” düşünmek zorunda değiliz. Bağımlılıklar dizimiz artık yalan söylemiyor. **Efektimizde gerçekten bileşenin kapsamı dışında bir şey kullanmıyoruz.**

Daha sonra `query` state’ini kullanmak için `getFetchUrl`’i düzenlersek, onu bir efekt içinde düzenlediğimizi fark etme olasılığımız çok daha yüksektir. Bu nedenle, efekt bağımlılıklarına `query`’yi eklememiz gerekir:

```jsx{6,15}
function SearchResults() {
  const [query, setQuery] = useState('react');

  useEffect(() => {
    function getFetchUrl() {
      return 'https://hn.algolia.com/api/v1/search?query=' + query;
    }

    async function fetchData() {
      const result = await axios(getFetchUrl());
      setData(result.data);
    }

    fetchData();
  }, [query]); // ✅ Bağımlılıklar tamam

  // ...
}
```

([Demo](https://codesandbox.io/s/pwm32zx7z7) burada.)

Bu bağımlılığı ekleyerek, yalnızca “React’i yatıştırmakla” kalmıyoruz. `query` değiştiğinde, veriyi yeniden çekmek *mantıklıdır*. **`useEffect`’in tasarımı, veri akışındaki değişimi kullanıcılar bir hataya ulaşana kadar görmezden gelmek yerine, efektlerin bunu nasıl senkronize edeceğine karar vermeye zorlar.**

`eslint-plugin-react-hooks` eklentisinin exhaustive-deps lint kuralı sayesinde [editörünüzde yazarken efektleri analiz edebilir](https://github.com/facebook/react/issues/14920) ve hangi bağımlılıkların eksik olduğunu konusunda öneriler alabilirsiniz. Başka bir deyişle, bir makine size hangi veri akışı değişikliklerinin bir bileşen tarafından doğru şekilde işlenmediğini söyleyebilir.


![Lint rule gif](./exhaustive-deps.gif)

Gayet hoş.

## Fakat Bu Fonksiyonu Bir Efektin İçine Koyamıyorum

Bazen bir fonksiyonu bir efektin içine taşımak istemeyebilirsiniz. Örneğin, aynı bileşen içeresindeki birkaç efekt, aynı fonksiyonu çağırıyor olabilir ve siz kurduğunuz mantığı kopyala yapıştır yapmak istemiyorsunuzdur. Ya da belki bu bir prop olabilir.

Böyle bir fonksiyonu efekt bağımlılıklarında atlamalı mısınız? Sanmıyorum. Tekrarlıyorum, **efektler bağımlılıkları hakkında yalan söylememeli**. Bunun genelde çok daha iyi çözümleri vardır. “Bir fonksiyonun değişmeyeceği” yaygın bir yanılgı olsa da bu makalede öğrendiğimiz gibi bu, doğruluktan ancak bu kadar uzak olabilir. Tabii ki bir bileşen içerisinde tanımlanmış bir fonksiyon her render’da değişir!

**Bu, başlı başına bir sorun teşkil ediyor**. İki efektin `getFetchUrl` adlı fonksiyonu çağırdığını düşünelim:

```jsx
function SearchResults() {
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Datayı getir ve bir şeyler yap ...
  }, []); // 🔴 Bağımlılık eksik: getFetchUrl

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Datayı getir ve bir şeyler yap ...
  }, []); // 🔴 Bağımlılık eksik: getFetchUrl

  // ...
}
```

Bu durumda, ardından yazılan mantığı paylaşamayacağınız için `getFetchUrl`’i efektlerden herhangi birinin içine taşımak istemeyebilirsiniz.

Öte yandan, efekt bağımlılıkları konusunda “dürüst” iseniz, bir sorunla karşılaşabilirsiniz. Her iki efektimiz de `getFetchUrl`’e **(kendisi her render’da farklıdır)** bağlı olduğundan, bağımlılık dizimiz bir işe yaramaz:

```jsx{2-5}
function SearchResults() {
  // 🔴 Her render'da tüm efektleri tekrar tetikler
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Datayı getir ve bir şeyler yap...
  }, [getFetchUrl]); // 🚧 Bağımlılıklar doğru fakat çok sık değişiyor

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Datayı getir ve bir şeyler yap ...
  }, [getFetchUrl]); // 🚧 Bağımlılıklar doğru fakat çok sık değişiyor

  // ...
}
```

Bunun için cazip bir çözüm, bağımlılıklar dizisindeki `getFetchUrl` fonksiyonunu atlamaktır. Ancak bunun iyi bir çözüm olduğunu düşünmüyorum. Bu, bir efekt tarafından idare edilmesi gereken veri akışına, bir değişiklik eklediğimizde fark edilmesini zorlaştırır. Bu, daha önce gördüğümüz “hiç güncellenmeyen interval” gibi hatalara yol açar.

Bunun yerine daha basit olan iki çözüm daha var.

**Öncelikle, bir fonksiyon, bileşen kapsamında herhangi bir şey kullanmıyorsa onu bileşenin dışına çekebilirsiniz (hoisting) ve ardından efektleriniz içerisinde özgürce kullanabilirsiniz:**

```jsx{1-4}
// ✅ Veri akışından etkilenmez
function getFetchUrl(query) {
  return 'https://hn.algolia.com/api/v1/search?query=' + query;
}
function SearchResults() {
  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Datayı getir ve bir şeyler yap...
  }, []); // ✅ Bağımlılıklar tamam

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Datayı getir ve bir şeyler yap...
  }, []); // ✅ Bağımlılıklar tamam

  // ...
}
```

Bunu render kapsamında olmadığı ve veri akışından etkilenmeyeceği için bağımlılık olarak belirtmeye gerek yoktur. Yanlışlıkla props ya da state’e bağlı durumda olamaz.

Buna alternatif olarak, [`useCallback` hook'u](https://reactjs.org/docs/hooks-reference.html#usecallback): içine de alabilirsiniz. 


```jsx{2-5}
function SearchResults() {
  // ✅ Kendi bağımlılıkları aynıysa kimliğini korur
  const getFetchUrl = useCallback((query) => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, []);  // ✅ Callback bağımlılıkları tamam
useEffect(() => {
    const url = getFetchUrl('react');
    // ... Datayı getir ve bir şeyler yap...
  }, [getFetchUrl]); // ✅ Efekt bağımlılıkları tamam

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Datayı getir ve bir şeyler yap...
  }, [getFetchUrl]); // ✅ Effect bağımlılıkları tamam

  // ...
}
```

`useCallback`, temelde başka bir bağımlılık denetim katmanı eklemek gibidir. Sorunu diğer uçtan çözer. **Fonksiyon bağımlılığından kaçınmak yerine, fonksiyonun kendisinin gerektiği durumlarda değişmesini sağlıyoruz.**

Bu yaklaşımın neden yararlı olduğuna bir bakalım. Daha önce, örneğimiz iki arama sonucunu gösteriyordu (‘`react`’ ve ‘`redux`’ için). Ancak, rastgele bir `query` değeri arayabilmek için bir girdi(input) eklemek istediğimizi varsayalım. Bu nedenle, `query`’yi argüman olarak almak yerine, `getFetchUrl` onu artık yerel state’ten okuyacaktır.

Anında `query` bağımlılığının eksik olduğunu fark edeceğiz:

```jsx{5}
function SearchResults() {
  const [query, setQuery] = useState('react');
  const getFetchUrl = useCallback(() => { // query argümanı yok
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, []); // 🔴 Bağımlılık eksik: query  // ...
  // ...
}
```

`useCallback` bağımlılıklarımı, `query`’yi dahil edecek şekilde düzenlersem, bağımlılıklarda `getFetchUrl` içeren herhangi bir efekt, `query` her değiştiğinde yeniden çalışır.

```jsx{4-7}
function SearchResults() {
  const [query, setQuery] = useState('react');

  // ✅ query değişene kadar kimliğini korur
  const getFetchUrl = useCallback(() => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, [query]);  // ✅ Callback bağımlılıkları tamam

  useEffect(() => {
    const url = getFetchUrl();
    // ... Datayı getir ve bir şeyler yap...
  }, [getFetchUrl]); // ✅ Effect bağımlılıkları tamam

  // ...
}
```

`useCallback` sayesinde, eğer query aynıysa `getFetchUrl` de aynı kalır ve efektimiz yeniden çalışmaz. Ancak `query` değişirse, `getFetchUrl` de değişecek ve verileri yeniden çekeceğiz. Bu, Excel tablosundaki bir hücreyi değiştirdiğinizde, onu kullanan diğer hücrelerin otomatik olarak yeniden hesaplanmasına benzer.

Bu sadece veri akışı ve senkronizasyon düşünce yapısını benimsemenin bir sonucudur. **Aynı çözüm parent bileşenlerinden gönderilen props fonksiyonaları için de geçerlidir:**

```jsx{4-8}
function Parent() {
  const [query, setQuery] = useState('react');

  // ✅ query değişene kadar kimliğini korur
  const fetchData = useCallback(() => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + query;
   // ... Veriyi çek ve döndür ...
  }, [query]);  // ✅ Callback bağımlılıkları tamam

return <Child fetchData={fetchData} />
}

function Child({ fetchData }) {
  let [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, [fetchData]); // ✅ Effect bağımlılıkları tamam

  // ...
}
```

`fetchData`, yalnızca `query` değiştiğinde `Parent` içinde değiştiği için `Child`, uygulama için gerçekten gerekli olana kadar verileri yeniden çekmez.

## Fonksiyonlar Veri Akışının Parçası Mıdır?

İlginç bir şekilde bu model, class yapılarında, efekt ile lifecycle yaklaşımlarının arasındaki farkı gösterircesine hatalıdır. Şu uyarlamayı bir inceleyin:

```jsx{5-8,18-20}
class Parent extends Component {
  state = {
    query: 'react'
  };
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
    // ... Veriyi çek ve bir şeyler yap...
  };
  render() {
    return <Child fetchData={this.fetchData} />;
  }
}

class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  render() {
    // ...
  }
}
```

“Hadi ama Dan, hepimiz `useEffect`’in `componentDidMount` ve `componentDidUpdate`’in birleşimi gibi bir şey olduğunu biliyoruz, bunu savunup duramazsın!” diye düşünüyor olabilirsiniz. **Ama bu `componentDidUpdate` kullansak bile çalışmıyor:**

```jsx{8-13}
class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    // 🔴 Bu koşul asla true dönmeyecek
    if (this.props.fetchData !== prevProps.fetchData) {
      this.props.fetchData();
    }
  }
  render() {
    // ...
  }
}
```

Elbette `fetchData` bir class metodu! (Ya da daha doğrusu, bir class özelliğidir fakat mesele bu değil.) State değişikliğinde farklı bir şey olmayacak. Yani `this.props.fetchData`, `prevProps.fetchData`’ya eşit kalacak ve tekrar veri çekme işlemini yapmayacağız. O zaman bu koşulu kaldırabiliriz, değil mi?

```jsx
  componentDidUpdate(prevProps) {
    this.props.fetchData();
  }
```

Bir dakika, bu her yeni render’da tekrar veri çekiyor. (Ağacın tepesine biraz hareket katmak, onu keşfetmek için keyifli bir yoldur.) Belki de onu belirli bir `query`’ye bağlamalıyızdır(binding)?

```jsx
  render() {
    return <Child fetchData={this.fetchData.bind(this, this.state.query)} />;
  }
```

Ama o zaman da `query` değişmese bile `this.props.fetchData !== prevProps.fetchData` her zaman `true` dönüyor! Böylece verileri sürekli tekrar çekeceğiz.

Class yapıları ile ilgili bu bilmecenin tek doğru çözümü, durumu kabullenmek ve `query`’nin kendisini `Child` bileşenine yollamaktır. `Child` bileşeni aslında `query`’yi kullanmayacak ama bir değişim olduğunda tekrar veri çekmeyi tetikleyebilecek:

```jsx{10,22-24}
class Parent extends Component {
  state = {
    query: 'react'
  };
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
    // ... Veriyi çek ve bir şeyler yap ...
  };
  render() {
    return <Child fetchData={this.fetchData} query={this.state.query} />;
  }
}

class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    if (this.props.query !== prevProps.query) {
      this.props.fetchData();
    }
  }
  render() {
    // ...
  }
}
```

React ile class yapılarını çalıştığım yıllar boyunca, gereksiz props göndermeye ve parent’ın kapsül halini bozmaya o kadar alıştım ki, bunu neden yapmak zorunda kaldığımızı daha bir hafta önce anladım.

**Class yapılarında, props fonksiyonlar kendi başlarına veri akışının gerçek bir parçası değildir.** Metotlar, değiştilebilir (mutable) `this` değişkeni üzerine kapanırlar (close over). Bu sebeple, onların kimlikleri herhangi bir anlam ifade etmediği için onlara güvenemeyiz. Bu yüzden, sadece bir fonksiyon istiyor olsak bile aradaki “farkı (diff)” görebilmek için birçok başka veriyi de yollamamız gerekir. Parent’tan gelen `this.props.fetchData`’nın bir state’e bağlı olup olmadığını ve bu state’in az önce değişip değişmediğini bilemeyiz.

**`useCallback` ile fonksiyonlar veri akışına tam anlamıyla dahil olabilirler.** Fonksiyonun girdisinin değiştiyse, fonksiyonun kendisi de değişmiştir; değişmediyse fonksiyon aynıdır diyebiliriz. `useCallback` tarafından sağlanan ayrıntı düzeyi sayesinde, `props.fetchData` gibi props’ta yapılan değişiklikler otomatik olarak aşağı doğru yayılabilir.

Benzer şekilde, [`useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo) aynı şeyi objeler için yapmamızı sağlar.

```jsx
function ColorPicker() {
  // Child bileşeninin basit eşitlik kontrolünü bozmaz
  // ancak renk gerçekten değişmezse
  const [color, setColor] = useState('pink');
  const style = useMemo(() => ({ color }), [color]);
  return <Child style={style} />;
}
```

**`useCallback`’i her yere koymanın oldukça hantallaştırıcı bir şey olduğunu vurgulamak isterim.** Bu güzel bir kaçış yoludur ve bazı child bileşenlerinde bir fonksiyon hem aşağı gönderildiğinde hem de bir efekt içerisinden çağırıldığında faydalıdır. Ya da child bileşenindeki memoization’ın bozulmasını engellemek istiyorsanız. Ancak hooklar, [callbackleri göndermeyi tamamen devre dışı bırakarak](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down) çok daha yardımcı oluyorlar.

Yukarıdaki örneklerde, `fetchData`’nın ya efektimin içinde (bu kısım custom hook olarak buradan ayırılabilir) ya da en tepeden import edilmiş olmasını tercih ederdim. Efektlerimi basit tutmak isterim ve içeride callbackler olduğu sürece bu pek mümkün olmuyor. (“Peki ya bir istek gönderilmişken `props.onComplete` callback’i değişirse?”). Bu [class yapısı davranışının bir benzerini yapabilirisiniz](#swimming-against-the-tide) fakat bu race condition problemini çözmeyecektir.

## Race Conditionlardan Bahsetmişken


Class yapılarında klasik bir veri çekme örneği şu şekilde görünebilir:

```jsx
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

Tahmin ettiğiniz gibi bu kod hatalar içeriyor. Güncellemeleri idare edemiyor. İnternette bulabileceğiniz ikinci klasik örnek ise şuna benzer:

```jsx{8-12}
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.fetchData(this.props.id);
    }
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

Bu kesinlikle çok daha iyi! Fakat yine de hatalı. Hatalı olmasının nedeni isteğin düzensiz olma ihtimalidir. Yani, eğer ben `{id: 10}`’u çekip `{id: 20}`’ye geçersem, ancak `{id: 20}` isteği önce gelirse; daha önce başlayan fakat daha sonra biten istek yanlışlıkla benim state’imin üzerine yazabilir.

Buna race condition denir ve kodlarda `async / await` (bu bir şeyin sonucu beklediğini varsayar) ile yukardan aşağı veri akışını (async fonksiyonun ortasındayken props ve state değişebilir) karıştıran tipik bir durumdur.

Efektler bu sorunu sihirli bir şekilde çözmezler fakat efekte `async` bir fonksiyon eklemeye çalışırsanız sizi uyarırlar. (Karşılaşabileceğiniz sorunları daha iyi açıklamak için bu uyarıyı iyileştirmemiz gerekecek.)

Eğer kullandığınız async yaklaşım iptali destekliyorsa, bu harika! Async isteğini cleanup fonksiyonunuzda hemen iptal edebilirsiniz.

Alternatif olarak, en kolay geçici çözüm ise onu bir boolean değeri ile takip etmektir:

```jsx{5,9,16-18}
function Article({ id }) {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    let didCancel = false;

    async function fetchData() {
      const article = await API.fetchArticle(id);
      if (!didCancel) {
        setArticle(article);
      }
    }

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [id]);

  // ...
}
```

[Bu makale](https://www.robinwieruch.de/react-hooks-fetch-data/) hataları ve yükleme state’lerini nasıl ele alabileceğinizin yanı sıra bu mantığı nasıl custom hook’a çevirebileceğiniz hakkında daha fazla ayrıntı içerir. Hooklar ile veri çekme hakkında daha fazla bilgi edinmek istiyorsanız bakmanızı tavsiye ederim.


## Çıtayı Yükseltmek

Class yapısındaki lifecycle düşünce yapısıyla yan etkiler (side effects), render sonuçlarına göre farklılıklar gösterir. Kullanıcı arayüzü oluşturma props ve state tarafından yönetilir ve bunlarla tutarlı olması garanti edilir. Ancak yan etkiler öyle değildir. Bu da yaygın bir hata kaynağıdır.

`useEffect`’in düşünce yapısı ile durum varsayılan olarak senkronize edilir. Yan etkiler, React’in veri akışının bir parçası haline gelir. Her `useEffect` çağrısı için, bir kez doğru anladığınızda, bileşeniniz uç vakaları çok daha iyi idare edebilir.

Ancak doğru anlamanın ön maliyeti daha yüksektir. Bu can sıkıcı olabilir. Uç durumları iyi idare eden senkronizasyon kodu yazmak, doğası gereği, render ile tutarlı olmayan tek seferlik yan etkileri tetiklemekten daha zordur.

`useEffect`, çoğu zaman kullanacağınız tek araç olsaydı bu endişe verici olabilirdi. Ancak bu düşük seviyeli bir yapı taşıdır. Hookların erken dönemlerindeyiz, bu yüzden eğitimler başta olmak üzere herkes düşük seviye olanları kullanıyor. Fakat pratikte, iyi API’lar ivme kazandıkça topluluğun daha yüksek seviye hooklara geçmeye başlaması muhtemeldir.

Farklı uygulamaların, uygulamalarının bazı kimlik doğrulama mantığını kapsayan `useFetch` ya da tema içeriğini kapsayan `useTheme` gibi kendi hooklarını oluşturduklarını görüyorum. Böyle bir araç kutusuna sahip olduğunuzda, `useEffect`’e o kadar da sık başvurmayacaksınız. Fakat getirdiği bu esneklik, üzerine inşa edilmiş her hook’a fayda sağlar.

Bugüne dek, `useEffect` en sık veri çekme işleminde kullanılmıştır. Fakat veri çekme tam olarak bir senkronizasyon sorunu değildir. Bu gayet barizdir, çünkü bağımlılıklarımız sıklıkla `[]` şeklinde olur. Neyi senkronize ediyoruz zaten?

Uzun vadede, [Suspense ile Veri Çekme](https://reactjs.org/blog/2018/11/27/react-16-roadmap.html#react-16x-mid-2019-the-one-with-suspense-for-data-fetching), üçüncü taraf kütüphanelerinin, React’e async olan bir şey (bir şey: kod, veri, resimler) hazır olana kadar render’ı askıya almasını söylemenin çok iyi bir yoluna sahip olmasını sağlayacaktır.

Suspense, giderek daha çok veri çekme kullanım senaryosunu kapsadığı için, `useEffect`’in props ve state’i yan etkilere göre senkronize etmek istediğinizde kullandığınız bir araç olarak yavaş yavaş arka plana düşeceğini tahmin ediyorum. Veri çekmekten farklı olarak, bunun için tasarlandığı için durumu çok daha doğal idare edecektir. Ancak o zamana kadar, [burada gösterilen](https://www.robinwieruch.de/react-hooks-fetch-data/) custom hooklar verileri çekme mantığını yeniden kullanmanın iyi bir yoludur.

## Kapanış

Artık efektleri kullanma hakkında bildiğim hemen hemen her şeyi bildiğinize göre, başlangıçtaki [TLDR](#tldr)’e bir göz atın. Mantıklı geliyor mu? Bir şeyleri kaçırmış mıyım? (Henüz kağıdım bitmedi!)

Twitter’dan sizleri dinlemeyi çok isterim. Okuduğunuz için teşekkürler.
