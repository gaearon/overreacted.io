---
title: Neden super(props) yazıyoruz?
date: '2018-11-30'
spoiler: Yazı sonunda sürpriz var.
---

Duyduğuma göre [Hooks](https://reactjs.org/docs/hooks-intro.html) en çok konuşulan yenilik olmuş. İronik olarak, bu bloğu *class* bileşenleri hakkında bilinmeyen gerçekleri açıklamak için açmak istedim.

**Burada anlatılanlar, React'ı üretken olarak kullanmak için çok da önemli *değil*. Ancak bir şeylerin nasıl çalıştığını öğrenmek isteyenlerdenseniz, eğlenceli bulabilirsiniz.**

İşte ilki.

---

Hayatımda `super(props)`u bilmek istediğimden çok daha fazla yazdım:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Tabi ki, [class fields önerisi](https://github.com/tc39/proposal-class-fields) tüm bu seremoniyi atlamamızı sağlıyor:

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

2015'te, React 0.13 yalın class'lar için destek sağladığında bunun gibi bir yazım [planlanmıştı](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers). `constructor` tanımlamak ve `super(props)`u çağırmak, class fields ergonomik bir alternatif sunana kadar, geçici bir çözüm olarak amaçlanmıştı.

Ama sadece ES2015 özelliklerini kullanan bu örneğe tekrar dönelim:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**Neden `super` fonksiyonunu çağırıyoruz? *Çağırmasak* olmaz mı? Eğer çağırmak zorundaysak, `props` değişkenini göndermezsek ne olur? Başka bir argümanı alıyor mu bu fonksiyon?** Hadi cevapları bulalım.

---

JavaScript dilinde, `super` ebeveyn class constructor'a işaret eder. (Bizim örneğimizde, `React.Component` implementasyonuna işaret ediyor.)

Önemle, bir constructor içerisinde, ebeveyn constructor'ını çağırana kadar, `this`'i kullanamazsınız. JavaScript izin vermez:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Henüz `this` kullanamazsın
    super(props);
    // ✅ Şimdi kullanabilirsin
    this.state = { isOn: true };
  }
  // ...
}
```

JavaScript'in, `this`'e dokunmadan önce ebeveyn constructor'ın çalışmasına zorlamasının iyi bir nedeni var. Class hiyerarşisini düşünün:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 Bu engelleniyor, nedeni için aşağıyı okuyun
    super(name);
  }
  greetColleagues() {
    alert('Günaydın gençler!');
  }
}
```

`super` fonksiyonunu çağırmadan `this` *kullanabildiğimizi* düşünün. Bir ay sonra, `greetColleagues` fonksiyonunu, kişinin ismini parametre olarak alacak şekilde değiştirebiliriz:

```jsx
  greetColleagues() {
    alert('Günaydın gençler!');
    alert('Benim adım ' + this.name + ', tanıştığıma memnun oldum!');
  }
```

Ancak `this.greetColleagues()` fonksiyonunun, daha `super()` fonksiyonunun `this.name` değerini ayarlamadan çağrıldığını unuttuk. Bu yüzden `this.name` daha tanımlanmamış halde! Gördüğünüz gibi, bunun gibi kod blokları hakkında düşünmek bile zor.

Bunun gibi sıkıntılardan kurtulmak için, **JavaScript; "eğer constructor içinde `this` kullanmak istiyorsan, önce `super` çağırmak *zorundasın*" diyor.** Ebeveyni bir bırak, işini halletsin! Ve bu sınırlama aynı şekilde class olarak tanımlanmış React componentleri'ne de uygulanıyor:

```jsx
  constructor(props) {
    super(props);
    // ✅ Buradan sonra `this` kullanabilirsin
    this.state = { isOn: true };
  }
```

Bu bizi başka bir soruya yöneltiyor: neden `props`'u göndermeliyiz?

---

`super` fonksiyonuna `props` argümanını göndermem gerekiyor ki `React.Component`'in constructor fonksiyonu `this.props`'u oluşturabilsin diye düşünebilirsiniz:

```jsx
// Inside React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

Ve bu düşünce doğruya çok da uzak değil — gerçekten de [öyle yapıyor](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

Ama nedense, `super()` fonksiyonunu `props` göndermeden çağırsanız bile, `render` ve diper metodların içinden `this.props`'a erişebiliyorsunuz. (İnanmıyorsanız kendiniz deneyebilirsiniz!)

Peki *bu* nasıl çalışıyor? Meğerse **React *sizin* constructor fonksiyonunuzdan hemen sonra, `props` parametresini kendi atıyor:**

```jsx
  // React'ın içi
  const instance = new YourComponent(props);
  instance.props = props;
```

Bu nedenle `super()` içine `props` göndermeyi unutsanız bile, React yine de sonradan onu tanımlayacak. Bunun bir sebebi var.

React class'lar için destek sağladığı sırada, sadece ES6 class'ları için destek eklemedi. Amaç, olabildiğince geniş alanda class yapılarını desteklemekti. O zamanlar ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript, veya diğer çözümlerin component tanımlamada ne kadar başarılı olacakları [kesin değildi](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages). Yani React kasıtlı olarak `super()` fonksiyonunun zorunlu olmasında tarafsız kaldı - ES6 zorunlu kılsa da.

Peki bu `super(props)` yerine sadece `super()` yazabileceğiniz anlamına mı geliyor?

**Büyük ihtimalle hayır çünkü hala biraz kafa karıştırıcı.** Tabi ki, React zaten `this.props` değerini sizin constructor'ınız çalıştıktan *sonra* atayacaktır. Ancak `this.props` değeri, `super` fonksiyonunu çağırma satırı ve constructor'ınızın sonu *arasında* tanımlanmamış olacaktır.

```jsx{14}
// React'ın içi
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// Sizin kodunuz
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 props'u göndermeyi unuttuk
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined 
  }
  // ...
}
```

Bu, eğer constructor'ın *içinde* çağrılan bir metod içinde olursa, debug yapmak daha da zorlaşacaktır. **Ve işte tam olarak bu yüzden, zorunlu olmamasına rağmen, her zaman `super(props)` olarak kullanmayı öneriyorum:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ props'u gönderdik
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

Bu, `this.props` değerinin, daha constructor ortada bile yokken tanımlı olmasını kesinleştiriyor.

-----

Uzun zamandır React kullananların merak ettiği son bir nokta olabilir.

Class'ların içinde Context API'ını (ister eski `contextTypes`, ister React 16.6'da eklenen modern `contextType` API) kullandığınız zaman `context` değişkeninin constructor'a ikinci parametre olarak gönderdiğini farketmişsinizdir.

O zaman neden `super(props, context)` yazmıyoruz? Yazabiliriz, ama context, props'a göre daha az kullanıldığı için bu problem o kadar da fazla karşımıza çıkmıyor.

**Zaten, class fields önerisiyle beraber bu sıkıntı büyük ölçüde kayboluyor.** Bir constructor olmadan, tüm argümanlar otomatik olarak aşağıya taşınıyor. Bu, `state = {}` gibi bir tanımlamanın `this.props` veya `this.context` değerlerine bir referans taşımasına olanak sağlıyor.

Hooks ile beraber, `super` veya `this` bile gereksiz kalıyor. Ama bu başka bir günün konusu.
