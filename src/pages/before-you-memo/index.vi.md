---
title: 'Trước khi Bạn memo()'
date: '2021-02-23'
spoiler: "Tối ưu việc render một cách tự nhiên."
---

Các kỹ thuật tối ưu hiệu năng cho React đã được nói đến trong rất nhiều bài báo. Nhìn chung, nếu việc cập nhật state diễn ra chậm chạp, bạn cần:

1. Chắc chắn rằng bạn đang chạy bản production. (Bản development về bản chất là chậm hơn, thậm chí chậm hơn rõ rệt trong vài trường hơp dị biệt.)
2. Kiểm tra xem vị trí đặt state trong cây có cao hơn mức cần thiết hay không. (Chẳng hạn, đặt state input vào store trung tâm có vẻ không phải là một ý tưởng hay.)
3. Chạy React DevTools Profiler để khoanh vùng bị render lại nhiều, và bọc nhánh con tốn kém tài nguyên nhất với `memo()` (đồng thời dùng `useMemo()` ở những chỗ cần thiết.)

Bước cuối vô cùng bất tiện, đặc biệt là với các component trung gian, một cách lý tưởng thì compiler nên làm việc đó, tương lai nên như vậy.

**Trong bài này, tôi muốn chia sẻ 2 kỹ thuật khác.** Chúng cơ bản đến bất ngờ, chắc vì vậy mà mọi người hiếm khi nhắc đến chúng khi cần cải thiện hiệu năng render.

**Các kỹ thuật này bổ sung cho những gì bạn đã biết!** Chúng không nhằm thay thế, chỉ là bạn nên thử chúng trước khi, `memo` hay `useMemo`.

## Một component (cố tình) chậm

Dưới đây là một component có vấn đề nghiệm trọng với hiệu năng render:

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
    // Cố ý gây trễ -- chờ hết 100ms
  }
  return <p>I am a very slow component tree.</p>;
}
```

*([Thử tại đây](https://codesandbox.io/s/frosty-glade-m33km?file=/src/App.js:23-513))*

Vấn đề là mỗi khi `color` thay đổi trong `App`, `<ExpensiveTree />` vốn được thiết kế để chạy rất chậm đều render lại theo.

Tôi có thể [thêm `memo()`](https://codesandbox.io/s/amazing-shtern-61tu4?file=/src/App.js) là xong, nhưng đã tồn tại vô số bài viết nói về cách này nên tôi sẽ không giải thích thêm về nó. Tôi muốn đưa ra hai cách làm khác.

## Cách làm 1: Đẩy state xuống

Nhìn kỹ vào đoạn code render, bạn hãy để ý rằng chỉ một phần của cây kết quả là có liên quan đến `color`.

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

Vâỵ hãy tách phần này thành component riêng tên là `Form` và đẩy state vào đó.

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

*([Thử tại đây](https://codesandbox.io/s/billowing-wood-1tq2u?file=/src/App.js:64-380))*

Giờ nếu `color` thay đổi, chỉ mỗi `Form` render lại. Xong vấn đề.

## Cách làm 2: Nâng nội dung lên

Cách làm trên không áp dụng được nếu state được dùng ở đâu đó *cao hơn* nhánh con tốn kém tài nguyên. Giả dụ như khi ta muốn màu của `div` *cha* thay đổi theo `color`:

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

*([Thử tại đây](https://codesandbox.io/s/bold-dust-0jbg7?file=/src/App.js:58-313))*

Lúc này ta không thể "trích xuất" các khu vực dùng `color` thành component riêng nữa, vì khu vực đó sẽ chứa `div` cha, trong đó lại chứa `<ExpensiveTree />`. Xem ra không thể tránh được `memo` rồi, phải không?

Hay vẫn có thể nhỉ?

Vọc sandbox này để xem còn cách nào khác.

...

...

...

Hoá ra câu trả lời lại đơn giản thấy rõ:

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

*([Thử tại đây](https://codesandbox.io/s/wonderful-banach-tyfr1?file=/src/App.js:58-423))*

Ta tách `App` làm hai. Những phần phụ thuộc vào `color`, cùng với bản thân state `color` được đưa vào `ColorPicker`.

Phần không liên quan đến `color` trong `App` được truyền vào `ColorPicker` như nội dung JSX, hay còn được biết đến là prop `children`.

Khi `color` thay đổi, `ColorPicker` render lại. Riêng prop `children` nhận từ `App` vẫn thế, nên React sẽ không hỏi thăm đến nhánh con đó.

Kết quả là, `<ExpensiveTree />` không render lại.

## Bài học rút ra là gì?

Trước khi nghĩ đến các kỹ thuật tối ưu như `memo` hay `useMemo`, ta nên lưu ý để tách *những phần sẽ thay đổi* riêng ra khỏi *những phần không thay đổi*.

Điều thú vị của các cách tiếp cận này **bản thân chúng thực sự không chủ đích được dùng để tăng hiệu năng**. Sử dụng prop `children` để chia nhỏ các component không chỉ giúp luồng dữ liệu trong ứng dụng dễ theo dõi hơn mà còn giảm số lượng prop phải truyền xuống dưới cây. Hiệu năng được cải thiện trong các trường hợp này là hệ quả tích cực kèm theo, chứ không phải là mục tiêu nguyên bản.

Đặc biệt hơn, pattern này còn mở ra thêm nhiều lợi ích về hiệu năng trong tương lai.

Ví dụ, khi [Server Components](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html) ổn định và sẵn sàng được tiếp nhận, `ColorPicker` có thể nhận được `children` [ngay từ phía server](https://youtu.be/TQQPAU21ZUw?t=1314). Cả `<ExpensiveTree />` và các nội dung của nó có thể chạy trên server, thậm chí khi cần cập nhật state cấp cao nhất thì React sẽ "bỏ qua" các khu vực này ở phía client.

Ngay cả `memo` cũng không thể làm được điều này. Nhưng nhắc lại, hai hướng tiếp cận này bổ trợ lẫn nhau. Đừng quên đưa state xuống dưới (và đẩy nội dung lên trên!).

Tiếp đến, nếu vẫn chưa đủ, hãy dùng Profiler và nhớ đến `memo`.

## Hình như tôi đã đọc thứ này rồi?

[Hoàn toàn có thể.](https://kentcdodds.com/blog/optimize-react-re-renders)

Đây không phải ý tưởng gì mới. Nó là hệ qủa thiết yếu từ mô hình chia tách thành phần của React. Các cách làm này đơn giản đến mức nhiều lúc bị bỏ quên, và chúng xứng đáng được yêu thương nhiều hơn một chút.
