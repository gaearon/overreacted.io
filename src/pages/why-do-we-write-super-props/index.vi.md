---
title: Tại sao chúng ta phải viết super(props)?
date: '2018-11-30'
spoiler: Có một twist ở cuối bài.
---


Tôi đã nghe [Hooks](https://reactjs.org/docs/hooks-intro.html) là một thứ mới nóng bỏng. Cơ mà, tôi muốn bắt đầu bài viết này bằng cách nói về điều thú vị của *class* components.

**Những vấn đề này *không* quan trọng cho việc sử dụng React một cách hiệu quả. Nhưng bạn sẽ cảm thấy chúng thú vị nếu như bạn muốn tìm hiểu sâu hơn về cách hoạt động của chúng.**

Đây là bài đầu tiên.

---

Tôi đã viết `super(props)` rất nhiều lần hơn là tôi biết:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Dĩ nhiên, nếu áp dụng [class fields proposal](https://github.com/tc39/proposal-class-fields) thì có thể bỏ qua chúng:

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

Cú pháp như thế này [đã lên kế hoạch](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) khi React 0.13 đã hỗ trợ cho một lớp đơn giản trong năm 2015. Định nghĩa `constructor` khi gọi `super(props)` luôn được dự định tạm thời cho đến khi các thuộc tính của lớp cung cấp một sự thay thế tốt hơn.

Nhưng hãy quay về ví dụ trước khi chỉ sử dụng các tính năng của ES2015:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**Tại sao chúng ta lại gọi `super`? Chúng ta có thể *không* gọi chúng được không? Nếu chúng ta gọi chúng, thì chuyện gì sẽ xảy ra nếu chúng ta không trả cho nó `props`? Chúng ta có thể cho nó các tham số khác được không?** Cùng tìm hiểu nào.

---

Trong JavaScript, `super` để gọi lại constructor của lớp cha. (Trong ví dụ của chúng ta, đấy chính là lớp `React.Component`.)

Điều quan trọng, bạn không thể sử dụng `this` trong constructor cho đến lúc *sau khi* bạn gọi đến constructor của lớp tra. JavaScript sẽ không để bạn làm việc này:

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

Hãy tưởng tượng khi bạn dùng `this` trước `super`  *đã* chấp thuận. Một tháng sau, chúng ta đổi `greetColleagues` bao gồm có tên người đó trong lời nhắn:

```jsx
  greetColleagues() {
    alert('Chào buổi sáng!');
    alert('Tên tôi là ' + this.name + ', rất vui được gặp bạn!');
  }
```

Nhưng chúng ta quên rằng `this.greetColleagues()` được gọi trước `super()` lúc mà `this.name` được thiết lập. Vì thế `this.name` chưa được định nghĩa! Lúc này bạn có thể thấy, code như thế này có thể rất khó khăn.

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

Bạn hãy nghĩ đơn giản rằng khi truyền `props` vào `super` là sự cần thiết để `React.Component` constructor có thể thiết lập `this.props`:

```jsx
// Bên trong React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

Điều này không xa với thực tế — thật sự, đó là [cách mà chúng thực hiện](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

Nhưng bằng cách nào đó, nếu bạn gọi `super()` mà không có tham số `props`, bạn vẫn có thể sử dụng `this.props` trong phương thức `render` và các phương thức khác. (Nếu không tin tôi, hãy tự kiểm tra xem!)

Vậy *nó* hoạt động như thế nào? Hóa ra **React đã gán `props` cho một instance ngay sau constructor *của bạn*:**

```jsx
  // Bên trong React
  const instance = new YourComponent(props);
  instance.props = props;
```

Thế nên khi bạn quên bỏ thằng `props` vào `super()`, thì trong React bạn vẫn có thể gọi nó sau đó. Có một lý do cho việc này.

Khi React thêm sự hỗ trợ cho các lớp, nó không chỉ hỗ trợ cho các lớp mỗi phiên bản ES6. Mà mục tiêu chính là hỗ trợ nhiều phiên bản lớp nhất có thể. Nó đã [không rõ](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) làm thế nào để có thể ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript, hoặc các giải pháp khác có thể định nghĩa  components. Vì vậy React đã cố ý không quan tâm dến việc có gọi `super()` hay không — mặc dùng đó là lớp ES6.

Vậy có nghĩa là bạn có thể gọi `super()` thay vì `super(props)`?

**Có lẽ là không bởi vì nó vẫn còn khó hiểu.** Chắc chắn, React sẽ gán `this.props` *sau khi*  constructor của bạn được chạy. Nhưng `this.props` vẫn chưa được định nghĩa *giữa* việc gọi `super` và kết thúc constructor của bạn:

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
    super(); // 😬 Chúng ta không thả vào props nhá
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined - chưa định nghĩa 
  }
  // ...
}
```

Việc debug sẽ trở nên khó khăn nếu như một vài phương thức được gọi *từ* constructor. **Đó là lý do vì sao tôi khuyên khích bạn sử dụng `super(props)`, mặc dù nó không cần thiết:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ Chúng ta thả props vào 
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

Điều này đảm bảo `this.props` sẽ được thiết lập trong constructor.

-----

Có một điều cuối mà khiến cho các fan lâu năm của React tò mò.

Bạn có thể thấy rằng khi sử dụng Context API bên trong các lớp (hoặc với `contextTypes` cũ ohoặc với `contextType` API được thêm vào ở React 16.6), `context` được đẩy vào tham số thứ hai trong constructor.

Vậy tại sao chúng ta không viết là `super(props, context)`? Có thể chứ, nhưng context ít khi sử dụng nên việc dính vào lỗi cũng ít xuất hiện.

**Với đề xuất thuộc tính của lớp (the class fields proposal) thì những vấn đề này hầu như biến mất.** Không có constructor rõ ràng, tất cả các tham số đều được thả vào một cách tự động. Đây là những lý do cho phép một biểu thức `state = {}` bao gồm cả các tham chiếu `this.props` hoặc `this.context` nếu cần thiết.

Với Hooks, chúng ta thậm chí không có `super` hoặc `this`. Nhưng chủ đề đó sẽ giành cho một ngày khác.
