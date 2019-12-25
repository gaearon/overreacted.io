---
title: Tại sao chúng ta phải viết super(props)?
date: '2018-11-30'
spoiler: Có một twist ở cuối bài.
---


Nghe nói [Hook](https://reactjs.org/docs/hooks-intro.html) đang là trend. Trớ trêu thay, tôi muốn viết bài đầu tiên cho blog này để nói về điều thú vị của *class* component.

**Vấn đề này *không* liên quan tới việc sử dụng React một cách hiệu quả. Nhưng bạn sẽ cảm thấy chúng thú vị nếu như bạn muốn tìm hiểu sâu hơn về cách hoạt động.**

Đây là bài đầu tiên.

---

Chúng ta đã viết `super(props)` không biết bao nhiêu lần trong đời:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Dĩ nhiên, nếu áp dụng [class field proposal](https://github.com/tc39/proposal-class-fields) thì có thể bỏ qua *nghi thức* này:

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

Cú pháp này [đã  được hoạch định](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) khi React 0.13 đã hỗ trợ cho plain class năm 2015. KHai báo `constructor` và gọi `super(props)` luôn là kế hoạch tạm thời cho đến khi có một cách khác tốt hơn.

Quay về ví dụ,  chỉ sử dụng các tính năng của ES2015:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**Tại sao chúng ta lại gọi `super`? Chúng ta có thể *không* gọi chúng được không? Nếu chúng ta gọi chúng, thì chuyện gì sẽ xảy ra nếu chúng ta không truyền `props`? Truyền thêm các tham số khác được không?** Cùng tìm hiểu nào.

---

Trong JavaScript, `super` để gọi lại constructor của class cha. (Trong ví dụ của chúng ta, nó trỏ về `React.Component`.)

Điều quan trọng, bạn **không thể sử dụng `this`** trong constructor nếu chưa gọi đến constructor của class cha. JavaScript sẽ không để bạn làm việc này:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴  Không thể dùng `this` được
    super(props);
    // ✅  Giờ thì dùng được rồi
    this.state = { isOn: true };
  }
  // ...
}
```

Có một lý do chính đáng giải thích vì sao JavaScript phải thực hiện constructor của lớp cha trước khi đụng vào `this`. Hãy xem xét trường hợp sau:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴  Điều này không cho phép, đọc lý do ở bên dưới
    super(name);
  }
  greetColleagues() {
    alert('Chào buổi sáng!');
  }
}
```

Hãy tưởng tượng, khi bạn có thể dùng `this` trước `super`. Một tháng sau, chúng ta đổi `greetColleagues`, thêm `this.name` khi alert:

```jsx
  greetColleagues() {
    alert('Chào buổi sáng!');
    alert('Tên tôi là ' + this.name + ', rất vui được gặp bạn!');
  }
```

Nhưng chúng ta quên rằng `this.greetColleagues()` được gọi trước `super()`, giá trị `this.name` **chỉ có sau khi gọi `super()`**! Lúc này bạn có thể thấy, code như thế này khó để biết được lỗi ở đâu.

Để tránh những điều như vậy, **JavaScript chỉ định rằng nếu bạn muốn sử dụng `this` bên trong constructor, bạn *phải* gọi `super` trước.** Để cho thằng cha làm việc của nó! Và điều này cũng áp dụng với các lớp React components:

```jsx
  constructor(props) {
    super(props);
    // ✅  Okay, dùng `this` được rồi
    this.state = { isOn: true };
  }
```

Chúng ta cùng đến với câu hỏi khác: phải sao phải truyền vào `props`?

---

Bạn hãy nghĩ đơn giản rằng khi truyền `props` vào `super` là cần thiết để `React.Component` constructor có thể thiết lập `this.props`:

```jsx
// Bên trong React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

Nó thật sự là [cách mà chúng tôi thực hiện bên trong React.Component](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

Bằng cách nào đó, nếu bạn gọi `super()` mà không có tham số `props`, bạn vẫn có thể sử dụng `this.props` trong phương thức `render` và các phương thức khác. (Nếu không tin, hãy tự kiểm tra xem!)

Vậy *nó* hoạt động như thế nào? Hóa ra **React đã gán `props` cho một instance ngay sau constructor:**

```jsx
  // Bên trong React
  const instance = new YourComponent(props);
  instance.props = props;
```

Thế nên khi bạn quên bỏ thằng `props` vào `super()`, thì trong React bạn vẫn có thể gọi nó sau đó. Có một lý do cho việc này.

Khi React hỗ trợ thêm class, nó không chỉ hỗ trợ class cho mỗi phiên bản ES6. Mà mục tiêu chính là hỗ trợ nhiều class abstraction nhất có thể. [Không rõ](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) làm thế nào ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript, hoặc các giải pháp khác định nghĩa component. Vì vậy, React sử dụng `super()` không hề là quan điểm cá nhân.

Vậy có nghĩa là bạn có thể gọi `super()` thay vì `super(props)`?

**Không. Như vậy rất khó hiểu.** Chắc chắn, React sẽ gán `this.props` *sau khi*  constructor chạy. Nhưng `this.props` vẫn  là `undefined` *giữa* lúc gọi `super` và kết thúc constructor:

```jsx{14}
// Bên trong React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// Bên trong code của bạn
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 Chúng ta không truyền vào props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined - chưa định nghĩa 
  }
  // ...
}
```

Việc debug sẽ trở nên khó khăn nếu như một vài phương thức được gọi *từ* constructor. **Đó là lý do vì sao luôn khuyến khích bạn sử dụng `super(props)`, mặc dù nó không phải quy định bắt buộc:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ Chúng ta truyền props vào 
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

Điều này đảm bảo `this.props` sẽ được thiết lập trong constructor.

-----

Có một điều cuối mà khiến cho các fan lâu năm của React tò mò.

Bạn có thể thấy rằng khi sử dụng Context API bên trong class (hoặc với `contextTypes` cũ hoặc với `contextType` API được thêm vào ở React 16.6), `context` được đẩy vào tham số thứ hai trong constructor.

Vậy tại sao chúng ta không viết là `super(props, context)`? Có thể chứ, nhưng context ít khi sử dụng nên việc phát sinh lỗi cũng ít xuất hiện.

**Với [class fields proposal](https://github.com/tc39/proposal-class-fields) thì những vấn đề này hầu như biến mất.** Không có constructor, tất cả các tham số đều được truyền vào một cách tự động. Đây là những lý do cho phép một biểu thức `state = {}` bao gồm cả các tham chiếu `this.props` hoặc `this.context` nếu cần thiết.

Với Hooks, chúng ta thậm chí không có `super` hoặc `this`. Nhưng chủ đề đó sẽ giành cho một ngày khác.
