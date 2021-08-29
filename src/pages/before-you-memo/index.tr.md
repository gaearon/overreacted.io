---
title: 'memo() Kullanmadan Önce'
date: '2021-02-23'
spoiler: "Doğal olarak gelen render güncellemeleri."
---

React için performans optimizasyonları hakkında yazılmış bir çok makale mevcut. Genellikle, bazı durum(state) güncellemeleri yavaş çalışıyorsa, şunları yapmanız gerekebilir:

1. React için üretim(production) sürüme sahip olduğunuzdan emin olun.
2. Durumu(state) bileşen ağacında gerekenden daha üste koymadığınızdan emin olun.(Örneğin, bir input durumunu global bir mağazaya(redux gibi) koymak kötü bir fikirdir. Bileşen stateinde olmalıdır.)
3. Neyin yeniden oluşturulduğunu görmek için React developer tools profiler sayfasını kullanıp pahalı bileşenleri `memo()` ile sarabilirsiniz. (Ve gerektiğinde `useMemo()` ekleyebilirsiniz.)

Bu son adım, özellikle arada kalan bileşenler biraz can sıkıcı olabilir. Ve ideal olarak bir derleyici sizin için bunları yapar.
Gelecekte, belki olabilir.

**Bu blog postunda, sizlere iki teknik paylaşmak istiyorum.** Bunlar şaşırtıcı derecede basitler ve insanlar render performansını iyileştirdiklerini anlıyorlar.

**Bu teknik zaten bildiklerinizi tamamlar niteliktedir.** Bunlar `memo` ya da `useMemo()` gibi fonksiyonların yerine geçmezler fakat genellikle önce denemek iyidir.

## Yavaş Bir Bileşen(Yapay Olarak)

İşte ciddi bir render sorunu olan bir bileşen:

```jsx
import { useState } from 'react';

export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}

function ExpensiveTree() {
  let now = performance.now();
  while (performance.now() - now < 100) {
    // Artificial delay -- do nothing for 100ms
  }
  return <p>I am a very slow component tree.</p>;
}
```

*([Burada Dene](https://codesandbox.io/s/frosty-glade-m33km?file=/src/App.js:23-513))*

Buradaki problem, `color` ne zaman güncellenirse, yavaş çalışması için yapay olarak ertelediğimiz `<ExpensiveTree />` bileşeni yeniden render edilecektir.

Bileşeni [bileşeni `memo()` ile sarıp](https://codesandbox.io/s/amazing-shtern-61tu4?file=/src/App.js) sorunu çözebilirim fakat bununla ilgili zaten bir çok makale var. Bu yüzden bununla vakit harcamayacağım. Sizlere iki teknik göstermek istiyorum.

## Çözüm 1: State'i yukarı taşıyın

Render edilen bileşene dikkatlice bakarsanız, ilgili bileşenin sadece bir kısmının `color` state'i ile ilgilendiğini göreceksiniz.

```jsx{2,5-6}
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

İlgili kısımı `Form` bileşenine aktaralım ve state'i ilgili bileşene taşıyalım.

```jsx{4,11,14,15}
export default function App() {
  return (
    <>
      <Form />
      <ExpensiveTree />
    </>
  );
}

function Form() {
  let [color, setColor] = useState('red');
  return (
    <>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
    </>
  );
}
```

*([Burada Dene](https://codesandbox.io/s/billowing-wood-1tq2u?file=/src/App.js:64-380))*

Şimdi ne zaman `color` değişirse, sadece `Form` bileşeni render edilecek. Problem çözüldü.

## Çözüm 2: İçeriği Yukarı Kaldırmak

Eğer state parçası bileşen ağacında daha yukarılarda bir yerde kullanılıyorsa bu çözüm işe yaramaz. Örneğin, `color` state'inin *parent* `<div>`'de kullanıldığını varsayalım.

```jsx{2,4}
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

*([Burada Dene](https://codesandbox.io/s/bold-dust-0jbg7?file=/src/App.js:58-313))*

Şimdi, `color` state'ini kullanmayan parçaları başka bir bileşene ayıklayamayız, çünkü bu, daha sonra `<ExpensiveTree />` içerecek olan `<div>` üst öğesini içerecektir. Bu sefer `memo` kullanmaktan kaçınamazsınız, değil mi?

Ya da yapabilir miyiz?

Bu kod ile biraz oynayın ve çözebilecek misiniz bir düşünün.

...

...

...

Görüldüğü gibi cevap son derece açık:

```jsx{4,5,10,15}
export default function App() {
  return (
    <ColorPicker>
      <p>Hello, world!</p>
      <ExpensiveTree />
    </ColorPicker>
  );
}

function ColorPicker({ children }) {
  let [color, setColor] = useState("red");
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      {children}
    </div>
  );
}
```

*([Burada Dene](https://codesandbox.io/s/wonderful-banach-tyfr1?file=/src/App.js:58-423))*

`App` bileşenini ikiye böldük. `color`'a bağlı olan parçalar, `color` state'nin kendisiyle birlikte `ColorPicker` 'a taşınmıştır.

`color` state'ini kullanmayan bileşenler, `ColorPicker` bileşenine children prop (JSX content) olarak iletilir.

`color` state'i değiştiğinde `ColorPicker` bileşeni yeniden render edilir. Fakat geçen sefer `children` olarak aldığı prop hala aynı kaldığı için, React alt düğümü ziyaret etmeyecektir.

Sonuç olarak `<ExpensiveTree />` bileşeni yeniden render edilmeyecektir.

## Çıkarılan Ders

`memo` veya `useMemo` gibi optimizasyonları uygulamadan önce, değişen kısımları değişmeyen kısımlardan ayırıp ayıramayacağınıza bakmak mantıklı olabilir.

Bu yaklaşımların ilginç yanı, **performansla gerçekten hiçbir ilgisi olmamasıdır**. Bileşenleri bölmek için `children` prop'larının kullanılması, genellikle uygulamanızın veri akışının daha kolay takip edilmesini sağlar ve bileşen ağacından aşağıya inen desteklerin sayısını azaltır. Bu gibi durumlarda iyileştirilmiş performans, nihai hedef değil, zirvededir.

İlginç bir şekilde, bu model gelecekte _daha fazla_ performans avantajının kilidini de açıyor.

Örneğin, [Sunucu Taraflı Bileşenler](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html) kararlı ve benimsenmeye hazır olduğunda, ColorPicker bileşenimiz `children` prop'unu sunucudan alabilir. `<ExpensiveTree />` bileşeninin tamamı veya parçaları sunucudaki çalışabilir ve üst düzey bir React durum güncellemesi bile istemcideki bu bölümleri atlayabilir.

Bu, `memo`'nun bile yapamayacağı bir şey! Ancak yine de, her iki yaklaşım da birbirini tamamlayıcı niteliktedir. Durumu aşağı taşımayı (ve içeriği yukarı kaldırmayı) ihmal etmeyin!

Daha sonra, yaptıklarımız yeterli olmadığında Profiler'i kullanın ve biraz memo serpin.

## Bunu daha önce okumadım mı?

[Evet, kesinlikle.](https://kentcdodds.com/blog/optimize-react-re-renders)

Bu yeni bir fikir değil. Bu, React kompozisyon modelinin doğal bir sonucudur. Takdir edilmeyecek kadar basit ve biraz daha sevgiyi hak ediyor.
