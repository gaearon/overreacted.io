---
title: setState Ne Yapacağını Nasıl Biliyor?
date: '2018-12-09'
spoiler: Dependency injection, onun hakkında düşünmek zorunda değilsen güzeldir.
---

setState bir component içerisinde çağırıldığında sizce neler oluyor?

```jsx{11}
import React from 'react';
import ReactDOM from 'react-dom';

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicked: false };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({ clicked: true });
  }
  render() {
    if (this.state.clicked) {
      return <h1>Thanks</h1>;
    }
    return <button onClick={this.handleClick}>Click me!</button>;
  }
}
ReactDOM.render(<Button />, document.getElementById('container'));
```

Tabi ki React, componenti bir sonraki `{ clicked: true }` state’i ile tekrar render ediyor ve DOM’u `<h1>Thanks</h1>` elemanını gösterecek şekilde güncelliyor.

Gayet sıradan görünüyor. Ama bir dakika, bunu React mı yapıyor, yoksa React DOM mu?

DOM’u güncellemek React DOM’un sorumluluğu gibi görünüyor. Ama biz React DOM’da olmayan `this.setState()` çağrısını yapıyoruz. Ve bizim React.Component base sınıfımız React içerisinde tanımlı.

Peki `React.Component` içerisindeki `setState()` nasıl DOM’u güncelliyor?

**Önemli Not: React konusunda etkin olabilmek için, bu blog sitesindeki [birçok](https://overreacted.io/why-do-react-elements-have-typeof-property/) [diğer](https://overreacted.io/how-does-react-tell-a-class-from-a-function/) [gönderi](https://overreacted.io/why-do-we-write-super-props/) gibi, bu gönderide anlatılanları da bilmek zorunda değilsiniz. Bu gönderi perde arkasında işlerin nasıl yürüdüğünü görmek isteyenler için yazıldı. Tamamen opsiyonel.**

---

`React.Component` sınıfının DOM güncelleme işini yaptığını düşünüyor olabiliriz.

Ama eğer öyle olsaydı, `this.setState()` farklı ortamlarda nasıl çalışacaktı? Örneğin, React Native componentleri de `React.Component`’ten türüyor. Onlar da bizim yukarıda yaptığımız gibi `this.setState()` çağrısını yapıyor, hatta React Native hem Android hem de IOS native bileşenleri ile çalışıyor.

React Test Renderer ve Shallow Renderer size tanıdık geliyor olabilir. Bu iki test stratejisi de normal componentleri render etmenizi ve `this.setState()`’i çağırmanızı sağlıyor. Ama ikisi de DOM ile çalışmıyor.

Eger [React Art](https://github.com/facebook/react/tree/master/packages/react-art) gibi rendererlar kullandıysanız, sayfanızda birden fazla renderer kullanmanın mümkün olduğunu da biliyorsunuzdur. (Örneğin, ART componentleri bir React DOM ağacı üzerinde çalışır.) Bu global bir flag’i veya değişkeni kaçınılmaz hale getirir.

**`React.Component`** **state güncellemelerini bir şekilde platforma özel kod parçalarına aktarır**. Bunun nasıl olduğunu anlamadan önce, paketlerin neden ve nasıl ayrıştırıldığı konusunda daha derine inelim.

---

React “engine”in `react` paketi içerisinde yer aldığına dair genel bir yanılgı var, ama bu doğru değil.

Aslında, React 0.14 ile [React paketleri ayrıştırıldığında](https://reactjs.org/blog/2015/07/03/react-v0.14-beta-1.html#two-packages), `react` paketi özellikle sadece component tanımları için gerekli API’leri içerecek şekilde ayrıştırıldı. React’in büyük bir kısmı aslında React “renderer”lar içerisinde yaşıyor.

`react-dom`, `react-dom/server`, `react-native`, `react-test-renderer`, `react-art` renderer örneklerinden birkaçı (siz de [kendi renderer’inizi](https://github.com/facebook/react/blob/master/packages/react-reconciler/README.md#practical-examples) oluşturabilirsiniz).

İşte bu nedenle `react` paketi hangi platformu hedeflediğinizden bagimsiz bir şekilde kullanışlı bir paket. `react` paketinin bütün exportlari, `React.Component`, `React.createElement`, `React.Children` gibi araçlar ve son olarak da [Hooklar](https://reactjs.org/docs/hooks-intro.html), hedef platformdan bağımsızlar. İster React DOM, ister React DOM Server ister React Native’de çalışıyor olsun, componentleriniz aynı şekilde import edilip ayni şekilde kullanılabilirler.

Bunun aksine, renderer paketleri platform özelinde API’ler sunar, bir DOM node üzerinde bir React hiyerarşisi oluşturmanızı sağlayan `ReactDOM.render()` gibi. Her bir renderer bunun gibi API’ler sunar. İdealde, çoğu componentin bir renderer’dan herhangi bir şey import etmesine gerek yoktur. Bu onları daha taşınabilir hale getirir.

**Bircok insanın React “engine” olarak düşündüğü şey aslında rendererlarin içerisinde yer alır.** Birçok renderer aynı kodu içerir, bu koda [“reconciler”](https://github.com/facebook/react/tree/master/packages/react-reconciler) diyoruz. Bir [derleme adımı](https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#migrating-to-google-closure-compiler), daha iyi bir performans için, reconciler kodunu renderer kodu ile birleştirip tek bir paket haline getirir. (Kod kopyalamak genellikle paket boyutu açısından iyi değildir, fakat React kullanıcılarının büyük bir çoğunluğu aynı anda sadece bir renderer kullanıyor, `react-dom` gibi).

Bu kısımdan öğrenmemiz gereken şey şu, `react` paketi sizin React özelliklerini kullanmanızı sağlar, ama bunların nasıl gerçekleştirildikleri konusunda bilgisi yoktur. Renderer paketleri (`react-dom`, `react-native` vb) ise, platform bağımlı mantıkları ve React özelliklerinin gerçekleştirimini içerir. Bu kodun bir kısmı paylaşılır(“reconciler”), ama bu sadece rendererlarin gerçekleştirim detayı diyebiliriz.

---

Şimdi neden `react` ve `react-dom` paketlerinin yeni özellikler için güncellenmesi gerektiğini biliyoruz. Örneğin, React 16.3 ile gelen Context API özelliği, `React.createContext()` özelliğini kullanılabilir hale getirdi.

Ama `React.createContext()` aslında context özelliğinin gerçek geliştirmesine sahip değil. Örneğin gerçekleştirim, React DOM ve React DOM Server’da farklı şekilde olmak zorunda. Yani, `createContext()` aslında sıradan bazı nesneler döndürüyor:

```jsx
// A bit simplified
function createContext(defaultValue) {
  let context = { _currentValue: defaultValue, Provider: null, Consumer: null };
  context.Provider = {
    $$typeof: Symbol.for('react.provider'),
    _context: context,
  };
  context.Consumer = {
    $$typeof: Symbol.for('react.context'),
    _context: context,
  };
  return context;
}
```

Kodunuzda `<MyContext.Provider>` ya da `<MyContext.Consumer>` kullandığınızda, bu işlemin nasıl yapılmasına karar veren kısım _renderer_ isimli kısımdır. React DOM bir şekilde context değerlerini takip edebilir, fakat React DOM server aynı işi farklı şekilde yapıyor olabilir.

**`react` paketini 16.3+ versiyonuna güncelleyip, `react-dom` paketini güncellemediğinizde, henüz özel `Provider` ve `Consumer` türlerinden haberdar olmayan bir renderer kullanıyor olursunuz.** Bu nedenle eski bir `react-dom` versiyonu bu [türlerin geçerli olmadığını](https://stackoverflow.com/a/49677020/458193) söyleyerek hata verecektir.

Aynı uyarı React Native için de geçerlidir. Fakat, React DOM’un aksine, React güncellemesi React Native güncellemesini zorunlu kılmaz, React Native ile React bağımsız bir versiyon takvimine sahip. Güncellenen renderer kodu, React Native koduna birkaç haftada bir [ayrı ayrı senkronize](https://github.com/facebook/react-native/commits/master/Libraries/Renderer/oss) olur. Bu nedenle React DOM’da kullanılabilir hale gelen bazı özellikler React Native’de daha farklı bir zamanda kullanılır hale gelebilir.

---

Evet, şimdi `react` paketinin ilginç bir şey içermediğini ve asıl gerçekleştirimin `react-dom` , `react-native` , gibi rendererlar içerisinde yer aldığını biliyoruz. Fakat bu bizim sorumuzun cevabı değil, `React.Component` içerisindeki `setState()` nasıl doğru rendererlar ile konuşuyor.

**Cevap şu; her bir renderer oluşturulan sınıfta özel bir alana bir değer tanımlar.** Bu alanın adı `updater`. Bu sizin değiştirebileceğiniz bir değişken değil, daha çok React DOM, React DOM Server ya da React Native'in sınıfınızın bir nesnesini yarattığında değiştirdiği bir alan:

```jsx{4,9,14}
// Inside React DOM
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMUpdater;

// Inside React DOM Server
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMServerUpdater;

// Inside React Native
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactNativeUpdater;
```

`React.Component` içerisindeki `setState` [gerçekleştirimine](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactBaseClasses.js#L58-L67) bakacak olursak, her yaptığının component nesnesini oluşturan renderer'a bu işi delege etmek olduğunu görürüz.

```jsx
// A bit simplified
setState(partialState, callback) {
  // Use the `updater` field to talk back to the renderer!
  this.updater.enqueueSetState(this, partialState, callback);
}
```

React DOM Server [bir state güncellemesini yoksayıp](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRenderer.js#L442-L448) sizi uyarabilir, bunun yerine React DOM ve React Native ise kendi reconciler kopyalarına bu [güncellemeyi yaptırabilir](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberClassComponent.js#L190-L207).

React paketinde tanımlanmış olmasına rağmen, `this.setState()`, bu sayede DOM'u güncelleyebilir. React DOM tarafından belirlenen `this.updater`'i okur ve React DOM'un güncellemeyi ayarlayıp yapmasını sağlar.

---

Sınıfların bu işi nasıl yaptığını artık biliyoruz, peki Hooklar nasıl yapıyor?

İnsanlar [Hooks aday API](https://reactjs.org/docs/hooks-intro.html)'sini gördüklerinde sıklıkla şunu merak ettiler; `useState` ne yapacağını nasıl biliyor? Varsayım onun temel sınıf `React.Component` içindeki `this.setState()`'ten daha "sihirli" bir kod olduğuydu.

Fakat bugün gördüğümüz gibi, temel sınıftaki `setState()` gerçekleştirimi bir illüzyondan daha fazlası değil. Gelen isteği mevcut renderer'a yönlendirmekten daha fazlasını yapmıyor. Ve `useState` Hook da [aslında tam olarak aynı şeyi yapıyor](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactHooks.js#L55-L56).

**`updater` alanı yerine, Hooklar "dispatcher" nesnesini kullanır.** `React.useState()`, `React.useEffect()` ya da herhangi bir diğer Hook çağrısı yaptığınızda, bu çağrılar mevcut dispatcher'a iletilir.

```jsx
// In React (simplified a bit)
const React = {
  // Real property is hidden a bit deeper, see if you can find it!
  __currentDispatcher: null,

  useState(initialState) {
    return React.__currentDispatcher.useState(initialState);
  },

  useEffect(initialState) {
    return React.__currentDispatcher.useEffect(initialState);
  },
  // ...
};
```

Ve her bir renderer componenti render etmeden önce dispatcher'i tanimlar.

```jsx{3,8-9}
// In React DOM
const prevDispatcher = React.__currentDispatcher;
React.__currentDispatcher = ReactDOMDispatcher;
let result;
try {
  result = YourComponent(props);
} finally {
  // Restore it back
  React.__currentDispatcher = prevDispatcher;
}
```

Örnek olarak [buradaki](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRendererHooks.js#L340-L354) React DOM Server gerçekleştirimini ve [buradaki](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberHooks.js) React DOM ve React Native tarafından paylaşılan reconciler gerçekleştirimini verebiliriz.

`react-dom` gibi rendererlarin, kullanılan Hooklar ile aynı pakete erişmesinin sebebi budur. Yoksa, componentiniz gerekli dispatcher'i bulamayacaktır. Bu durum ayni component ağacından [birden fazla React kopyası](https://github.com/facebook/react/issues/13991) bulundurduğunuzda çalışmayabilir. Fakat, bu durum zaten anlaşılması güç hatalara yol acıyordu, Hooklar sizi farklı paket kullanımı size bir probleme sebep olmadan bu durumu düzeltmeye zorluyor.

Her ne kadar bunu yapmanızı tavsiye etmesek de, teknik olarak dispatcher davranışını üst seviye araçlar gibi kullanım durumlarında, isteğinize göre değiştirmeniz mümkün. (`__currentDispatcher` ismi konusunda yalan söyledim, fakat gerçek ismi React repo'sunda bulabilirsiniz.) Örneğin React DevTools, Hook ağacının Javascript yığıt izlerini bularak, iç gözlem yapabilmek için [kendine özel tasarlanmış bir dispatcher](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-debug-tools/src/ReactDebugHooks.js#L203-L214) kullanacak. _Bunu evde denemeyin._

Bu aynı zamanda Hooklarin, doğuştan React'a bağlı olmadığını gösteriyor. Eğer ileride bir çok kütüphane aynı temel Hooklari tekrar kullanmak isterse, teorik olarak dispatcher farklı bir pakete taşınabilir ve birinci-sınıf bir API olarak daha az "korkutucu" bir isimle dışa açılabilir. Pratikte, olgunlaşmamış soyutlamayı gerçekten bir ihtiyaç olmadıkça yapmamayı tercih ediyoruz.

Hem `updater` alanı hem de `__currentDispatcher` nesnesi genel programlama prensiplerinden biri olan _dependency injection_ prensibinin bir türüdür. İki senaryoda da, rendererlar componentlerinizi daha declarative hale getirmek için, `setState` gerçekleştirimini genel React paketine "enjekte" ederler.

React kullanırken bunun nasıl çalıştığı konusunu düşünmenize gerek yoktur. Biz React kullanıcılarının dependency injection gibi soyut kavramlardan daha çok, kendi uygulamalarının koduyla ilgili düşünmesini sağlamaya çalışıyoruz. Fakat `this.setState()` ya da `useState()` nasıl ne yapacağını biliyor konusunu merak ettiyseniz umarım bu yazı size yardımcı olmuştur.
