---
title: ทำไมเราถึงต้องเขียน super(props)?
date: '2018-11-30'
spoiler: มีหักมุมตอนจบ
---

ผมได้ยินมาว่า [Hooks](https://reactjs.org/docs/hooks-intro.html) กำลังดังมาก แต่ผมจะเปิดตัวบล็อคนี้ ด้วยการอธิบายถึงความรู้สนุกๆเกี่ยวกับ component ที่สร้างจาก class แทน เป็นไงล่ะ!

**ความเข้าใจพวกนี้ *ไม่ได้มีความจำเป็น* ในการจะใช้ React ให้มีประสิทธิภาพ แต่คุณอาจจะพบว่ามันบันเทิงได้นะ ถ้าลองได้ขุดคุ้ยดูว่ามันทำงานยังไง**

ขอเริ่มจากอันนี้เป็นอย่างแรก

---

ผมเขียน `super(props)` มาเยอะมากจนนับไม่ถ้วนแล้ว

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

ถ้าใช้ [class fields proposal](https://github.com/tc39/proposal-class-fields) ก็ข้ามพิธีการอะไรแบบนี้ไปได้เลย

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

ไวยากรณ์แบบข้างบน[ถูกวางแผนไว้](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers)ตั้งแต่สมัย React 0.13 เริ่มรองรับการใช้ class เมื่อปี 2015 การประกาศ `constructor` และ `super(props)` นั้นตั้งใจไว้ว่าจะให้เป็นเพียงทางแก้ชั่วคราวจนกว่าจะมีวิธีอื่นที่เหมาะสมในการใช้ class fields

กลับมาที่ตัวอย่างที่ใช้แค่ฟีเจอร์ของ ES2015 กันก่อน

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**ทำไมเราต้องเรียก `super`? แล้วไม่เรียกได้มั้ย? ถ้าจะต้องใช้มัน จะเกิดอะไรขึ้นถ้าเราไม่ส่ง `props` เข้าไป? มันรับตัวแปรอื่นๆอีกไหม?** มาหาคำตอบกัน

---

ใน JavaScript, `super` นั้นก็คือ constructor ของคลาสแม่ (ในตัวอย่างนี้ จะหมายถึงคลาส `React.Component`)

สิ่งสำคัญคือ คุณจะใช้ `this` ไม่ได้ *จนกว่า* คุณจะเรียก constructor ของคลาสแม่ก่อน JavaScript จะไม่ยอมให้คุณทำแบบข้างล่างนี้:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 ยังใช้ `this` ไม่ได้
    super(props);
    // ✅ แต่ตอนนี้ได้ละ
    this.state = { isOn: true };
  }
  // ...
}
```

มันมีเหตุผลอยู่ว่าทำไม JavaScript ถึงบังคับให้เรียก constructor ของคลาสแม่ก่อนที่จะแตะต้อง `this` ลองดูตัวอย่างการสืบทอดคลาสอันนี้:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 แบบนี้ไม่ได้ อ่านเหตุผลข้างล่าง
    super(name);
  }
  greetColleagues() {
    alert('Good morning folks!');
  }
}
```

จินตนาการว่าถ้าเราสามารถใช้ `this` ก่อนเรียก `super` ได้ หนึ่งเดือนให้หลัง เราอาจจะอยากเปลี่ยน `greetColleagues` ให้ใส่ `name` ของคลาส `Person` เข้าไปในข้อความ:

```jsx
  greetColleagues() {
    alert('Good morning folks!');
    alert('My name is ' + this.name + ', nice to meet you!');
  }
```

แต่เราลืมไปว่า `this.greetColleagues()` ถูกเรียกก่อนที่ `super()` จะมีโอกาสได้ตั้งค่าให้กับ `this.name` ดังนั้น `this.name` จึงยังเป็น `undefined` อยู่! เห็นไหมว่ามันยากมากนะที่จะนึกถึงถ้าเขียนโค้ดแบบนี้

เพื่อที่จะเลี่ยงหลุมพรางข้างต้น **JavaScript เลยต้องบังคับว่าถ้าคุณอยากใช้ `this` ใน constructor คุณ *ต้อง* เรียก `super` ก่อน** เพื่อให้คลาสแม่ทำหน้าที่ของมัน! และข้อจำกัดนี้ก็ถูกนำไปใช้กับ React component ที่สร้างจาก class ด้วย:

```jsx
  constructor(props) {
    super(props);
    // ✅ ใช้ `this` ได้ละ
    this.state = { isOn: true };
  }
```

แล้วก็มีอีกคำถามเกิดขึ้นคือ: ทำไมต้องส่ง `props` เข้าไปล่ะ?

---

คุณอาจจะคิดว่า เราส่ง `props` ผ่าน `super` เพราะ constructor ของ `React.Component` จำเป็นต้องเอา `props` ไปตั้งค่าให้กับ `this.props`

```jsx
// ข้างในของ React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

ก็เกือบจะถูกต้องเลยนะ -- จริงๆแล้วนั่นแหละคือ [สิ่งที่มันทำ](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22)

แต่อย่างไรก็ตาม แม้ว่าคุณจะเรียก `super()` โดยไม่มีตัวแปร `props` คุณก็จะยังสามารถที่จะเข้าถึง `this.props` ใน `render` หรือฟังชันอื่นๆได้ (ถ้าไม่เชื่อก็ไปลองดูได้)

มันเป็นไปได้ยังไง? จริงๆแล้ว **React นั้นมีการแทนค่า `props` ไว้ให้ตั้งแต่ตอนเรียก constructor *ของคุณ*แล้ว:**

```jsx
  // ข้างในของ React
  const instance = new YourComponent(props);
  instance.props = props;
```

ดังนั้นถึงแม้ว่าคุณจะลืมส่ง `props` เข้าไปใน `super()` React ก็ยังจะแทนค่าให้มันอยู่ดี ซึ่งมันก็มีเหตุผลอยู่ว่า

ตอน React เริ่มรองรับการใช้ class มันไม่ได้แค่รองรับแค่คลาสของ ES6 เท่านั้น เป้าหมายคือมันต้องรองรับวิธีการสร้าง class ให้มากแบบที่สุดเท่าที่จะทำได้ เพราะมัน[ไม่มีความชัดเจน](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) เลยว่า ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript หรือภาษาอื่น ๆ จะมีวิธีสร้าง component กันยังไง ดังนั้น React ก็เลยตั้งใจที่จะไม่ยึดติดกับการบังคับให้เรียก `super()` แม้ว่ามันจะจำเป็นถ้าคุณจะใช้คลาสจาก ES6

แสดงว่า ถ้าเขียนแค่ `super()` แทน `super(props)` ก็ได้สิ?

**ไม่น่าจะได้ เพราะมันยังมีความงงอยู่** ถึงแม้ว่า React จะตั้งค่า `this.props` ให้หลังจากเรียก constructor ของคุณไปแล้ว แต่ `this.props` จะยังเป็น undefined *ในระหว่างที่* กำลังเรียก `super` และ constructor ของคุณ:

```jsx{14}
// ข้างใน React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// ข้างในโค้ดของคุณ
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 ลืมส่ง props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined
  }
  // ...
}
```

มันจะยิ่ง debug ยาก ถ้าอะไรแบบนี้เกิดขึ้นในสักฟังชันที่ถูกเรียกใน constructor อีกที **และนั่นคือเหตุผลว่าทำไมผมถึงแนะนำให้ใช้ `super(props)` เสมอ ถึงแม้ว่ามันจะไม่ได้จำเป็นอย่างยิ่งก็เถอะ**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ We passed props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

นี้จะทำให้มั่นใจได้ว่า `this.props` จะถูกตั้งค่าแน่นอนตั้งแต่ก่อนที่จะจบการทำงานของ constructor

-----

มีข้อสุดท้ายที่คนใช้ React มานานอาจจะเคยสงสัย

คุณอาจจะเคยสังเกตว่าตอนที่คุณใช้ context ในคลาส (ทั้ง `contextTypes` แบบเก่าหรือแบบใหม่ที่เพิ่งเพิ่มเข้ามาใน React 16.6) `context` จะถูกส่งเข้ามาใน constructor เป็นตัวแปรที่สอง

แล้วทำไมเราถึงไม่เขียน `super(props, context)` แทนล่ะ? ก็ทำได้นะ แต่ context มันถูกใช้ไม่บ่อยนัก ดังนั้นปัญหาแบบข้างบนก็เลยเกิดขึ้นไม่เยอะเท่าไหร่

**หลุมพรางแบบนี้จะหายไปถ้าใช้ class fields proposal** การไม่ใช้ constructor ทำให้ตัวแปรทุกตัวถูกส่งผ่านลงไปโดยอัตโนมัติ และช่วยให้การประกาศ `state = {}` นั้นอ้างไปถึง `this.props` หรือ `this.context` ได้ด้วยถ้าจำเป็น

`super` หรือ `this` นั้นจะไม่ต้องมีเลยนะถ้าใช้ Hooks แต่เราไว้คุยเรื่องนั้นกันวันหลัง
