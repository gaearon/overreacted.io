---
title: UI runtime'ı olarak React
date: '2019-02-02'
spoiler: React programlama modelinin derinlemesine incelenmesi.
cta: 'react'
---

React'i ele alan başlangıç düzeyindeki birçok kaynak, React'i bir UI kütüphanesi olarak tanıtmaktadır. Bu doğrudur çünkü React'in *kendisi* de zaten bir UI kütüphanesidir. Hatta bu ifade, React'in resmî sayfasındaki başlıkta da aşağıdaki gibi yer almaktadır:

![React ana sayfa ekran alıntısı: "Kullanıcı arayüzleri geliştirebileceğiniz bir JavaScript kütüphanesi"](./react.png)

Daha önce de [kullanıcı arayüzleri](/the-elements-of-ui-engineering/) geliştirme zorluğundan bahsetmiştim. Fakat bu yazıda React'i farklı bir açıdan ele alacağız - React'i bir [programlama runtime'ı (çalışma ortamı)](https://tr.wikipedia.org/wiki/%C3%87al%C4%B1%C5%9Ft%C4%B1rma_ortam%C4%B1) olarak ele alacağız.

**Bu yazı size kullanıcı arayüzleri oluşturma hakkında bir şey öğretmeyecektir.** Bunun yerine React programlama modelini daha derinlemesine kavramanıza yardımcı olacaktır.

---

**Not: Eğer sadece React'i _öğrenmek_ istiyorsanız, sitede yer alan [yazıları](https://tr.reactjs.org/docs/getting-started.html#learn-react) inceleyebilirsiniz.**

<font size="60">⚠️</font>

**Bu yazı React'i derinlemesine bir şekilde ele alacaktır — Henüz başlangıç düzeyindeki kişiler için DEĞİLDİR.** Bu yazıda, React programlama modelinin ana prensiplerinin birçoğuna değineceğim. Fakat yanlış anlaşılmasın, React'i nasıl kullanacağınızı açıklamayacağım, sadece sürecin nasıl işlediğinden detaylı bir şekilde bahsedeceğim.

Bu yazının hitap ettiği kişiler, halihazırda ekosistemdeki diğer UI kütüphanelerini kullanan ve React'in artılarını/eksilerini merak eden deneyimli programcılardır. Umarım bu yazıyı beğenirsiniz! 

**Halihazırda React ile kod yazan birçok geliştirici, bu konuların birçoğunu düşünmeden başarılı bir şekilde yazılım geliştirmektedir.** Bu durum, [tasarımcı-merkezli](http://mrmrs.cc/writing/developing-ui/) değil, yazılımcı-merkezli bir bakış açısıdır. Fakat her ikisi için de başvurulabilir kaynakların bulunmasında bir sıkıntı görmüyorum. 

Bu kadar açıklama bittiğine göre, şimdi temel kavramlara geçebiliriz.

---

## Host Tree (Host Ağacı)

Bazı programlar çıktı olarak sayı üretirler. Bazıları ise şiir üretirler. Programlama dilleri ve bu dillerin runtime'ları (çalışma ortamları) belirli bir amaca hizmet etmek için optimize edilmişlerdir. React de böyledir. 

React programları çıktı olarak genellikle bir **ağaç** (tree) üretirler. Bu ağaç, bir [DOM ağacı](https://www.npmjs.com/package/react-dom) olabileceği gibi, [iOS view hiyeararşisi](https://developer.apple.com/library/archive/documentation/General/Conceptual/Devpedia-CocoaApp/View%20Hierarchy.html) veya [JSON nesneleri](https://reactjs.org/docs/test-renderer.html) olabilir. Ancak genellikle bu ağaç kullanılarak React'ten bir kullanıcı arayüzü (UI) oluşturmasını bekleriz. Buna “*host* tree” (host ağacı) denir. Böyle denmesinin nedeni, DOM veya iOS ortamı gibi React'in dışında kalan *host ortamı*nın (host environment'ın) bir parçası olmasıdır. Host ağacı, genellikle kendine ait emirsel bir API'ye sahiptir (örn. [DOM: appendChild()](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild), [iOS: addsubview(_ view: UIView)](https://developer.apple.com/documentation/uikit/uiview/1622616-addsubview)). React, bu API'nin üzerinde bir katman olarak yer almaktadır.    

Peki React ne işe yarar? Soyut anlamda ele alırsak, UI etkileşimleri veya ağ istekleri gibi harici olaylara hızlı bir şekilde yanıt verecek biçimde, karmaşık bir host ağacını kolaylıkla değiştirebildiğiniz bir programı yazmanızı sağlar.

Temel bir prensip olarak düşündüğümüzde: belirli durumlar için özelleştirilmiş bir araç, her şeye yarayan genel yapıdaki bir araca göre çok daha iyi çalışır. Bu nedenle React de aşağıdaki iki prensip üzerine kuruludur:

* **Stabildir:** Host ağacı genellikle stabildir ve üzerinde yapılan değişiklikler, host ağacını tamamen değiştirmez. Çünkü bir uygulama her saniyede bir, tüm elemanlarını farklı kombinasyonlarda değiştirseydi kullanımı çok zor olurdu ve kullanıcılardan bu tarz sorular gelebilirdi: "Az önceki buton nereye gitti?", "Neden ekranım sürekli dans ediyor?".

* **Düzenlidir:** Host ağacı, özelleşmiş yapıdaki birçok küçük arayüz bileşenine ayrıştırılabilir (örn. `<MyButton />`, `<ShoppingList />`, `<ProfilePicture />`).

**Bu prensipler birçok arayüz için doğruluk gösterir.** Ancak React, program çıktısında stabil bir desen bulunmayan arayüzler için çok uygun değildir. Örneğin, bir Twitter uygulaması için uygun olurken, 3 boyutlu boruların dans ettiği bir [ekran koruyucu](https://www.youtube.com/watch?v=Uzx9ArZ7MUU) üretmek için pek de kullanışlı değildir.

## Host Instances (Host Elemanları)

Bir host ağacı birçok alt node'dan (düğümden) oluşur. Bunlara “host elemanları” (host instances) denir.

Host elemanları DOM ortamında, `<div>` gibi birer DOM node'larıdır. JavaScript tarafında kullanılmak üzere iOS ortamındaki native bir view'ı temsil edecek şekilde bir `<View>` elemanı da olabilir.

Host elemanları kendine has alanlara sahiptir (örn. `domNode.className` veya `view.tintColor` gibi). Ayrıca diğer host elemanları da içerebilirler (örn. `<div><div></div></div>`gibi)

(Host ortamlarından bahsettiğim bu kısmın, React ile doğrudan bir ilgisi yoktur. Ancak React ile ilgili diğer kavramlardan bahsetmek için gereklidir.)

Host elemanlar üzerinde değişiklik yapmak için genellikle bir API bulunur. Örn DOM için `appendChild`, `removeChild`, `setAttribute` gibi API'ler vardır. React uygulamalarında bu fonksiyonları direkt olarak çağırmamanız gerekir. Çünkü React, bunları kendi içinde otomatik olarak çalıştırmaktadır.

## Renderer'lar

Bir *renderer*, React kodunun belirli bir host ortamında çalışması ve ilgili host elemanları yönetmesi için, o ortamla nasıl konuşulacağını React'e öğreten kütüphanedir. Örneğin: React DOM, React Native ve hatta Gatsby ve Parcel gibi uygulamaların terminalde bir şeyler ayzdırmak için kullandığı [Ink](https://github.com/vadimdemedes/ink/) de dahil olmak üzere hepsi birer React renderer'dır. Ayrıca kendi [React renderer'ınızı](https://github.com/facebook/react/tree/master/packages/react-reconciler) da yazabilmeniz mümkündür. 

React renderer'lar 2 modda çalışabilirler: mutating (değiştiren) ve persisting (kalıcı).

Birçok renderer “mutating” modu kullanmak için yazılmıştır. DOM da bu şekilde çalışmaktadır: `<div>` gibi bir node üretiriz, özelliklerini ayarlarız, ve daha sonra içine eleman ekler veya çıkarırız. Host elemanları tamamıyla mutable'dır.

React, [“persistent”](https://en.wikipedia.org/wiki/Persistent_data_structure) modda da çalışabilir. Bu mod `appendChild()` gibi metotlar sunmayan fakat bununyerine sürekli top-level child'ı değiştiren host ortamları içindir. Host ağacında immutable bir yapı oluştuğu için, lock oluşmaz ve çok thread'li bir çalışma işlemi daha kolay hale gelir. [React Fabric](https://facebook.github.io/react-native/blog/2018/06/14/state-of-react-native-2018) de bu modu avantaja dönüştürecek şekilde çalışmaktadır.

Bir React yazılımcısı olarak, bu modlar hakkında düşünmenize gerek yoktur. Burada vurgulamak istediğim, React'in bir moddan diğerine bir adaptör görevi görmediğidir. React, low-level bir view API paradigması olması nedeniyle kullanışlıdır.

## React Elements (React Elemanları)

Host ortamında bulunan, DOM node'u gibi bir host instance'ı en küçük yapı birimidir. React'te en küçük yapı birimine *React elemanı* adı verilir.

Bir React elemanı, aslında basit bir JavaScript objesidir ve bir host elemanını *tasvir* edebilir. 

```jsx
// JSX hali:
// <button className="blue" />
{
  type: 'button',
  props: { className: 'blue' }
}
```

Bir React elemanı hafiftir (lightweight) ve kendisine herhangi bir host elemanı bağlı halde değildir. Dolayısıyla ekrana ne çizmek istediğinizi belirten bir JavaScript objesinden başka bir şey değildir.

Host elemanları gibi, React elemanları da bir ağaç oluşturabilirler:

```jsx
// JSX hali:
// <dialog>
//   <button className="blue" />
//   <button className="red" />
// </dialog>
{
  type: 'dialog',
  props: {
    children: [{
      type: 'button',
      props: { className: 'blue' }
    }, {
      type: 'button',
      props: { className: 'red' }
    }]
  }
}
```

*(Not: Bu açıklama için önemli olmayan [bazı özellikleri](/why-do-react-elements-have-typeof-property/) örneğe dahil etmedim.)*

Ancak **React elemanları kendilerine ait kalıcı bir kimliğe sahip değildir.** Bu nedenle üretilmek ve silinerek atılmak için tasarlanmışlardır.

React elemanları immutable'dır (değiştirilemezdir). Bu nedenle bir React elemanının children'larını veya belirli bir özelliğini değiştiremezsiniz. Eğer ekrana farklı bir şey render etmek istiyorsanız, sıfırdan üretilecek olan bir React elemanı ile bunu *tasvir* etmeniz gereklidir.

React elemanlarını bir film karesine benzetebilirsiniz. Aynı bir film karesi gibi belirli bir anda arayüzün nasıl görüntüleneceğini belirtirler, değişmezler.

## Entry Point (Giriş Noktası)

Her React renderer bir “giriş noktasına” sahiptir. Bu giriş noktası aslında bir API fonksiyonudur. Bu fonksiyon React'e, belirli bir host elemanı içerisinde bir React elemanını render etmesi gerektiğini belirtir. 

Örneğin, React DOM'un giriş noktası `ReactDOM.render` fonksiyonudur:

```jsx
ReactDOM.render(
  // { type: 'button', props: { className: 'blue' } }
  <button className="blue" />,
  document.getElementById('container')
);
```

`ReactDOM.render(reactElement, domContainer)` şeklinde yazdığımızda, aslında React'e şunu demek istiyoruz: **Sevgili React, lütfen `domContainer` host ağacını, benim `reactElement`'im ile eşleştir.”**

React, `type` özelliğine bakarak (örn. `'button'`) bakarak, React DOM renderer'a bir host elemanı yaratması gerektiğini söyler. Ve bu host elemanının özelliklerinin de, `props` kısmında belirtildiği şekilde ayarlanması gerektiğini belirtir:

```jsx{3,4}
// ReactDOM renderer kodu (basitleştirilmiş)
function createHostInstance(reactElement) {
  let domNode = document.createElement(reactElement.type);
  domNode.className = reactElement.props.className;
  return domNode;
}
```

Örneğimizi ele alacak olursak React, aşağıdaki kodu çalıştıracaktır:

```jsx{1,2}
let domNode = document.createElement('button');
domNode.className = 'blue';

domContainer.appendChild(domNode);
```

Eğer bir React elemanı `reactElement.props.children` özelliği içerisinde yer alan child bileşenlere sahip ise, React ilk render esnasında recursive olarak onlar için de birer host elemanı oluşturacaktur.

## Reconciliation (Uzlaşma, Mutabakat)

`ReactDOM.render()` metodunu öğrendik. Peki `render()` metodunu aynı kod içerisinde iki kez çalıştırırsak ne olur?

```jsx{2,11}
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// ... Kodun daha sonraki bir kısmında ...

// Bu render işlemi, mevcut <button> elemanını silerek yenisini mi ekleyecektir?
// Yoksa sadece mevcut olanın className özelliğini mi değiştirecektir?
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);
```

Daha önce de bahsettiğimiz gibi React'in temel görevi, *host ağacı ile React eleman ağacını eşleştirmektir*. Yeni işlemine göre host ağacı üzerinde ne işlem yapılacağına [reconciliation](https://reactjs.org/docs/reconciliation.html)(uzlaşma) denir.

Reconciliation 2 şekilde gerçekleşebilir. Bunlardan ilkinde React, en baist haliyle mevcut ağacı silebilir ve sıfırdan tekrar üretebilir:

```jsx
let domContainer = document.getElementById('container');
// Ağacın silinmesi
domContainer.innerHTML = '';
// Yeni bir host eleman ağacının oluşturulması
let domNode = document.createElement('button');
domNode.className = 'red';
domContainer.appendChild(domNode);
```

Fakat DOM içerisinde ağacın tekrar oluşturulması işlemi yavaştır. Ayrıca eleman üzerindeki focus, selection ve scroll'un konumu gibi birçok önemli bilginin de kaybolmasına neden olur. Bunun nedenle React'ten aşağıdaki gibi bir işlem yapmasını bekleriz: 

```jsx
let domNode = domContainer.firstChild;
// Mevcut host elemanının değiştirilmesi
domNode.className = 'red';
```

Dolayısıyla React, ilgili React elemanı ile mevcut host elemanını eşleştirmek için, host elemanını _güncelleyeceğine_ veya _yenisini_ yaratacağına karar vermesi gereklidir.

Bu durum *identity*(kimlik) sorunsalını ortaya çıkarmaktadır. Bir React elemanı JSON objesi olduğu için her zaman farklılık gösterebilir. Fakat bu durumda aynı host instance'ını belirttiğini nasıl bileceğiz?

Aslında kendi örneğimizde bu durum gayet basit. İlk olarak bir `button` elemanı render ettik ve daha sonra yine aynı yerde bir `button` elemanı render etmek istedik. Zaten halihazırda bir `<button>` host elemanına sahibiz. Bu nedenle sıfırdan oluşturmadan aynı elemanı değiştirerek kullanabiliriz. 

Bu yaklaşım, React'in çalışma yapısı ile aynıdır.

**Eğer ağaçta aynı yerde bulunan bir eleman türü önceki ve sonraki render'da birbiri ile “eşleşiyorsa”, React mevcut host elemanını yeniden kullanır.**

React'in kabaca nasıl çalıştığı ile ilgili aşağıdaki örneği incelyelim:

```jsx{9,10,16,26,27}
// let domNode = document.createElement('button');
// domNode.className = 'blue';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// Host instance'ı yeniden kullanabilir mi? Evet! Eleman türü: ('button' → 'button')
// domNode.className = 'red';
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);

// Host instance'ı yeniden kullanabilir mi? Hayır! Eleman türü: ('button' → 'p')
// domContainer.removeChild(domNode);
// domNode = document.createElement('p');
// domNode.textContent = 'Hello';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <p>Hello</p>,
  document.getElementById('container')
);

// Host instance'ı yeniden kullanabilir mi? Evet! Eleman türü ('p' → 'p')
// domNode.textContent = 'Goodbye';
ReactDOM.render(
  <p>Goodbye</p>,
  document.getElementById('container')
);
```

Bileşenin kapsadığı child ağaçları için de aynı çalışma mantığı kullanılır. Örneğin içerisinde 2 adet `<button>` yer alan `<dialog>` elemanını güncellediğimizde, React öncelikle `<dialog>` elemanının kullanılıp/kullanılmayacağına karar verir ve aynı prosedürü child olan iki buton için de uygular.

## Conditions (Koşula bağlı render etme)

Eğer React, aynı host elemanını yalnızca element türleri "eşleştiğinde"  yeniden kullanıyorsa, bir koşula bağlı olan bileşeni nasıl render edecektir?

Diyelim ki, ilk adımda sadece bir text input elemanımız olsun. Daha sonra bu input elemanının öncesinde bir mesaj görüntüleyelim:

```jsx{12}
// First render
ReactDOM.render(
  <dialog>
    <input />
  </dialog>,
  domContainer
);

// Next render
ReactDOM.render(
  <dialog>
    <p>I was just added here!</p>
    <input />
  </dialog>,
  domContainer
);
```

Bu örnekte, `<input>` host elemanı yeniden oluşturulacaktır. React, eleman ağacını gezecek ve bir önceki versiyonla karşılaştıracaktır:

* `<dialog> → <dialog>`: Host elemanı yeniden kullanabilir mi? **Evet — çünkü tipler eşleşiyor.**
  * `<input> → <p>`: Host elemanı yeniden kullanabilir mi? **Hayır, tip değişti!** Mevcut `input` elemanı silinmeli ve yeni bir `p` host elemanı oluşturulmalıdır.
  * `(hiçbir şey) → input`: Yeni bir `input` host elemanı oluşturulmalıdır.

Böylece, React tarafından çalıştırılacak güncelleme kodu aşağıdaki gibi olacaktır:

```jsx{1,2,8,9}
let oldInputNode = dialogNode.firstChild;
dialogNode.removeChild(oldInputNode);

let pNode = document.createElement('p');
pNode.textContent = 'I was just added here!';
dialogNode.appendChild(pNode);

let newInputNode = document.createElement('input');
dialogNode.appendChild(newInputNode);
```

Bu durum aslında hiç de efektif değil. Çünkü aslında kavramsal olarak `<input>` elemanı değişmedi, sadece önüne yeni bir `<p>` elemanı eklendi. Ayrıca DOM'un değiştirilerek, input elemanındaki seçili olma durumunu ve input elemanının içeriğini kaybetmek istemiyoruz.

Aslında bu problemin kolay bir çözümü olsa da, React'in doğası gereği çalıştığı uygulamalarda böyle bir şeyin olmasına izin vermez. Neden böyle olduğunu birazdan açklayacağım.

Pratikte `ReactDOM.render` metodunu nadiren direkt olarak çağırırsınız. Bunun yerine React uygulamaları, aşağıdaki gibi fonksiyon bileşenleri halinde ayrıştırılarak yazılırlar:

```jsx
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = <p>I was just added here!</p>;
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  );
}
```

Bu örnekte, az önce bahsettiğimiz problem yaşanmamaktadır. Bunun nedenini JSX yerine obje notasyonu kullanarak daha kolay görebiliriz. return kısmında yer alam `dialog`'un `children`'ına dikkat ediniz:

```jsx{12-15}
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = {
      type: 'p',
      props: { children: 'I was just added here!' }
    };
  }
  return {
    type: 'dialog',
    props: {
      children: [
        message,
        { type: 'input', props: {} }
      ]
    }
  };
}
```

**Farkedeceğiniz gibi, `message` değişkeni başlangıçta null olarak atandığı için, `showMessage` değişkeni `true` da olsa `false` da olsa, `<input>` elemanı `children` array'inin ikinci elemanı olarak kalmaya devam edecektir ve render işlemlerinde ağaçtaki yeri değişmeyecektir.**

Eğer `showMessage` değişkeni `false`'dan `true`'ya dönüşürse React, element ağacını gezerek önceki versiyonu baz alarak aşağıdaki gibi bir karşılaştırma yapar:

* `<dialog> → <dialog>`: Host elemanını yeniden kullanabilir mi? **Evet — tip eşleşmesi var.**
  * `(null) → <p>`: Yeni bir `p` host elemanının eklenmesi gereklidir.
  * `<input> → <input>`: Host elemanını yeniden kullanabilir mi? **Evet — tip eşleşmesi var.**

React tarafından çalıştırılacak olan kod aşağıdakine benzer şekildedir:

```jsx
let inputNode = dialogNode.firstChild;
let pNode = document.createElement('p');
pNode.textContent = 'I was just added here!';
dialogNode.insertBefore(pNode, inputNode);
```

Bu sayede, input'un durumu korunmuş olur.

## Listeleme işlemleri

İlgili host elemanının tekrar kullanılacağına veya yeniden yaratılacağına karar vermek için, ağaçta aynı pozisyonda yer alan elemanın `type`'ına bakmak genellikle yeterlidir.

Fakat bu çözüm, sadece child bileşenlerin konumu sabitse ve tekrar sıralama gerekmiyorsa işe yaramaktadır. Üstteki örneğimizde `message` değişkeni “null” olsa dahi devamında bir input elemanının geleceğini ve sonrasında başka bir elemanın gelmeyeceğini biliyorduk. 

Fakat dinamik olarak oluşturulan listelerde ise, eleman sıralamasının aynı olacağının bir garantisi yoktur. Örnek: 

```jsx
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p>
          You bought {item.name}
          <br />
          Enter how many do you want: <input />
        </p>
      ))}
    </form>
  )
}
```

Burada alışveriş listesinin `list` array'indeki elemanlar tekrar sıralanırsa, elemanların tipi değişmediği için, React sadece `<p>` ve`<input>` tipindeki elemanları görecektir. Eleman tipleri değişmediği için listenin yeniden sıralanması gerektiğini bilemeyecektir. (Bu olaya React'in gözüyle bakıldığında, sadece liste elemanlarının kendisi değişmiştir, sıralaması değil.)

Listedeki 10 adet elemanın yer değiştirilmesi için React tarafından çalıştırılacak olan kod aşağıdaki gibidir:

```jsx
for (let i = 0; i < 10; i++) {
  let pNode = formNode.childNodes[i];
  let textNode = pNode.firstChild;
  textNode.textContent = 'You bought ' + items[i].name;
}
```

React, sıralama hakkında bir bilgiye sahip olmadığı için, her birini *güncelleyecektir*. Bu durum performans sorunlarına ve olası hatalara yol açabilir. Örneğin, ilk elemanın içeriği sıralama *sonrasında* farklı bir değere sahip olsa dahi aynı sırada kalabilir. 

**İşte bu nedenle bir dizideki elemanları ekrana basmaya çalıştığınızda, `key` özelliğini vermediğinizde React sizi uyarır:**

```jsx{5}
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p key={item.productId}>
          You bought {item.name}
          <br />
          Enter how many do you want: <input />
        </p>
      ))}
    </form>
  )
}
```

`key` özelliği, render esnasında ilgili eleman farklı bir pozisyonda bulunsa dahi bu elemanın *kavramsal* olarak aynı olduğunu React'e bildirir.

React, bir `<form>` elemanı içerisinde `<p key="42">` gibi diğer bir elemanı gördüğünde, önceki render işlemindeki `<form>` elemanı içerisinde `<p key="42">` olan bir eleman olup olmadığını kontrol eder. `<form>` elemanının child elemanının sırası değişse dahi bu işlem sorunsuz çalışır. React, eğer aynı key'e sahip önceki host elemanı varsa bunu yeniden kullanır ve diğer komşu elemanları da uygun şekilde sıralar.

Not: `key` özelliği sadece belirli bir parent elemanı (örn: `<form>`) içerisinde kullanmak için uygundur. React, farklı listelerde yer alan aynı key'e sahip elemanları eşleştirmeye çalışmaz. (React'in, farklı parent bileşenlerdeki host elemanların yerlerini değiştirmek için deyimsel bir desteği bulunmamaktadır.)

Peki `key` özelliği için hangi değerin verilmesi gereklidir? Buna bir cevap olarak kendinize şu soruyu sormanız gerekiyor: **bir listedeki elemanların sırası değişse dahi, bir elemanın öncekiyle “aynı” olduğunu nasıl anlarım?** Örneğin, yukarıdaki `ShoppingList` bileşeninde yer alan `productID` özelliği, diğer elemanlar arasında benzersiz bir nitelikte olduğu için key değeri olarak kullanılabilir.

## Components (Bileşenler)

Hatırlarsanız, belirli bir React elemanı döndüren fonksiyonları daha önce de görmüştük:

```jsx
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = <p>I was just added here!</p>;
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  );
}
```

Bu fonksiyonlara *bileşen* adı verilir. Bileşenler sayesinde, verilen arayüze uyacak şekilde kendi UI kütüphanemizi oluşturabiliriz (örn, button, avatar, yorum bileşenleri gibi). Bileşenler React uygulamalarının vazgeçilmez parçalarıdır. 

Bileşenler sadece “props” (properties) adında tek bir argüman alırlar. Bileşene aktarılmak istenen değerler `props`'un içerisine yazılırlar. Örneğin bu örnekteki `showMessage`, props'un içerisinde bulunan bir değerdir. 

## Purity (Saflık)

React bileşenleri, parametre olarak gelen prop'larını değiştiremedikleri için pure (saf) halde bulunurlar. Örneğin:

```jsx
function Button(props) {
  // 🔴 Bu atama çalışmaz
  props.isActive = true;
}
```

Genel olarak, mutation (değiştirme) React'te deyimsel (idiomatic) olarak bulunmaz. (Yazının ilerleyen kısımlarında event'lere cevap verecek şekilde UI'ı güncellemek için ne gibi bir deyimsel bir yöntem olduğundan bahsedeceğiz.)

Ancak, bileşen içerisinde *local mutation* (yerel değişiklik) yapmada bir sıkıntı yoktur:

```jsx{2,5}
function FriendList({ friends }) {
  let items = [];
  for (let i = 0; i < friends.length; i++) {
    let friend = friends[i];
    items.push(
      <Friend key={friend.id} friend={friend} />
    );
  }
  return <section>{items}</section>;
}
```

Bu örnekte *render aşamasında* `items`'ı oluşturduk. Bu array'i kullanacak olan `Friend` bileşeni henüz bu değişkeni “göremediği” için,  render sonucuna verene dek `items` üzerinde istediğimiz kadar değişiklik yapabiliriz. Yerel değişiklikten kaçınmak için kodunuzu değiştirmenize gerek yoktur.

Benzer şekilde, lazy init (tembel başlatım) işlemleri tamamen “pure” olmamasına rağmen izin verilmektedir:

```jsx
function ExpenseForm() {
  // Diğer bileşenleri etkilemediği sürece sorun yoktur:
  SuperCalculator.initializeIfNotReady();

  // Render işlemine devam edilir...
}
```

Bir bileşeni defalarca kez çağırmanın güvenli olduğu, ve diğer bileşenlerin render işlemini etkilemediği sürece, React bu işlemin fonksiyonel programlama açısından 100% pure olup/olmadığını çok da önemsemez. React açısından, ilgili işlemin [Idempotent](https://eksisozluk.com/idempotent--215824)(etkisiz) olma durumu, pure olma durumundan çok daha önemlidir.

Ayrıca React bileşenlerinde, kullanıcı tarafından direkt olarak görülebilecek olan yan etkilere izin verilmez. Dolayısıyla, sadece bir bileşen fonksiyonunu çağırmanın ekran üzerinde bir değişikliğe yol açmaması gerekir. 

## Recursion (Öz yinelemelilik)

Bir bileşen içerisinden diğer bileşenleri nasıl kullanırız? Aslında bileşenler birer fonksiyon oldukları için, normalde onları aşağıdaki gibi çağırmamız gerekirdi:

```jsx
let reactElement = Form({ showMessage: true });
ReactDOM.render(reactElement, domContainer);
```

Ancak bu yapı, React runtime'ında bileşenler için yaygın olarak kullanılan idiomatic bir yöntem değildir.

Bu nedenle, bir bileşeni kullanmanın idiomatic yolu, daha önce gördüğümüz şekilde React elemanları kullanmaktır. **Bu nedenle bileşen fonksiyonunu direkt olarak çağırmazsınız. React bu işi sizin için halleder:**

```jsx
// { type: Form, props: { showMessage: true } }
let reactElement = <Form showMessage={true} />;
ReactDOM.render(reactElement, domContainer);
```

Bunu yaptığınızda, React kütüphanesi içerisinde bir yerde, oluşturduğunuz bileşeniniz aşağdaki gibi çağrılacaktır:

```jsx
// React kütüphanesindeki bir yerde
let type = reactElement.type; // Form
let props = reactElement.props; // { showMessage: true }
let result = type(props); // Whatever Form returns
```

Bileşenlerin fonksiyon isimleri yaygın olarak büyük harfle başlar. JSX dönüştürücüsü `<form>` yerine `<Form>` şeklinde bir bileşen gördüğünde, `type` için string yerine objenin kendisini atamaktadır: 

```jsx
console.log(<form />.type); // 'form' string
console.log(<Form />.type); // Form function
```

React'te bileşen adının, ilgili bileşen için özel olarak kaydedilmesi amacıyla yapılan global bir mekanizma bulunmamaktadır. Bunun yerine `Form` gibi bir elemanı render etmek için basitçe `<Form />` şeklinde kullanırız. Eğer `Form` bileşeni yerel scope'da yoksa, her zamanki gibi bir JavaScript hatasıyla (bad variable name) bildirilir.

**Buraya kadar tamam. Peki ya React, ilgili eleman fonksiyon tipinde ise ne yapar? Önce bileşeninizi fonksiyon olarak çağırır, sonra o bileşenin hangi elemanı render etmek istediğini sorar.**

Bu işlem recursive (öz yinelemeli) olarak devam eder. [Burada](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html) daha detaylı bir şekilde anlatılmıştır. Fakat basitçe ele alacak olursak, aşağıdaki gibi çalışır

- **Yazılan kod:** `ReactDOM.render(<App />, domContainer)`
- **React:** Hey `App`, ne render ediyorsun?
  - `App`: İçerisinde `<Content>` bulunan bir `<Layout>` bileşeni render diyorum.
- **React:** Hey `Layout`, ne render ediyorsun?
  - `Layout`: Bir `<div>` içerisinde bir takım elemanları render ediyorum. Bu elemandan biri de `<Content>` bileşeni olduğu için sanırım bu bileşen `<div>`'in içerisine yerleşecek.
- **React:** Hey `<Content>`, ne render ediyorsun?
  - `Content`: İçerisinde bir `<Footer>` bileşeni olan ve bir takım metinler yer alan `<article>` elemanını render ediyorum.
- **React:** Hey `<Footer>`, ne render ediyorsun?
  - `Footer`: İçerisinde bazı metinlerin yer aldığı bir `<footer>` elemanını render ediyorum.
- **React:** Anladım. Aşağıdaki gibi bir DOM oluşturdum:

```jsx
// Oluşan DOM'un yapısı
<div>
  <article>
    Some text
    <footer>some more text</footer>
  </article>
</div>
```

İşte bu nedenle reconciliation öz yinelemeli bir işlemdir. React, eleman ağacını gezerken, fonksiyon bileşeni tipindeki elemanlarla karşılaşabilir. Bu durumda ilgili fonksiyon bileşenini çağırır ve ağacı aşağıya doğru gezmeye devam eder. Ağaçta gezilecek eleman kalmayınca React, host ağacında neyin değişecek olduğunu bilecektir.

Daha önce bahsettiğimiz reconciliation kuralları aynen burada da geçerlidir. Eğer index veya key'in uyuştuğu aynı pozisyonda farklı türden bir bileşen varsa, İçerisindeki host elemanları siler ve yeniden oluşturur.

## Inversion of Control (Kontrolün React'e Verilmesi)

Fonksiyon bileşenlerini neden direkt olarak çağırmadığımızı merak ediyor olabilirsiniz: "Neden `Form()` şeklinde çağırmak yerne `<Form/>` biçiminde kullanıyoruz?"

**React henüz ağacı gezmekte iken, yazdığınız bileşenlerin var olduğunu  bilirse daha iyi çalışır. Bunu aşağıdaki örnekte açıklayalım:**

```jsx
// 🔴 React'in, Layout ve Article'ın var olup/olmadığı hakkında bir bilgisi yok.
// Onları siz çağırıyorsunuz ve React sadece sonucu görüyor.
ReactDOM.render(
  Layout({ children: Article() }),
  domContainer
)

// ✅ Burada ise React, Layout ve Article'ın var olduğunu biliyor ve kendisi yönetiyor.
// Onları React çağırıyor. Dolayısıyla kendisi çağırdığı için var olduğunu biliyor.
ReactDOM.render(
  <Layout><Article /></Layout>,
  domContainer
)
```

Bu durum, [inversion of control](https://eksisozluk.com/inversion-of-control--1573140)(kontrolün verilmesi) için basit bir örnektir. Bileşenleri çağırma kontrolünü React'e devrettiğimizde birkaç ilginç özellik elde ederiz:

* **Bileşenler, fonksiyonlardan daha fazlası haline gelir.** React, bileşenin işlevini, ağacın içerisinde bileşenin kimliği ile bağlanan *yerel state* gibi özellikler ile zenginleştirir. Esasen iyi bir runtime, elle halledilebilecek problemler için gereken temel soyutlaştırma işlemlerini sunmalıdır. Daha önce de bahsettiğimiz gibi React, UI ağaçlarının render edilmesi ve etkileşimlere hızlı cevap verilmesi üzerine özelleştirilmiştir. Bu nedenle, eğer bileşenleri direkt olarak çağırsaydınız, React'in sağladığı bu özellikleri kendiniz sıfırdan kurgulamak zorunda kalırdınız.

* **Bileşen tipleri reconciliation işleminde önemli bir rol oynar.** Bileşenlerinizi çağırma kontrolünü React'e verdiğinizde, bileşen ağacı hakkında da kavramsal olarak daha fazla bilgi vermiş olursunuz. Örneğin, `<Anasayfa>`'dan `<Profil>`'e geçtiğinizde, `<Anasayfa>`'daki mevcut bileşenleri yeniden kullanmaya kalkışmaz. Aynı bir `<button>`'un `<p>` elemanıyla değiştirilmesi gibi bileşen içeriğini sıfırdan oluşturur. `AnaSayfa`'daki tüm state bilgisi silinir - zaten kavramsal olarak farklı bir view elemanı render ettiğiniz için bu işlemin olması iyidir. Örneğin, `<ParolaEkrani>` and `<MesajEkrani>` gibi iki farklı bileşeniniz olsun. Ekranlar arası geçişlerde, aynı pozisyonda bulunan bir `<input>` elemanı olduğunda, önceki ekrandaki input state'ini sonraki ekrana yansıtmak istemezsiniz. 

* **React reconciliation işlemini geciktirebilir.** Eğer bileşenleri çağırma işini React'e devredersek, birçok yararlı işlerin yapılmasını sağlayabiliriz. Örneğin, bileşen çağrıları arasında tarayıcı üzerinde bazı işlemleri gerçekleştirerek, [main thread'i bloklamadan](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) büyük bir bileşen ağacını React tekrar render edebilir. Bu olayı manuel olarak yazmak, yani React kütüphanesinin büyük bir bölümünü tekrar yazmadan gerçekleştirmek çok zor olacaktır.

* **Daha iyi bir debug deneyimi sağlar.** Bileşenler, React kütüphanesinin vazgeçilmez birer parçaları olduğundan dolayı, geliştirim esnasında hata ayıklama için kullanabileceğimiz [zengin içerikli geliştirici araçlarını](https://github.com/facebook/react-devtools) üretebiliriz.

React'in bileşen fonksiyonlarını çağırmasının son yararı ise *lazy evaluation* (tembel hesaplama) yapabilmesidir. Şimdi bunun ne olduğuna yakından bakalım.

## Lazy Evaluation (Tembel Hesaplama)

JavaScript'te fonksiyonlar çağrılırken, parametre olarak verilen argümanlar, ait olduğu fonksiyonun çağrımdan hemen önce hesaplanırlar:

```jsx
// (2) Diğer fonksiyonu parametre aldığı için ikinci aşamada hesaplanacaktır
eat(
  // (1) Parametre olduğu için ilk bu fonksiyon hesaplanacaktır.
  prepareMeal()
);
```

Bu zaten JavaScript geliştiricilerinin beklediği bir durumdur. Çünkü JavaScript fonksiyonlarının implicit (üstü kapalı) yan etkileri bulunmaktadır. Dolayısıyla kod içerisinde bir fonksiyon çağrımı yapıldğında, fonksiyonun sonucu “kullanılana” dek çalıştırılmazsa kod daha performanslı bir hale gelecektir.

React bileşenleri [göreceli](#purity) olarak pure'dür. Dolayısıyla fonksiyonun sonucu ekrana basılmadığı süre zarfında hesaplanmasının da bir gereği bulunmamaktadır.

Aşağıdaki gibi bir `<Page>` bileşeni içerisine `<Comments>` bileşenini bulunduran `Story`fonksiyonu olduğunu düşünelim:

```jsx{11}
function Story({ currentUser }) {
  // return {
  //   type: Page,
  //   props: {
  //     user: currentUser,
  //     children: { type: Comments, props: {} }
  //   }
  // }
  return (
    <Page user={currentUser}>
      <Comments />
    </Page>
  );
}
```

`Page` bileşeni bir `<Layout>` içerisinde, kendisine verilen children'ları render edebilir.

```jsx{4}
function Page({ user, children }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

*(JSX'teki `<A><B /></A>` kodu ile, parametre olarak verilen `<A children={<B />} />` kodu aynıdır.)*

Peki ya fonksiyon içerisinde return'den önce koşullu bir return işlemi varsa ne olacak?

```jsx{2-4}
function Page({ user, children }) {
  if (!user.isLoggedIn) {
    return <h1>Please log in</h1>;
  }
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

Burada `{children}` yerine `Comments` bileşeninin basıldığını düşünelim. Eğer bileşeni aşağıdaki gibi `Comments()` şeklinde fonksiyon olarak çağırsaydık, üstteki örnekteki if koşulu ele alınmaksızın gereksiz bir şekilde `Comments` de çalıştırılmış olacaktı.

```jsx{4,8}
// {
//   type: Page,
//   props: {
//     children: Comments() // Her zaman çalışır
//   }
// }
<Page>
  {Comments()}
</Page>
```

Fakat burada, React elemanı olarak verdiğimiz için, kontrolü React'e veriyoruz ve `Comments`'i direkt olarak çağırmamış oluyoruz:

```jsx{4,8}
// {
//   type: Page,
//   props: {
//     children: { type: Comments }
//   }
// }
<Page>
  <Comments />
</Page>
```

Bu şekilde kodladığımızda, React ilgili bileşenin ne zaman çağrılıp/çağrılmayacağını bilir. `Page` bileşeni, `children` özelliğini işleme dahil etmeden sadece 
`<h1>Please log in</h1>`'i ekrana bastığında, React `Comments` fonksiyonunu hiç çağırmayacaktır. Peki buradaki amaç nedir?

Gereksiz bir render işlemi yapılmaması sayesinde kod, hatalara meyilli hale gelir (Örneğin, kullanıcı uygulamadan çıkış yaptığında, `Comments` bileşeninin yok edilmesi bizim için sorun değildir. Çünkü zaten hiç çağrılmayacaktır.)

## State

[Daha önce](#reconciliation) bileşenlerin kimliği hakkında konuşmuştuk ve ağaçtaki bir elemanın kavramsal olarak konumunun belirlenmesi sayesinde, React'in ilgili host elemanını tekrar kullanıp kullanmayacağına karar verdiğini belirtmiştik. Host elemanların birçok yerel state'i bulunabilir: focus, selection, input... Uygulama içerisinde, render işlemlerinde aynı arayüz bileşenlerini ekrana basarken, elemanların state bilgilerinin de korunmasını isteriz. Benzer şekilde de farklı bileşenleri render ederken bu state'lerin tamamen yok edilmesini isteyebiliriz (Örn.`<SignupForm>` ekranından `<MessengerChat>` ekranına geçişlerde bunu isteyebiliriz).

**Yerel state o kadar kullanışlıdır ki, React kendi bileşenlerinizde de özel olarak bir state yaratabilmenize olanak sağlamıştır.** Bileşenler aslında halen bir fonksiyon yapısındadırlar. Fakat React, onların yeteneklerini arttırarak, arayüzlerin ekrana basılması işlemlerinde daha kullanışlı olacak hale getirir. Ağaçtaki bir pozisyona bağlanan yerel state aşağıdaki özelliklerden birine sahiptir:

Bu özelliklere *Hooks* adı verilir. Örneğin bir `useState` hook'u aşağıdaki gibidir.

```jsx{2,6,7}
function Example() {
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

`useState` hook'u, mevcut state'i ve onu değştirecek bir fonksiyonu geri döndürür.

[Array destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Array_destructuring) syntax'ı sayesinde state değişkenlerine uygun isimler verebiliriz. Bu örnekte `count` ve `setCount` ikilisini verdik, fakat `banana` ve `setBanana` şeklinde de isimlendirebilirdik (Yazının ilerleyen kısımlarında, bu fonksiyon için `setState` olarak bahsedilecektir.).

*(`useState` ve React tarafından sunulan diğer hook'lar hakkında bilgi almak için [buradaki](https://tr.reactjs.org/docs/hooks-intro.html) yazıyı inceleyebilirsiniz.)*

## Consistency (Tutarlılık)

Reconciliation işlemini, ekrandaki işleyişi [bloklamayan](https://www.youtube.com/watch?v=mDdgfyRB5kg) birçok parçaya bölmek istesek de, aynı zamanda gerçek host ağacı işlemlerini senkronize bir yapıda çalıştırmak isteyebiliriz. Bu sayede arayüzün yarım yamalak bir halinin ekrana basılmasını engellemiş oluruz. Ayrıca tarayıcı, state'ler arasında gereksiz bir şekilde, layout ve stil hesaplama işlemlerini gerçekleştirmemiş olur.

İşte bu nedenle React, tüm işlemi “render evresi” ve “commit evresi” gibi 2 parçaya bölmektedir. *Render evresinde*, React oluşturduğunuz bileşeni çağırır ve reconciliation işlemini gerçekleştirir. [Gelecekte](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) bu işlem asenkron hale dönüşeceği için duraklatmak ve o arada başka işler yapmak olası bir hale gelecektir. *Commit evresi* ise React'in host ağacına dokunduğu evredir. Bu evre senkron olarak çalıştırılır.


## Memoization

Parent bileşen `setState`'i çağırarak bir güncelleme ayarladığında, React varsayılan olarak reconciliation işlemini children bileşenlerine uygular. Bu işlemin gerçekleşmesinin nedeni, React'in parent'ta yapılan işlemin child'lara etki edip etmeyeceğini bilmemesidir ve React tutarlı bir şekilde davranmak için bu işlemi varsayılan olarak uygular. Bunu duyduğunuzda, çok pahalı bir işlem yapıldığı hissiyatı oluşabilir. Fakat pratikte, küçük ve orta ölçekli child ağaçlarında bir problem teşkil etmemektedir.

Ağaçlar çok derin veya çok genişlemesine yer aldığında, React'e ilgili bileşenleri [memoize](https://en.wikipedia.org/wiki/Memoization) etmesini bildirebilirsiniz. Bu sayede, prop değişiklikleri yüzeysel olarak ele alınarak aynı yapıda olduğunda, önceki render sonuçları tekrar kullanılacaktır:

```jsx{5}
function Row({ item }) {
  // ...
}

export default React.memo(Row);
```

Artık parent'taki `<Table>` bileşeninde yer alan `setState` fonksiyonu, `item` parametresi aynı olan `Row`'lar için reconciliation işlemini pas geçebilir.

Kod satırı seviyesinde memoization işlemini gerçekleştirmek için[ `useMemo()` hook](https://reactjs.org/docs/hooks-reference.html#usememo)'unu kullanabilirsiniz. Memoziation için kullanılan cache ise, bileşenin ağaçtaki pozisyonuna özeldir ve yerel state ile birlikte yok edilirler. Ayrıca en son kullanılan tek bir item'ı tutmaktadır.

React, bileşenler üzerinde varsayılan olarak memoization işlemini gerçekleştirmez. Çünkü genellikle birçok bileşen farklı prop'ları alacağından dolayı onları memoize etmek gereksiz bir memory kullanımına yol açacaktır.

## Raw Models (Ham Modeller)

React, küçük update işlemleri için “reaktif” bir sistem kullanmaz. Başka bir deyişle, Ağacın üst kısımlarında gerçekleşen bir güncelleme işlemi, sadece ilgili bileşenlerin değiştirilmesi yerine, child elemanlara da aktarılacak şekilde reconciliation işleminin tetiklenmesine yol açar.

Bu olay kasıtlı olarak bu şekilde yapılmıştır. Web uygulamaları için, [Time to interactive](https://calibreapp.com/blog/time-to-interactive/)(etkileşim olmak için geçen süre) önemli bir metriktir. Dolayısıyla küçük listener'lar için ağaçta gezme modelleri oluşturmak, bu değerli zamanın gereksiz bir şekilde tüketilmesine yol açmaktadır. Bune ek olarak birçok uygulamada yer alan etkileşimler küçük (button hover) veya büyük (sayfa geçişi) güncellemeleri halinde yer alırlar. Bu durumda her bileşen için küçük aboneliklerin ayarlanması gereksiz bir şekilde RAM tüketimine yol açacaktır.

React kütüphanesindeki temel tasarım prensiplerinden biri de ham veriler üzerinde çalışabilmesidir. Eğer network üzerinden birkaç JavaScript nesnesi geliyorsa, bunları işlemeden direkt olarak bileşenlerinize  aktarabilirsiniz. Arayüzdeki yapı az biraz değiştiğinde erişebileceğiniz prop'ların bulunması, veya beklenmedik performanslar optimizasyonları sağlayabilecek değişik trick'ler, React'te bulunmamaktadır. React'teki render işleminin karmaşıklığı O(n)'dir. Detaylandırmak gerekirse, O(*model büyüklüğü*) yerine O(*view büyüklüğü*) şeklinde yer almaktadır. Ayrıca *view büyüklüğü* [windowing](https://react-window.now.sh/#/examples/list/fixed-size)(pencereleme) işlemi ile önemli ölçüde azaltılabilir.

Borsa stok işlemleri gibi uygulamalarda küçük bileşen aboneliklerinin önemli teşkil etmektedir. Bu uygulamalar, bünyesinde her şeyin aynı anda sürekli güncellendiği nadir örneklerden birkaçıdır. Kodu optimize etmek için imperative bir şekilde kullanmak bir çözüm olsa da, React bu tarz işlemler için en uygun çözüm değildir. Bununla birlikte, kendi oluşturduğunuz detaylı bir şekilde işleyen abonelik yapınızı React'in üstüne koyacak şekilde bir yapı oluşturabilirsiniz. 

**Küçük bileşen aboneliklerinin ve "reaktivite" sistemlerinin dahi çözemediği yaygın performans problemleri de bulunmaktadır.** Örneğin, tarayıcıyı bloklamayacak şekilde her sayfa geçişinde yeni bir ağacın render edilmesinin gerçekleştirilmesi gibi. Değişikliklerin takip edilmesi de bunu hızlandırmaz, hatta bileşenler için birçok abonelik işlemi ayarlanacağından dolayı daha da yavaşlatacaktır. Diğer bir problem ise view'ı render etmeden önce basılacak olan veri için beklenmesidir. React'te bu tarz problemlerin çözümü için [Concurrent Rendering](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)(eş zamanlı render etme) adında bir kavram ortaya çıkmaktadır.


## Batching (Güncelleme İşlemlerinin Birleştirilmesi)

Bir click olayı gerçekleştiğinde, bu olaya cevap vermek amacıyla iç içe yapıda yer alan bileşenler kendi state'ini güncellemek isteyebilir. Buna örnek olarak aşağıdaki kodu inceleyelim:

```jsx{4,14}
function Parent() {
  let [count, setCount] = useState(0);
  return (
    <div onClick={() => setCount(count + 1)}>
      Parent clicked {count} times
      <Child />
    </div>
  );
}

function Child() {
  let [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Child clicked {count} times
    </button>
  );
}
```

Bu örnekte bir `<div>` ve içerisinde bir `<button>` elemanı olduğu için ve aynı zamanda ikisinde de `onClick` metodu ayarlandığından dolayı, butona tıklandığında ikisi de click event'ine cevap vermek isteyecektir. Öncelikle `Child`'ın `onClick` metodu kendi `setState`'ini çalıştıracak şekilde çağrılır. Ardından `Parent`, kendi `onClick` handler'ında `setState` metodunu çağırır.

Eğer React, `setState` metodunu anında çalıştırsaydı, parent değiştiğinde tekrar child'ı render edeceğinden dolayı, child'ın iki kere render edilmesine yol açacaktı:

```jsx{4,8}
*** Giriş: React'in tarayıcıdaki click metodu ***
Child (onClick)
  - setState
  - re-render Child // 😞 gereksiz
Parent (onClick)
  - setState
  - re-render Parent
  - re-render Child
*** Çıkış: React'in tarayıcıdaki click metodu ***
```

Burada `Child`'ın ilk render edilmesi boşa gidecektir. Ayrıca `Parent`, state'i güncellendiğinde `Child`'a farklı bir veri verebileceği için, React ikinci render işlemini de pas geçemez.

**Bu nedenle React, event handler'lardaki güncelleme işlemlerini toplu halde uygular:**

```jsx
*** Giriş: React'in tarayıcıdaki click metodu ***
Child (onClick)
  - setState
Parent (onClick)
  - setState
*** State güncellemelerinin işlenmesi         ***
  - re-render Parent
  - re-render Child
*** Çıkış: React'in tarayıcıdaki click metodu ***
```

Bileşenlerde bulunan `setState` çağrımları anında re-render işlemine yol açmazlar. Bunun yerine React, önce tüm event handler'ları çalıştırır. Daha sonra tekil bir re-render işlemini tetikleyerek tüm güncelleme işlemlerinin toplu bir şekilde yapılmasını sağlar. Bu işleme batching adı verilir. 

Batching işlemi performans için iyidir. Fakat aşağıdaki gibi art arda çağırdığınızda beklenmedik sonuçlar üretebilir:

```jsx
  const [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

`count` değeri `0` olarak başladığımızda, 3 tane `setCount(1)` cağrımı olacaktır ve React bu çağrımları tekil hale getirerek, `count` değeri en son 1 olarak atanacaktır. Bunu düzeltmek için, `setState` fonksiyonunun parametre olarak “güncelleyici” bir fonksiyon alan overloaded hali bulunmaktadır:

```jsx{4}
  const [count, setCount] = useState(0);

  function increment() {
    setCount(c => c + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

React, güncelleyici fonksiyonların bir kuyruğa alır ve daha sonra arka arkaya çalıştırır. Dolayısıyla bu örnekte, re-render işleminin sonucunda `count` değeri `3` olarak atanacaktır.

Bileşenlerdeki state mantığı birkaç `setState` çağrımından daha karmaşık hale geldiğinde, [`useReducer` hook](https://reactjs.org/docs/hooks-reference.html#usereducer)'u kullanarak bir yerel state reducer'ı yazmanız tavsiye edilir. Bu güncelleyici deseninin bir gelişmiş hali de bulunmaktadır: her güncelleme işlemi için bir isim verilir ve bu isme göre ilgili güncelleşme işlemi gerçekleştirilir:

```jsx
  const [counter, dispatch] = useReducer((state, action) => {
    if (action === 'increment') {
      return state + 1;
    } else {
      return state;
    }
  }, 0);

  function handleClick() {
    dispatch('increment');
    dispatch('increment');
    dispatch('increment');
  }
```

`action` argümanı herhangi bir değer alabilir. Fakat genellikle bir obje değeri verilmektedir.

## Call Tree (Çağrım ağacı)

Bir programlama dili runtime'ında genellikle bir [call stack](https://medium.freecodecamp.org/understanding-the-javascript-call-stack-861e41ae61d4)(çağrım yığını) bulunur. Örneğin bir `a()` fonksiyonu, `b()`'yi çağırır, o da kendi içerisinde `c()`'yi çağırır. Ve JavaScript motorunda bir yerlerde bu fonksiyonların çağrılma sırasını `[a, b, c]` şeklinde tutan bir veri yapısı bulunur. `c()`'nin çağrımından çıktığınızda, c'nin call stack frame'i yok edilir - artık buna ihtiyaç yoktur. Daha sonra `b()`'ye geçilir, daha sonra ise `a()` bitirilerek call stack tamamen boşaltılmış olur.

Tabii ki React'in kendisi de JavaScript ortamında çalıştığı için JS'in kurallarına uymaktadır. Fakat şunu düşünebiliriz: React'in kendi içerisinde de bir çeşit call stack bulunur ve bu sayede bir t anında hangi bileşeni render ettiğini hatırlayabilir. Örneğin `[App, Page, Layout, Article /* şu an burayı render ediyoruz */]` gibi.

React kütüphanesi, UI ağaçlarını render etme amacıyla yapıldığı için, genel amaçlı bir dilin runtime'ından daha farklıdır. UI ağaçlarıyla etkileşebilmek için bu ağaçların “hayatta kalmaları” gereklidir. Bu nedenle call stack'te olanın aksine, ilk `ReactDOM.render()` çağrımından sonra DOM yok edilmez.

Şahsen kavramlar arasında bir ayrım yapmak amacıyla, React bileşenleri için “call stack” yerine “call tree” metaforunu kullanıyorum. `Article` bileşeninden çıktığımızda, onun “call tree” frame'i yok edilmez. Çünkü yerel state'i ve host instance'lar ile olan referanslarını [bir yerde](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7) tutmamız gereklidir.

Yalnızca [reconciliation](#reconciliation) kuralları gerekli gördüğünde, “call tree” frame'leri , kendi yerel state'leri ve host instance'ları ile birlikte yok edilirler. Eğer React'in kaynak kodunu okuduysanız, bu frame'ler için [Fibers](https://en.wikipedia.org/wiki/Fiber_(computer_science)(lifler) olarak bahsedildiğini görmüşsünüzdür

Fiber'lar, yerel state'in yaşadığı yerlerdir. Bir bileşenin state'i güncellendiğinde React, ilgili bileşenin altındaki Fiber'ları reconciliation gerektiğine dair işaretler ve bu bileşenleri çağırır.

## Context (İçerik)

React'te, diğer bileşenlere bazı verileri sağlamak için props'ları kullanırız. Bazen birçok bileşenin aynı veriye ihtiyacı olduğu anlar olur - örneğin, uygulamanın tema özelliği gibi. Bu bağlamda props'ları her bileşen seviyesine sürekli aktarıp durmak gereksiz bir iş yükü oluşturabilir. 

React'te bu olay, [Context](https://reactjs.org/docs/context.html) ile çözülmüştür. Context, bileşenler için gerekli olan [dynamic scoping](http://wiki.c2.com/?DynamicScoping)(dinamik çalışma alanı) özelliğini sağlar. Context, tıpkı bir solucan deliği gibidir, en üste bir veri koyarsınız ve altındaki tüm child bileşenleri bu veriyi kullanır. Ayrıca veri değiştiğinde tekrar kendilerini render ederler. 

```jsx
const ThemeContext = React.createContext(
  'light' // Varsayılan değer
);

function DarkApp() {
  return (
    <ThemeContext.Provider value="dark">
      <MyComponents />
    </ThemeContext.Provider>
  );
}

function SomeDeeplyNestedChild() {
  // child'ın render edildiği yere bağlıdır
  const theme = useContext(ThemeContext);
  // ...
}
```

`SomeDeeplyNestedChild` bileşeni render edildiğinde, `useContext(ThemeContext)` kodu ağaç üzerindeki en yakın `<ThemeContext.Provider>`'a bakar ve onun değerini kullanır.

(Pratikte React, render ederken ilgili context stack'i yönetir.)

Eğer üstte bir `ThemeContext.Provider` yoksa, `useContext(ThemeContext)` çağrımının sonucu `createContext()`'te belirtilen varsayılan değerin alınması ile tamamlanır. Örneğimizdeki varsayılan değer `'light'` idi.


## Effects (Etkiler)

React bileşenlerin render işlemi esnasında izlenebilir bir yan etkiye sahip olmamaları gerektiğinden bahsetmiştik. Fakat bazen yan etkilerin olması gereklidir: focus'u değiştirmek, canvas üzerine çizim yapmak, bir veri kaynağına abone olmak gibi yan etkili işlemleri gerçekleştirmek isteyebiliriz.

Bu işlem React'te bir effect oluşturularak gerçekleştirilir:

```jsx{4-6}
function Example() {
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

React, tarayıcının ekrana tekrar çizme işlemine gelinceye kadar effect'leri mümkün olduğunca geciktirmeye çalışır. Bu iyi bir şeydir çünkü veri kaynağı için yapılan abonelikler, [time to interactive](https://calibreapp.com/blog/time-to-interactive/) ve [time to first paint](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint) gibi metriklere zarar vermemelidir. (Bu davranışın yerine işlemleri senkronize olarak yürütmek için [çok nadiren](https://reactjs.org/docs/hooks-reference.html#uselayouteffect) kullanılan bir hook da bulunmaktadır. Fakat bu hook'u kullanmaktan kaçınınız.)

Effect'ler sadece bir kez çalışmazlar. Kullanıcıya bileşen ilk kez gösterildiğinde ve o bileşen güncellendiğinde tekrar çalışırlar. Önceki `count` örneğinde olduğu gibi effect'ler mevcut props ve state'i kullanacak şekilde yazılabilirler.

Effect'ler, Subscription işlemleri gibi durumlarda cleanup yapmayı gerektirebilir. Bir effect, cleanup işleminin gerçekleştirmesi için bir fonksiyon return eder:

```jsx{3}
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  });
```

React, bileşen yok edilmeden önce ve bu effect tekrar uygulanmadan önce  return edilen fonksiyonu çalıştırır.

Her render işleminde effect'i tekrar çalıştırmak her zaman istenen bir durum olmayabilir. Bu nedenle React'e, bazı değişkenler değişmediği sürece effect işleminin [atlaması](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects) bildirilebilir:

```jsx{3}
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }, [count]);
```

Fakat bu yöntem, prematüre bir iyileştirme şeklidir ve eğer JavaScript closure'ların nasıl çalıştığına tam olarak hakim değilseniz bazı problemlere yol açabilir. 

Örneğin aşağıdaki kod hatalı çalışmaktadır:

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, []);
```

Bu kod hatalı çalışmaktadır. Çünkü `[]` kısmı React'e “asla bu effect'i yeniden çalıştırma” diye bildirir.Fakat bu effect'i, `handleChange` gibi bir fonksiyon kullanmakta ve bu fonksiyon da effect'in dışında yer almaktadır. Ve `handleChange` fonksiyonu aşağıdaki gibi herhangi bir prop'u veya state'i kullanıyor olabilir:

```jsx{2}
  function handleChange() {
    console.log(count);
  }
```

Eğer effect'in zaman tekrar çalışmasına izin vermezsek, `handleChange` fonksiyonu ilk render işleminden sonraki değeri tutmaya devam eder ve `count` değeri her zaman `0` olarak kalır.  

Bu problemi çözmek için, değişebilecek **her türden** verinin (fonksiyonlar da dahil olmak üzere) yer aldığı bağımlılık array'ini belirlediğinize emin olunuz:

```jsx{4}
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, [handleChange]);
```

Yazdığınız koda bağlı olarak, her render işleminde `handleChange`'in kendisi sürekli değişebileceği için, halen gereksiz resubscription işlemlerini görebilirsiniz. [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) hook'u size bu konuda yardımcı olabilir. Başka bir açıdan, resubscribe olmasına göz yumabilirsiniz de. Örneğin, tarayıcıdaki `addEventListener` API oldukça hızlı çalışmaktadır. Bu nedenle resubscription işleminin gerçekleşmemesi adına yaptığınız harici işlemlerin size faydadan çok zararı dokunabilir.

*(React tarafından oluşturulan `useEffect` ve diğer hooklar hakkında ayrıntılı bilgi için [buradaki yazıyı](https://reactjs.org/docs/hooks-effect.html) inceleyebilirsiniz.)*

## Custom Hooks 

`useState` ve `useEffect` gibi hook'lar birer fonksiyon çağrımından ibaret olduğu için, bunları bir araya getirerek kendi hook'umuzu oluşturabiliriz:

```jsx{2,8}
function MyResponsiveComponent() {
  const width = useWindowWidth(); // Custom hook
  return (
    <p>Window width is {width}</p>
  );
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  return width;
}
```

Custom hook'lar, state'li fonksiyonları tekrar kullanılabilir hale getirerek bileşenler arasında paylaştırmayı sağlamaktadırlar. Fakat *state'in kendisinin* paylaşımlı olmadığı göz önünde bulundurmalıdır. Bu nedenle her bir hook, kendi izole state'ini oluşturmaktadır. 

*(Kendi hook'unuzu oluşturmak ile ilgili daha fazla bilgi edinmek için [buradaki yazıdan](https://reactjs.org/docs/hooks-custom.html) faydalanabilirsiniz.)*

## Static Use Order (Statik Kullanım Sırası)

`useState`'i bir “React state değişkeni” tanımlamak için gerekli olan bir syntax gibi düşünebilirsiniz. Tabii ki halen JavaScript ortamında kod yazdığımız için gerçekten bir syntax değildir. Fakat React, JavaScript'i kullanarak UI ağaçlarını oluşuturduğu için, React'i bir runtime ortamı gibi ele aldığımızda, React'in özellikleri bazen yeni bir dil gibi olmaktadır. 

Eğer `use` ifadesi bir syntax olsaydı, aşağıdaki gibi top level'da kullanabilirdik:

```jsx{3}
// 😉 Not: gerçek bir syntax değildir
component Example(props) {
  const [count, setCount] = use State(0);

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

Peki bu syntax'i bir if koşulunda veya bir callback'te ya da bir bileşen dışında kullanmaya kalktığımızda bu ne anlama gelecekti?

```jsx
// 😉 Not: gerçek bir syntax değildir

// Bu bir yerel state mi? Nedir?
const [count, setCount] = use State(0);

component Example() {
  if (condition) {
    // condition'ın false olması durumunda state'e ne olacak
    const [count, setCount] = use State(0);
  }

  function handleClick() {
    // Fonksiyondan ayrıldığımızda ne olacak?
    // Bunun bir değişkenden farkı nedir?
    const [count, setCount] = use State(0);
  }
```

React state'i, onu kapsayan bileşene özeldir ve ağaçtaki kimliği de yine o bileşe aittir. Eğer `use` ifadesi gerçek bir syntax olsaydı, bileşen içerisinde en üstte yer alacak şekilde yazmak mantıklı olacaktı:


```jsx
// 😉 Not: gerçek bir syntax değildir
component Example(props) {
  // Bu kısım doğrudur
  const [count, setCount] = use State(0);

  if (condition) {
    // Burada syntax error oluşur
    const [count, setCount] = use State(0);
  }
```

Bu durum, `import` ifadesinin sadece üst kısımda çalışması gibidir.

**Tabii ki, `use` ifadesi gerçek bir syntax değildir.** (Öyle olsaydı da yararından çok zararı oluşacaktı. Bu nedenle böylesi daha iyi.)

Hook'lar bir sytax olmamasına rağmen, React tüm hook çağrımlarının ilgili bileşenin top-level'ında olmasını ister. Bu [hook kuralları](https://reactjs.org/docs/hooks-rules.html), [bir linter eklentisi](https://www.npmjs.com/package/eslint-plugin-react-hooks) kullanılarak zorunlu tutulabilir. Bu tasarım kararı ile ilgili tartışmalar da mevcuttur, fakat bununla ilgili bugüne dek kafası karışan kimseyi görmedim. Ayrıca bu tartışmalarda sunulan önerilerin işe yaramayacağı ile ilgili de [bir yazı yazdım](https://overreacted.io/why-do-hooks-rely-on-call-order/).

Hook'lar React kütüphanesinde [linked list](https://dev.to/aspittel/thank-u-next-an-introduction-to-linked-lists-4pph) veri yapısında saklanmaktadırlar. `useState`'i çağırdığınızda, ilgili pointer sonraki elemana götürülür. Bileşenin [“call tree” frame](#call-tree)'inden çıktıktan sonra, linked list'in sonucu bir sonraki render işlemine dek kaydedilir. 

Hook'ların iç yapısı hakkında bilgi almak için [bu yazıyı inceleyebilirsiniz](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e). Array kullanımı, linked list'e göre daha kolay bir mental model olabilir:


```jsx
// Pseudocode
let hooks, i;
function useState() {
  i++;
  if (hooks[i]) {
    // Sonraki render
    return hooks[i];
  }
  // İlk render
  hooks.push(...);
}

// Render'a hazırlık
i = -1;
hooks = fiber.hooks || [];
// Bileşenin çağrılması
YourComponent();
// Hook'un state'inin kaydedilmesi
fiber.hooks = hooks;
```

*(Eğer React'te çalışan gerçek hook kodunu merak ediyorsanız [burayı](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberHooks.js) inceleyebilirsiniz.)*

Bu kod kabaca her bir `useState()` çağrısının doğru state bilgisini edinmesini açıklamaktadır. Daha önce [reconciliation](#reconciliation) kısmında bahsettiğimiz “bileşen isimlerinin eşleşmesi” React'te yeni bir kavram değildir — render işlemi arasında elemanların eşleşmesine dayanan reconciliation da benzer şekilde çalışır.

## Yazıda Bahsedilmeyen Kavramlar

Bu yazıda, React'teki runtime ortamındaki neredeyse pek çok kavrama değindik. Eğer yazının bu kısmına kadar geldiyseniz, React'e detaylı bir şekilde, diğer yazılımcıların %90'ından daha fazla hakimsiniz demektir.

Bazı kısımlar bizim için dahi tam anlaşılamaz bir durumda olduğu için bu yazıda atladığım kısımlar da var. Örneğin parent'ın render edilirken children hakkında bilgiye ihtiyacı olduğu **multipass rendering** işlemi gibi konularda React'in henüz iyi bir kullanım senaryosu bulunmuyor. Ayrıca, [error handling API](https://reactjs.org/docs/error-boundaries.html)'nin de henüz bir hooks versiyonu yok. Bu iki problemin birlikte çözülebilmesi de mümkün. Fakat Concurrent Mode henüz stabil versiyonda değil ve bu durum için Suspense'in nasıl uyacağı hakkında ilginç sorular yer alıyor. Belki de onlar stabil hale geldiğinde ve Suspense, [lazy loading](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactlazy-code-splitting-with-suspense)'den daha hazır olduğunda bu yazının devamını yazabilirim.

**Bu kavramları hiç düşünmeden dahi başarılı uygulamalar üretiyor olmanın, React'in bir başarısı olduğunu düşünüyorum.** Reconciliation'ın sezgisel bir şekilde çalışması gibi React'te varsayılan olarak gelen birçok özellik, kullanım senaryolarının çoğunda iyi bir şekilde çalışıyor. Liste render ederken görüntülenen `key` uyarısı gibi diğer uyarılar da iyi kod yazmak için sizi doğru şekilde yönlendirebiliyor.

Umarım bu yazı faydalı olmuştur ve React kütüphanesi'nin nasıl çalıştığı hakkındaki sorularınıza cevap bulabilmişsinizdir. Belki de React sizin için çok karmaşık geldi ve bir daha asla bakmak istemeyeceksiniz. Her iki durumda da Twitter'da yorumlarınızı almak isterim. Yazımı okuduğunuz için teşekkür ederim.

