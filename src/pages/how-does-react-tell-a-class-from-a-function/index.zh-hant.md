---
title: React 如何從函式（Function）中區分出類別（Class）？
date: '2018-12-02'
spoiler: 我們談論關於類別、new、instanceof、原型鏈（prototype chains）、和 API 設計。
---

看看這個被定義為函式的 `Greeting` 元件：

```jsx
function Greeting() {
  return <p>Hello</p>;
}
```

React 也支援把它定義為類別：

```jsx
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}
```

（直到 最近 [hooks](https://reactjs.org/docs/hooks-intro.html) 的出現，這是唯一能使用像是 state 功能的方法。）

當你想要繪製（render）一個 `<Greeting />` 時，你不需要煩惱這個元件是如何被定義的：

```jsx
// 類別或函式 — 隨意。
<Greeting />
```

但是 *React 本身* 在乎這兩者的不同！

如果 `Greeting` 是一個函式, React 需要呼叫它：

```jsx
// 你的程式碼
function Greeting() {
  return <p>Hello</p>;
}

// React 內
const result = Greeting(props); // <p>Hello</p>
```

但如果 `Greeting` 是一個類別，React 需要用 `new` 運算符實現出它的實例，*再* 呼叫剛才創建的實例中的 `render` 方法：

```jsx
// 你的程式碼
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

// React 內
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Hello</p>
```

在上述兩種情境中，React 的目的是拿到繪製過的節點（在這例子中是`<p>Hello</p>`），但是確切的步驟取決於 `Greeting` 是如何被定義的。

**所以 React 是如何知道這個元件是類別還是函式？**

正如我 [上一篇文章](/why-do-we-write-super-props/)所說的，**你 *不需要* 知道這個也能夠有效使用 React，**我多年以來也都不知道這兩者的差別。請不要把這變成一道面試題。事實上，這篇文章與其說是討論 React 的運作，更多的是討論 JavaScript 如何運作。

這個部落格是給想要知道 *為什麽* React 是以這種方式運作而感到好奇的讀者。你是這種人嗎？那讓我們一起鑽研吧。

**這是一段漫長的旅程，繫好安全帶了。這篇文章並不會討論太多關於 React 本身的資訊。相反的，我們會討論 `new`、`this`、`class`、箭頭函式、`prototype`、`__proto__`、`instanceof` 的某些面向，還有這些東西是如何在 JavaScript 中協同運作的。幸運的是，當你 *使用* React 時你不必考慮那麼多。不過如果你正在實做 React 的話......**

（如果你真的只想知道答案的話，直接看最後一段。）

----

首先，我們需要理解為什麼以不同的方式處理函式跟類別是很重要的。注意我們在呼叫類別時是如何使用 `new` 運算符：

```jsx{5}
// 如果 Greeting 是個函式
const result = Greeting(props); // <p>Hello</p>

// 如果 Greeting 是個類別
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Hello</p>
```

讓我們看看 `new` 運算符在 JavaScript 中大致上有什麼作用。

---

以前 JavaScript 是沒有類別的。然而，你可以直接用函式表達類似類別的模式。說得更具體一點，你可以用 *任何* 函式扮演類似類別的建構子，你只要在呼叫函式前加上 `new` 就可以了：

```jsx
// 只是個函式
function Person(name) {
  this.name = name;
}

var fred = new Person('Fred'); // ✅ Person {name: 'Fred'}
var george = Person('George'); // 🔴 不行
```

你到今天仍然能寫這樣的程式碼！在 DevTools 中試試看。

如果你呼叫 `Person('Fred')` 時**缺少了** `new`，在這之間的 `this` 會指向某個全域而無用的東西（例如，`window` 或 `undefined`）。所以我們的程式碼將會異常終止，或是做一些像設置 `window.name` 的蠢事。

藉由在呼叫前增加 `new`，我們告訴 JavaScript 說：「嘿 JavaScript，我知道 `Person` 只是一個函式，但讓我們假裝它就像一個類別的建構子，**創建一個 `{}` 物件並且將 `Person` 函式內部的 `this` 指向這個物件，這樣我就能設置 `this.name` 之類的東西了。然後把這個物件回傳給我。**」

這就是 `new` 運算符做的事。

```jsx
var fred = new Person('Fred'); // 與 `Person` 內的 `this` 相同的物件
```

`new` 運算符也可以創建出我們放在 `Person.prototype` 上的任何東西到 `fred` 物件上：

```jsx{4-6,9}
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  alert('Hi, I am ' + this.name);
}

var fred = new Person('Fred');
fred.sayHi();
```

這就是大家在 JavaScript 直接增加類別之前模擬它的方式。

---

所以 `new` 已經在 JavaScript 中存在了一段時間。然而，類別是最近才有的。它讓我們能更貼近我們意圖地重寫上述的程式碼：

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
  sayHi() {
    alert('Hi, I am ' + this.name);
  }
}

let fred = new Person('Fred');
fred.sayHi();
```

在程式語言和 API 設計中，*抓住開發者的意圖* 是重要的。

如果你使用函式，JavaScript 會無法猜測它是否該被呼叫（如 `alert()` ），或是它是被用來當成一個建構子（ 如`new Person()`）。而如果你忘記在的函式前指定 `new`（像是 `Person`），這亦會導致程式出現令人困惑的異常行為。

**類別語法讓我們能表示：「這不只是一個函式 —— 他是一個類別，而且有建構子。」**如果你在呼叫它時忘記用 `new`，JavaScript 將會提出錯誤：

```jsx
let fred = new Person('Fred');
// ✅  如果 Person 是一個函式： 沒問題
// ✅  如果 Person 是一個類別： 也沒問題

let george = Person('George'); // 我們忘記 `new` 了
// 😳 如果 Person 是一個像建構子的函式：令人困惑的行為
// 🔴 如果 Person 是一個類別：直接失敗
```

這有助於我們儘早發現錯誤，而不是等待一些晦澀費解的錯誤發生，例如 `this.name` 被當成 `window.name` 而不是 `george.name`。

然而，這意味著 React 需要在呼叫任何類別之前寫 `new`，它不能只是將它當作一般的函式呼叫，因為 JavaScript 會將其視為一個錯誤！

```jsx
class Counter extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

// 🔴 React 不能這樣做：
const instance = Counter(props);
```

這會帶來麻煩。

---

在我們探討 React 如何解決這個問題前，重要的是要記得大多數 React 的開發者會使用如 Babel 的編譯器來編譯最新的功能，比如對舊版瀏覽器支援類別的使用。所以我們需要在我們的設計中考慮到有編譯器的狀況。

在 Babel 早期的版本，類別可以在沒有指名 `new` 的情況下被呼叫，然而，這已經被修正了 ——  藉由產生一些額外的程式碼：

```jsx
function Person(name) {
  // 稍微簡化從 Babel 的輸出
  if (!(this instanceof Person)) {
    throw new TypeError("Cannot call a class as a function");
  }
  // 我們的程式碼：
  this.name = name;
}

new Person('Fred'); // ✅ 沒問題
Person('George');   // 🔴 無法像呼叫函式般呼叫一個類別
```

你可能在捆綁包中看過這樣的程式碼，這全是 `_classCallCheck` 函式所做的事。（你可以藉由選擇不進行檢查的「鬆散模式（loose mode）」來減少捆綁包大小，但這可能會使你最終轉換為原生的類別變得複雜。）

---

目前為止，你應該對用 `new` 或不用 `new` 呼叫某些東西之間的差別有一個大致的理解：

|  | `new Person()` | `Person()` |
|---|---|---|
| `class` | ✅ `this` 是 `Person` 的實例 | 🔴 `TypeError`
| `function` | ✅ `this` 是 `Person` 的實例 | 😳 `this` 是 `window` 或 `undefined` |

這就是為什麼正確地呼叫你的元件對 React 來說是極為重要的。**如果你的元件被定義為類別，React 便需要在呼叫時使用 `new`。**

所以 React 光是透過檢查就能確認某個元件是不是類別嗎？

沒那麼容易！即使我們可以 [在 JavaScript 函式中區別出類別](https://stackoverflow.com/questions/29093396/how-do-you-check-the-difference-between-an-ecmascript-6-class-and-function)，這仍然不適用於被像是 Babel 這樣的工具處理過的類別。對於瀏覽器而言，它們就只是單純的函式。對 React 來說真是倒楣。

---

好吧，所以或許 React 可以在每次呼叫時使用 `new`？不幸的是，這也不見得總是奏效。

在一般的函式中用 `new` 來呼叫它們，會給它們一個物件實例當作是 `this`。這對於寫成建構子的函式（像上述的 `Person`）是合適的，但它對函式元件而言是很混亂的：

```jsx
function Greeting() {
  // 我們不會期望 `this` 在這裡是任何一種實例。
  return <p>Hello</p>;
}
```

但這種情況還算可以忍受的。這裡有兩個 *其他* 可以扼殺這個想法的理由。

---

第一個為什麼使用 `new` 不總是奏效的理由，是使用 `new` 呼叫原生（不是被 Babel 編譯過）的箭頭函式（Arrow function）會拋出一個錯誤：

```jsx
const Greeting = () => <p>Hello</p>;
new Greeting(); // 🔴 Greeting is not a constructor
```

這種行為是刻意的，並且遵循箭頭函數的設計。箭頭函式的主要優點之一是它們 *沒有* 自己的 `this` 值。 `this` 是從最靠近自身的一般函式決定的：

```jsx{2,6,7}
class Friends extends React.Component {
  render() {
    const friends = this.props.friends;
    return friends.map(friend =>
      <Friend
        // `this` 是從 `render` 方法中決定的
        size={this.props.size}
        name={friend.name}
        key={friend.id}
      />
    );
  }
}
```

好的，所以**箭頭函式是沒有自己的 `this` 值的，**但這意味著拿它們當作建構子是完全沒有作用的！

```jsx
const Person = (name) => {
  // 🔴 這樣不合理！
  this.name = name;
}
```

因此，**JavaScript 不允許使用 `new` 呼叫一個箭頭函式。**如果你這麼做的話，你無論如何都會產生一個錯誤，這件事最好早點告訴你。這跟 JavaScript 不讓你在 *沒有* `new` 時呼叫一個類別的情況類似。

這個行為很棒，但同時也搞雜了我們的計劃，React 不能僅僅對所有的東西呼叫 `new`，因為它違背了箭頭函式！我們也許能試著透過箭頭函式缺少 `prototype` 的特性來特別偵測出它們，並且只不 `new` 它們：

```jsx
(() => {}).prototype // undefined
(function() {}).prototype // {constructor: f}
```

但這對被 Babel 編譯過的函式 [不奏效](https://github.com/facebook/react/issues/4599#issuecomment-136562930)。這或許不是什麼大問題，但是還有另一個理由能使這種方法走向一條死路。

---

另一個我們不能總是使用 `new` 的理由，是它會阻隔 React 拿到從那些支援回傳字串或其他基本型態的元件。

```jsx
function Greeting() {
  return 'Hello';
}

Greeting(); // ✅ 'Hello'
new Greeting(); // 😳 Greeting {}
```

又來，這再次與 [`new` 運算符](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new) 的古怪設計有關，正如我們之前看到的，`new` 告訴 JavaScript 引擎創建一個物件，在內部創建一個 `this` 物件，然後將這個物件當作 `new` 的結果回給我們。

然而，JavaScript 還允許被 `new` 呼叫的函式藉由回傳其他物件來 *覆蓋* 它的回傳值，根據推測，這被認為對於如果我們想要用池化來重用實例，這樣的模式會很有用：

```jsx{1-2,7-8,17-18}
// 懶創建
var zeroVector = null;

function Vector(x, y) {
  if (x === 0 && y === 0) {
    if (zeroVector !== null) {
      // 重用相同的實例
      return zeroVector;
    }
    zeroVector = this;
  }
  this.x = x;
  this.y = y;
}

var a = new Vector(1, 1);
var b = new Vector(0, 0);
var c = new Vector(0, 0); // 😲 b === c
```

然而，如果一個函式的回傳值 *不是* 一個物件， `new` 會 *完全忽略* 它，就是說如果你回傳字串或是數字，它會像根本沒有回傳一樣。

```jsx
function Answer() {
  return 42;
}

Answer(); // ✅ 42
new Answer(); // 😳 Answer {}
```

所以這裡根本沒有辦法當函式被用 `new` 呼叫時，讀到它原本的回傳值（像是數字或字串）。因此，如果 React 總是使用 `new` 來呼叫函式，它將會無法增加那些回傳字串的元件的支援！

這無法接受，我們勢必得妥協。

---

到目前為止我們學到了什麼？React 必須 *用* `new` 呼叫類別（包含 Babel 的輸出），但必須 *不用* `new` 呼叫一般的函式（包含 Babel 的輸出）或是箭頭函式，而且並沒有可靠的方法區別它們。

**如果我們解決不了一般性的問題，那我們能否解決比較特定的問題？**

當你將元件定義一個類別時，你可能想要為了 `this.setState()` 這樣的預設方法去擴展 `React.Component`，**跟試著檢查所有類別相比，我們能否只偵測 `React.Component` 的子孫？**

劇透：這正是 React 所做的。

---

或許，檢查 `Greeting` 是不是 React 元件的慣用方法，是測試是否 `Greeting.prototype instanceof React.Component`：

```jsx
class A {}
class B extends A {}

console.log(B.prototype instanceof A); // true
```

我知道你在想什麼，剛剛發生什麼事！？要回答這個問題，我們需要了解 JavaScript 的原型（prototype）。

你可以常聽到「原型鏈（prototype chain）」，在 JavaScript 中，所有的物件都應該有一個「原型」。當我們寫 `fred.sayHi()` 而沒有 `sayHi` 屬性時，我們會從 `fred` 物件的原型中尋找 `sayHi` 屬性。如果我們在那裡找不到，我們會看看鏈中的下一個原型 — `fed` 原型的原型，以此類推。

**令人費解的是，一個類別或函式的 `prototype` 屬性 _並不會_ 指向該值的原型。**我不是在開玩笑。

```jsx
function Person() {}

console.log(Person.prototype); // 🤪 不是 Person 的原型
console.log(Person.__proto__); // 😳 Person 的原型
```

所以「原型鏈」比較像是 `__proto__.__proto__.__proto__` 而不是 `prototype.prototype.prototype`，這我花了多年才理解。

那麼在函式或是類別上的 `prototype` 屬性是什麼？**它是提供給所有被類別或函式 `new` 過的物件的 `__proto__`！**

```jsx{8}
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  alert('Hi, I am ' + this.name);
}

var fred = new Person('Fred'); // 把 `fred.__proto__` 設成 `Person.prototype`
```

然而 `__proto__` 鏈就是 JavaScript 找屬性的方式：

```jsx
fred.sayHi();
// 1. fred 有 sayHi 屬性嗎？ 沒有。
// 2. fred.__proto__ 有 sayHi 屬性嗎？有。呼叫它！

fred.toString();
// 1. fred 有 toString 屬性嗎？ 沒有。
// 2. fred.__proto__ 有 toString 屬性嗎？ 沒有。
// 3. fred.__proto__.__proto__ 有 toString 屬性嗎？ 有。呼叫它！
```

在實務上，除非你在除原型鏈相關的錯誤，否則你幾乎不需要直接在程式碼中碰到 `__proto__`，如果你想在 `fed.__proto__` 提供東西的話，你應該把它放在 `Person.prototype`，至少它原先是這麼被設計的。

起初， `__proto__` 屬性甚至不應該被瀏覽器曝露的，因為原型鏈被視為是內部的概念，但是有些瀏覽器添加了 `__proto__`，最終它勉為其難地被標準化了（但已經被棄用了，取而代之的是 `Object.getPrototypeOf()`）。

**然而，我仍然覺得一個被稱為 `prototype` 的屬性並沒有提供給你該值的原型而感到非常的困惑**（舉例來說，`fred.prototype` 未被定義是因為 `fred` 不是一個函式）。對我而言，我認為這個即使是經驗豐富的開發者也會誤解 JavaScript 原型最大的原因。

---

這是一篇很長的貼文，你說是吧？我們在這已經 8 成，稍等一會兒。

當我們提到 `obj.foo`，我們已經知道 JavaScript 實際上會在 `obj`，`obj.__proto__`，`obj.__proto__.__proto__` 尋找 `foo`，以此類推。

在類別中，你不會直接被曝露這個機制，不過 `extends` 也是在這個經典的原型鏈上運作，這就是我們 React 類別的實例如何取得像是 `setState` 方法的方式：

```jsx{1,9,13}
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

let c = new Greeting();
console.log(c.__proto__); // Greeting.prototype
console.log(c.__proto__.__proto__); // React.Component.prototype
console.log(c.__proto__.__proto__.__proto__); // Object.prototype

c.render();      // 在 c.__proto__ (Greeting.prototype) 找到
c.setState();    // 在 c.__proto__.__proto__ (React.Component.prototype) 找到
c.toString();    // 在 c.__proto__.__proto__.__proto__ (Object.prototype) 找到
```

換句話說，**當你在用類別的時候，一個實例的 `__proto__` 鏈會「鏡像於」類別的階層結構：**

```jsx
// `extends` 鏈
Greeting
  → React.Component
    → Object (隱藏的)

// `__proto__` 鏈
new Greeting()
  → Greeting.prototype
    → React.Component.prototype
      → Object.prototype
```

兩個鏈，[2 Chainz](https://twitter.com/2chainz)。

---

因為 `__proto__` 鏈反映了類別的階層結構，我們可以從 `Greeting.prototype` 開始，隨著 `__proto__` 鏈往下檢查，是否一個 `Greeting` 擴展了 `React.Component`：

```jsx{3,4}
// `__proto__` chain
new Greeting()
  → Greeting.prototype // 🕵️ 我們從這裡開始
    → React.Component.prototype // ✅ 找到了！
      → Object.prototype
```

便利上來說，`x instanceof Y` 正好做了這種搜尋，它隨著 `x.__proto__` 鏈尋找在那裡尋找 `Y.prototype`。

通常，這被拿來判斷是否某個東西是不是一個類別的實例：

```jsx
let greeting = new Greeting();

console.log(greeting instanceof Greeting); // true
// greeting （🕵️‍ 我們從這裡開始）
//   .__proto__ → Greeting.prototype （✅ 找到了！）
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype

console.log(greeting instanceof React.Component); // true
// greeting （‍🕵 我們從這裡開始）
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype （✅ 找到了！）
//       .__proto__ → Object.prototype

console.log(greeting instanceof Object); // true
// greeting （‍🕵 我們從這裡開始）
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype （✅ 找到了！）

console.log(greeting instanceof Banana); // false
// greeting （‍🕵 我們從這裡開始）
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype（🙅‍ 沒有找到！）
```

而它也可以用來對判斷一個類別是否擴展另一個類別：

```jsx
console.log(Greeting.prototype instanceof React.Component);
// greeting
//   .__proto__ → Greeting.prototype （‍🕵 我們從這裡開始）
//     .__proto__ → React.Component.prototype （✅ 找到了！）
//       .__proto__ → Object.prototype
```

然而，這就是我們如何判斷東西是一個 React 元件的類別還是一個一般函式的方法。

---

雖然這不是 React 的作法。😳

有一個對用 `instanceof` 解法的警告，是它在有多個 React 複製品的網頁不奏效，我們會用到 *另一個* React 複製品的 `React.Component` 來檢查元件的繼承關係。有一些的原因說明了單一專案混雜了多個 React 的複製品是不好的，但在歷史上我們已盡可能避免出現這樣的問題。（在 Hook 中，我們 [可能需要](https://github.com/facebook/react/issues/13991) 強制將複製品刪除。）

另外一種可行的想法或許可以檢查原型中是否存在 `render` 方法，然而在當時我們 [並不清楚](https://github.com/facebook/react/issues/4599#issuecomment-129714112) 元件的 API 將會如何包裝，而每一種檢查方式都有成本，所以我們也不希望添加超過一種的檢查，還有這種方法如果 `render` 沒有定義為實例方法也不適用，例如類別屬性的語法。

所以取而代之的是，React 在底層元件中 [添加了](https://github.com/facebook/react/pull/4663) 一個特殊的標記，React 會透過檢查這個標記是否存在，來判斷東西是不是 React 元件的方法，就是這樣。

最初，這個標記是位於底層的 `React.Component` 類別本身：

```jsx
// React 內
class Component {}
Component.isReactClass = {};

// 我們能像這樣檢查它
class Greeting extends Component {}
console.log(Greeting.isReactClass); // ✅ Yes
```

然而，在有些我們的目標的類別實作 [沒有](https://github.com/scala-js/scala-js/issues/1900) 複製靜態的屬性（或設置非標準的 `__proto__`），所以這個標記不見了。

這就是為什麽 React 把標記 [移動](https://github.com/facebook/react/pull/5021) 到了 `React.Component.prototype`：

```jsx
// React 內
class Component {}
Component.prototype.isReactComponent = {};

// 我們能像這樣檢查
class Greeting extends Component {}
console.log(Greeting.prototype.isReactComponent); // ✅ Yes
```

**而這就是實際上關於它全部的內容。**

你可能會疑惑為什麼標記是物件而不是布林值，實作上它是什麽並不重要，但在早年版本的 Jest（在 Jest 是 Good™️ 之前）預設會將自動模仿（automocking）打開，生成的模仿物省略了原生的屬性，[破壞了檢查](https://github.com/facebook/react/pull/4663#issuecomment-136533373)。謝了，Jest。

截至今日，這個 `isReactComponent` 檢查仍 [在 React 中被使用](https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js#L297-L300)。

如果你沒有擴展 `React.Component`，React 在原型中會找不到 `isReactComponent`，進而不會把元件當成一個類別。現在你知道為何發生 `Cannot call a class as a function` 錯誤 [最受歡迎的解答](https://stackoverflow.com/a/42680526/458193) 是加 `extends React.Component` 了。最後，[增加了一個警告](https://stackoverflow.com/a/42680526/458193)，是會在 `prototype.render` 存在，而 `prototype.isReactComponent` 不存在時發出警告。

---

你可能會說這篇故事有點誘導推銷（bait-and-switch）。**實際上的答案其實非常簡單，但我卻用大量離題的事來 *解釋* 為什麼 React 到最後會用這個解法，以及替代方案是什麼。**

以我的經驗，函式庫 API 通常就是這種情況，為了使 API 易於使用，你常常需要去考慮程式語言的語意（對於很多種程式語言可能還需要考慮未來的走向）、運行效能、在有或沒有編譯階段時的的人體工學、生態系以及包裝解法的現狀、預先的警告、和其他很多東西，最後的結果可能不會總是那麼優雅，但它一定可行。

**如果最終 API 是可行的，_它的使用者_ 就永遠不必去思考其中的過程，**反而他們能專注於創造應用程式。

但如果你也充滿好奇心…，知道它如何運作也不錯。
