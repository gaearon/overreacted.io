---
title: Super (Props) လို့ ဘာလို့ရေးသလဲ?
date: '2018-11-30'
spoiler: အဆုံးမှာ လှည့်ကွက်ရှိသည်။
---


[Hooks](https://reactjs.org/docs/hooks-intro.html) တွေ နာမည်ကြီးနေတယ်ကြားတယ်။ ဖြစ်ချင်တော့ ဒီဘလော့ ကို *class* components တွေရဲ့ စိတ်ဝင်စားပုံကောင်းတဲ့ အချက်လေးတွေနဲ့ စချင်တယ်။ အဲ့လိုဆို ဘယ်လိုနေမလဲမသိ။

**React ကို အကျိူးရှိရှိ ကောင်းကောင်းမွန်မွန် သုံးနိုင်ဖို့ ဒီအချက်တွေက သိပ်ပြီးအရေးပါလှတယ်တော့ မဟုတ်ပါဘူး။  ဒါပေမယ့် အသေးစိတ်ကျကျ သိချင်သူ အတွက်တော့ စိတ်ဝင်စားဖို့ကောင်းပါလိမ့်မယ်။**

ပထမတစ်ချက်က ဒီလိုပါ

---

တစ်သက်လုံး  `super (props)` တွေကို ဒီလိုရေးလာတာ တော်တော်တောင်များခဲ့ပြီ။

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

 [Class fields proposal](https://github.com/tc39/proposal-class-fields) အရဆို တစ်ချို့အချက်တွေကိုချန်ပြီး ဒီလိုရေးလို့ရမယ်။

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

ဒီ syntax ပုံစံကို React 0.13 က plain classes တွေကို စတင် ထောက်ပံံံ့ လိုက်တဲ့ ၂၀၁၅ မှာ အစီအစဉ်ဆွဲခဲ့တယ်။ class fields တွေက ပိုပြီးအဆင်ပြေတဲ့ ရွေးချယ်စရာတစ်ခုဖြစ်မလာခင် အထိတော့ `constructor` ထဲမှာ `super(props)` လို့ခေါ်တာက ယာယီ အဆင်ပြေ စေ တဲ့ ဖြေရှင်းချက် ပါပဲ။     

အပေါ်က ဥပမာကို ES2015 features တွေပဲသုံးပြီး ရေးကြည့်ရအောင်ပါ။

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**`super` ကို ဘာကြောင့် ခေါ်တာပါလဲ။ မခေါ်ဘဲနေလို့ ရပါသလား။ မဖြစ်မနေခေါ်မှရမယ်ဆိုရင်တောင် props argument ကို မသုံးရင် ဘာဖြစ်မှာပါလဲ။ တခြား argument တွေ သုံးလို့ရသေးသလား။ ကြည့်ကြည့်ရအောင် ပါ။**

---

JavaScript မှာ `super` က parent class ရဲ့ constructor ကို ညွန်းပါတယ်။ ( အထက်ပါ ဥပမာထဲမှာဆိုရင်တော့ `React.Component` ပေါ့။)

အရေးကြီးတဲ့အချက်က parent constructor ကို မခေါ်ပြီးမချင်း  `this` ကို constructor ထဲမှာသုံးလို့မရဘူး ဆိုတာပါပဲ။ JavaScript မှာ ဒီလိုလုပ်လို့မရပါဘူး။

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 `this` ကိုသုံးလို့မရသေး
    super(props);
    // ✅ အဆင် ပြေသွားပြီ
    this.state = { isOn: true };
  }
  // ...
}
```

JavaScript မှာ အဲဒီလို `this` ကိုမထိခင် parent constructor ကို အရင်ခေါ်သုံးခိုင်းတဲ့ အကြောင်းပြချက်ကောင်းကောင်း ရှိပါတယ်။ Class အဆက် တစ်ခုကိုပဲ စဉ်းစားကြည့်ပါ

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 သုံးမရပါ၊ ဘာကြောင့်လည်း ဆက်ဖတ်ကြည့်ပါ
    super(name);
  }
  greetColleagues() {
    alert('Good morning folks!');
  }
}
```

ကဲ အရင်ဆုံး `super` ကို မခေါ်ရသေးခင် `this` ကိုသုံးလို့ရတယ်ဆိုပါစို့။ တစ်လကြာတော့ `greetColleagues` ဖန်ရှင်ကို ပြင်ချင်ပြီ။ Person name ကိုပါ alert ပြတဲ့ message ထဲ ထည့်မယ်ပေါ့။

```jsx
  greetColleagues() {
    alert('Good morning folks!');
    alert('My name is ' + this.name + ', nice to meet you!');
  }
```

ဒါပေမယ့် `this.greetColleagues()` ကိုခေါ်တဲ့အခါမှာ `super()` ကိုမခေါ်ရသေးတာကို မမေ့ပါနဲ့။ `super()`ကို မခေါ်ရသေးရင် `this.name` ကိုလည်း set up မလုပ်ရသေးပါဘူး။  `this.name` ဟာ သတ်မှတ်ပြီးသားကို မဖြစ်သေးပါဘူး၊ `undefined` ပဲရှိပါဦးမယ်။ တွေ့တဲ့အတိုင်းပါပဲ ၊ ဒီလို code မျိုး ဒီလို error မျိုးဆိုတာ စဉ်းစားရခက်တတ်ပါတယ်။

အဲ့လိုမထင်မှတ်တဲ့ အမှားတွေကို ရှောင်ရှားနိုင်ဖို့  **JavaScript က `this` ကိုအရင်သုံးမယ်ဆို `super` ကိုအရင်ခေါ်ပါလို့ သတ်မှတ်ထားတာ ဖြစ်ပါတယ်။** တစ်နည်းပြောရင် parent ကို စီစဉ်စရာရှိတာ အရင်စီစဉ်စေတာဖြစ်ပါတယ်။ ဒီအချက်ဟာ class တွေပဲဖြစ်တဲ့ React Class Component တွေအတွက်လည်း အတူတူပဲ ဖြစ်ပါတယ်။

```jsx
  constructor(props) {
    super(props);
    // ✅ `this` ကိုသုံးဖို့ အဆင်ပြေသွားပြီ
    this.state = { isOn: true };
  }
```

ဒီလိုဆို နောက်မေးခွန်းတစ်ခု ကျန်ပါဦးမယ်။ ဘာလို့ `props` ကိုမှ သုံးသလဲ?

---

အဲ့လိုဆို `props` ကို `super` ထဲ မဖြစ်မနေ ဖြတ်ဖို့လိုတယ်၊  ဒါမှ `React.Component` constructor က `this.props` ကို initialize လုပ်လို့ရမယ်လို့ တွေးလို့ရပါတယ်။

```jsx
// React ထဲမှာ
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

တကယ်လည်း  [အဲဒီအတိုင်း](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22) ပဲ ဖြစ်ပါတယ်။

 ဒါပေမယ့်  `super()` ကို `props` argument မသုံးဘဲခေါ်ရင်လည်း render အပါအဝင် တခြား method တွေမှာ `this.props` ကို သုံးလို့ရဆဲပဲ ဖြစ်ပါတယ်။ ( မယုံရင် စမ်းကြည့်ပါ )

ဘယ်လိုဖြစ်တာလဲ ပေါ့။ ဖြစ်ပုံက **React က `props`ကို constructor run ပြီး instance တွေမှာပါ ထည့်ပေးနေတာကိုး။**

```jsx
  // React ထဲမှာ
  const instance = new YourComponent(props);
  instance.props = props;
```

`props` ကို `super()` ထဲဖြတ်ဖို့ မေ့ခဲ့တယ်ဆိုရင်တောင် React ကပြန်ပြင်ပေးနေတာ ဖြစ်ပါတယ် ။  အဲ့ဒီ အတွက်လည်း React မှာ အကြောင်းပြချက်ကောင်းကောင်း ရှိပါတယ်။

တကယ်တော့ React က class တွေ စကြေညာတော့ ES6 class တွေ အတွက်ပဲ ရည်ရွယ် ခဲ့တာမဟုတ်ပါဘူး။ ဖြစ်နိုင်သမျှ class ပုံစံအမျိုးမျိုး   အတွက် အဆင်ပြေအောင် ရည်ရွယ်ထားခဲ့တာ ဖြစ်ပါတယ်။ ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript တို့လို [အခြား languages](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) တွေမှာ ဘယ်လိုပုံစံ ရှိမယ်ဆိုတာ မသိခဲ့၊ မသေချာခဲ့ပါဘူး။  ES6 class တွေမှာ  `super()` ကိုလိုပေမယ့် — တခြား language တွေမှာ လိုမလို မသိတဲ့အတွက် props ကို instance မှာ ထည့်ဖို့ ရည်ရွယ်ချက်ရှိရှိ စီမံထားခဲ့တာပါ။

ဒါဆို `super(props)`လို့ ရေးမယ့်အစား `super()` ပဲရေးလည်း ရမယ်ပေါ့။

**ရှင်းပြဖို့ နည်းနည်းခက် ပေမယ့် အဲ့လိုတော့မရပါဘူး။** React က constructor ကို run ပြီးတဲ့အချိန် `this.props` ကို ထည့်လိုက်မှာတော့ဟုတ်တယ်။ ဒါပေမယ့် constructor ထဲ (super call နဲ့ constructor အဆုံးကြားထဲ ) မှာတော့ `this.props` က undefined ဖြစ်နေဦးမှာပါပဲ။

```jsx{14}
// React ထဲမှာ
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// ကိုယ့် code ထဲမှာ
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 props ကို မေ့ခဲ့သောအခါ
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined 
  }
  // ...
}
```

အဲ့တော့ အပေါ်က ဥပမာ ထဲကလို constructor ထဲက ခေါ်သုံးတဲ့ method တွေဆို ပြဿနာ တက်မှာ အသေအချာပါပဲ။ debug လုပ်ဖို့လည်း တော်တော်ခက် မယ့် ကိစ္စ ဖြစ်ပါတယ်။ **အဲ့ဒါကြောင့် `super(props)` ကိုပဲ သုံးစေချင်ပါတယ်၊  အတင်းကြီး သုံးမှရမယ် ဆိုတာမျိုး မဟုတ်ပေမယ့်။**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ props ပါတယ်ဟုတ်
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

ဒီမှာဆို `this.props` က constructor ထက်အရင်ရှိတာ သိသာပါတယ်။

-----

Longtime React user တွေ စိတ်ဝင်စားလောက်တဲ့ နောက်ဆုံး တစ်ချက် ရှိပါသေးတယ်။

Context API ကို class တွေမှာသုံးတဲ့အခါ (နဂိုမူလ `contextTypes` ပဲဖြစ်ဖြစ်၊ React 16.6 မှာပါလာတဲ့ `contextType` ပဲဖြစ်ဖြစ်) `context` ကို constructor ရဲ့ ဒုတိယ argument အဖြစ်ထည့်ပေးရတာကို သိမှာပါ။

ဒါဆို ပိုပြီး ပြည့်စုံသွားအောင် `super(props, context)` လို့ဘာလို့ မရေးသလဲပေါ့။  ရပါတယ်၊ ရေးလို့က ။ ဒါပေမယ့်သူက အသုံးနည်း တော့ ပြဿနာ ဖြစ်နိုင်ခြေ နည်းလို့ ထည့်မပြောတာပါ။ 

**ဘာပဲဖြစ်ဖြစ် class fields proposal နဲ့ဆို ဘာမှဖြစ်စရာ အကြောင်းမရှိဘူးလေ။** constructor သတ်သတ်မှတ်မှတ် ထားဖို့မလိုပဲ arguments တွေအားလုံး အလိုလို နေရာတကျ ဖြစ်ပြီးသားပဲ။  `state = {}` မှာ လိုအပ်ရင် `this.props` တို့၊ `this.context` တို့ကိုတောင် ပြန်ညွန်း လို့ရသေးတယ်။

Hooks တွေနဲ့ဆို `super` ရော `this` ပါ မလိုတော့ဘူး။
ဒါပေမယ့် အဲ့ဒါက နောက်မှပြောရမယ့် အကြောင်းတွေပါလေ။