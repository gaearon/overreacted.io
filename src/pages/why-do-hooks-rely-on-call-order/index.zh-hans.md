---
title: 为什么顺序调用对 React Hooks 很重要？
date: '2018-12-13'
spoiler: 学习 mixins，render props， HOCs，和 class 的课程。
---

最初你可能会不喜欢 Hooks：

![Negative HN comment](https://user-gold-cdn.xitu.io/2019/2/14/168ea037c69fce4e?w=616&h=110&f=png&s=33543)

它们就像一段音乐，只有经过几次用心聆听才会慢慢爱上：

![Positive HN comment from the same person four days later](https://user-gold-cdn.xitu.io/2019/2/14/168ea249f3f7b83e?w=617&h=135&f=png&s=44605)

当你阅读文档时，不要错过关于[最重要的部分](https://reactjs.org/docs/hooks-custom.html)——创造属于你自己的 Hooks！太多的人纠结于反对我们的观点（class 学习成本高等）以至于错过了 Hooks 更重要的一面，Hooks 像 `functional mixins`，可以让你创造和搭建属于自己的 Hook。

Hooks [受启发于一些现有技术](https://reactjs.org/docs/hooks-faq.html#what-is-the-prior-art-for-hooks)，但在 Sebastian 和团队分享他的想法之后，我才知道这些。不幸的是，这些 API 和现在在用的之间的关联很容易被忽略，通过这篇文章，我希望可以帮助更多的人理解 Hooks 提案中争议较大的点。

**接下来的部分需要你知道 Hook API 的 `useState` 和如何写自定义 Hook。如果你还不懂，可以看看早先的链接。**

(免责说明：文章的观点仅代表个人想法，与 React 团队无关。话题大且复杂，其中可能有错误的观点。)

---

一开始当你学习时你可能会震惊，Hooks 重渲染时是依赖于固定顺序调用的，这里有[说明](https://reactjs.org/docs/hooks-rules.html)。

这个决定显然是有争议的，这也是为什么会有人[反对我们的提案](https://www.reddit.com/r/reactjs/comments/9xs2r6/sebmarkbages_response_to_hooks_rfc_feedback/e9wh4um/)。我们会在恰当的时机发布这个提案，当我们觉得文档和讲座可以足够好的描绘它时。

如果你在关注 Hooks API 的某些点，我建议你阅读下 Sebastian 对 1000+ 评论 RFC 的[全部回复](https://github.com/reactjs/rfcs/pull/68#issuecomment-439314884)，**足够透澈但内容非常多，我可能会将评论中的每一段都变成自己的博客文章。(事实上，我已经[做过](/how-does-setstate-know-what-to-do/)一次！)**

我今天要关注一个具体部分。你可能还记得，每个 Hook 可以在组件里被多次使用，例如，我们可以用 `useState` 声明[多个state](https://reactjs.org/docs/hooks-state.html#tip-using-multiple-state-variables)：

```jsx{2,3,4}
function Form() {
  const [name, setName] = useState('Mary');              // State 变量 1
  const [surname, setSurname] = useState('Poppins');     // State 变量 2
  const [width, setWidth] = useState(window.innerWidth); // State 变量 3

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleSurnameChange(e) {
    setSurname(e.target.value);
  }

  return (
    <>
      <input value={name} onChange={handleNameChange} />
      <input value={surname} onChange={handleSurnameChange} />
      <p>Hello, {name} {surname}</p>
      <p>Window width: {width}</p>
    </>
  );
}
```

注意我们用数组解构语法来命名 `useState()` 返回的 state 变量，但这些变量不会连接到 React 组件上。相反，这个例子中，**React 将 `name` 视为「第一个 state 变量」，`surname` 视为「第二个 state 变量」，以此类推**。它们在重新渲染时用 *顺序调用* 来保证被正确识别。[这篇文章](https://juejin.im/post/5bfa929551882524cb6f413b)详细的解释了原因。

表面上看，依赖于顺序调用只是*感觉有问题*，直觉是一个有用的信号，但它有时会误导我们 —— 特别是当我们还没有完全消化困惑的问题。**这篇文章，我会提到几个经常有人提出修改 Hooks 的方案，及它们存在的问题**。

---

这篇文章不会详尽无遗，如你所见，我们已经看过十几种至数百种不同的替代方案，我们一直在[考虑](https://github.com/reactjs/react-future)替换组件 API。

诸如此类的博客很棘手，因为即使你涉及了一百种替代方案，也有人强行提出一个来：「哈哈，你没有想到*这个*！」

在实践中，不同替代方案提到的问题会有很多重复，我不会列举*所有*建议的 API（这需要花费数月时间），而是通过几个具体示例展示最常见的问题，更多的问题就考验读者举一反三的能力了。🧐

*这不是说 Hooks 就是完美的*，但是一旦你了解其他解决方案的缺陷，你可能会发现 Hooks 的设计是有道理的。

---

### 缺陷 #1：无法提取 custom hook

出乎意料的是，大多数替代方案完全没有提到 [custom hooks](https://reactjs.org/docs/hooks-custom.html)。可能是因为我们在「motivation」文档中没有足够强调 custom hooks，不过在弄懂 Hooks 基本原理之前，这是很难做到的。就像鸡和蛋问题，但很大程度上 custom hooks 是提案的重点。

例如：有个替代方案是限制一个组件调用多次 `useState()`，你可以把 state 放在一个对象里，这样还可以兼容 class 不是更好吗？

```jsx
function Form() {
  const [state, setState] = useState({
    name: 'Mary',
    surname: 'Poppins',
    width: window.innerWidth,
  });
  // ...
}
```

要清楚，Hooks 是允许这种风格写的，你不必将 state 拆分成一堆 state 变量（请参阅参见问题解答中的[建议](https://reactjs.org/docs/hooks-faq.html#should-i-use-one-or-many-state-variables)）。

但支持多次调用 `useState()` 的关键在于，你可以从组件中提取出部分有状态逻辑（state + effect）到 custom hooks 中，同时可以单独使用本地 state 和 effects：

```jsx{6-7}
function Form() {
  // 在组件内直接定义一些 state 变量
  const [name, setName] = useState('Mary');
  const [surname, setSurname] = useState('Poppins');

  // 我们将部分 state 和 effects 移至 custom hook
  const width = useWindowWidth();
  // ...
}

function useWindowWidth() {
  // 在 custom hook 内定义一些 state 变量
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    // ...
  });
  return width;
}
```

如果你只允许每个组件调用一次 `useState()`，你将失去用 custom hook 引入 state 能力，这就是 custom hooks 的关键。

### 缺陷 #2: 命名冲突

一个常见的建议是让组件内 `useState()` 接收一个唯一标识 key 参数（string 等）区分 state 变量。

和这主意有些出入，但看起来大致像这样：

```jsx
// ⚠️ 这不是 React Hooks API
function Form() {
  // 我们传几种 state key 给 useState()
  const [name, setName] = useState('name');
  const [surname, setSurname] = useState('surname');
  const [width, setWidth] = useState('width');
  // ...
```

这试图摆脱依赖顺序调用（显示 key），但引入了另外一个问题 —— 命名冲突。

当然除了错误之外，你可能无法在同一个组件调用两次 `useState('name')`，这种偶然发生的可以归结于其他任意 bug，但是，当你使用一个 *custom hook* 时，你总会遇到想添加或移除 state 变量和 effects 的情况。

这个提议中，每当你在 custom hook 里添加一个新的 state 变量时，就有可能破坏使用它的任何组件（直接或者间接），因为 *可能已经有同名的变量* 位于组件内。

这是一个没有[应变而优](https://juejin.im/post/5c665e44518825622f12e37c)的 API，当前代码可能看起来总是「优雅的」，但应对需求变化时十分脆弱，我们应该从[错误](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html#mixins-cause-name-clashes)中吸取教训。

实际中 Hooks 提案通过依赖顺序调用来解决这个问题：即使两个 Hooks 都用 `name` state 变量，它们也会彼此隔离，每次调用 `useState()` 都会获得独立的
「内存单元」。

我们还有其他一些方法可以解决这个缺陷，但这些方法也有自身的缺陷。让我们加深探索这个问题。

### 缺陷 #3：同一个 Hook 无法调用两次

给 `useState` 「加key」的另一种衍生提案是使用像 Symbol 这样的东西，这样就不冲突了对吧？

```jsx
// ⚠️ 这不是 React Hooks API
const nameKey = Symbol();
const surnameKey = Symbol();
const widthKey = Symbol();

function Form() {
  // 我们传几种state key给useState()
  const [name, setName] = useState(nameKey);
  const [surname, setSurname] = useState(surnameKey);
  const [width, setWidth] = useState(widthKey);
  // ...
```

这个提案看上去对提取出来的 `useWindowWidth` Hook 有效：

```jsx{4,11-17}
// ⚠️ 这不是 React Hooks API
function Form() {
  // ...
  const width = useWindowWidth();
  // ...
}

/*********************
 * useWindowWidth.js *
 ********************/
const widthKey = Symbol();
 
function useWindowWidth() {
  const [width, setWidth] = useState(widthKey);
  // ...
  return width;
}
```

但如果尝试提取出来的 input handling，它会失败：

```jsx{4,5,19-29}
// ⚠️ 这不是 React Hooks API
function Form() {
  // ...
  const name = useFormInput();
  const surname = useFormInput();
  // ...
  return (
    <>
      <input {...name} />
      <input {...surname} />
      {/* ... */}
    </>    
  )
}

/*******************
 * useFormInput.js *
 ******************/
const valueKey = Symbol();
 
function useFormInput() {
  const [value, setValue] = useState(valueKey);
  return {
    value,
    onChange(e) {
      setValue(e.target.value);
    },
  };
}
```

(我承认 `useFormInput()` Hook 不是特别好用，但你可以想象下它处理诸如验证和 dirty state 标志之类，如 [Formik](https://github.com/jaredpalmer/formik)。)

你能发现这个bug吗？

我们调用 `useFormInput()` 两次，但 `useFormInput()` 总是用同一个 key 调用 `useState()`，就像这样：

```jsx
  const [name, setName] = useState(valueKey);
  const [surname, setSurname] = useState(valueKey);
```

我们再次发生了冲突。

实际中 Hooks 提案没有这种问题，因为**每次 _调用_ `useState()` 会获得单独的state**。依赖于固定顺序调用使我们免于担心命名冲突。

### 缺陷 #4：钻石问题(多层继承问题)

从技术上来说这个和上一个缺陷相同，但它的臭名值得说说，甚至维基百科都有介绍。(有些时候还被称为「致命的死亡钻石」 —— cool！)

我们自己的 mixin 系统就[受到了伤害](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html#mixins-cause-name-clashes)。

比如`useWindowWidth()` 和 `useNetworkStatus()` 这两个 custom hooks 可能要用像 `useSubscription()` 这样的 custom hook，如下：

```jsx{12,23-27,32-42}
function StatusMessage() {
  const width = useWindowWidth();
  const isOnline = useNetworkStatus();
  return (
    <>
      <p>Window width is {width}</p>
      <p>You are {isOnline ? 'online' : 'offline'}</p>
    </>
  );
}

function useSubscription(subscribe, unsubscribe, getValue) {
  const [state, setState] = useState(getValue());
  useEffect(() => {
    const handleChange = () => setState(getValue());
    subscribe(handleChange);
    return () => unsubscribe(handleChange);
  });
  return state;
}

function useWindowWidth() {
  const width = useSubscription(
    handler => window.addEventListener('resize', handler),
    handler => window.removeEventListener('resize', handler),
    () => window.innerWidth
  );
  return width;
}

function useNetworkStatus() {
  const isOnline = useSubscription(
    handler => {
      window.addEventListener('online', handler);
      window.addEventListener('offline', handler);
    },
    handler => {
      window.removeEventListener('online', handler);
      window.removeEventListener('offline', handler);
    },
    () => navigator.onLine
  );
  return isOnline;
}
```

这是一个真实可运行的示例。 **custom hook 作者准备或停止使用另一个 custom hook 应该是要安全的，而不必担心它是否已在链中某处「被用过了」**。

(作为反例，遗留的 React `createClass()` 的 mixins 不允许你这样做，有时你会有两个 mixins，它们都是你想要的，但由于扩展了同一个 「base」 mixin，因此互不兼容。)

这是我们的 「钻石」：💎

```
       / useWindowWidth()   \                   / useState()  🔴 Clash
Status                        useSubscription() 
       \ useNetworkStatus() /                   \ useEffect() 🔴 Clash
```

依赖于固定的顺序调用很自然的解决了它：

```
                                                 / useState()  ✅ #1. State
       / useWindowWidth()   -> useSubscription()                    
      /                                          \ useEffect() ✅ #2. Effect
Status                         
      \                                          / useState()  ✅ #3. State
       \ useNetworkStatus() -> useSubscription()
                                                 \ useEffect() ✅ #4. Effect
```

函数调用不会有「钻石」问题，因为它们会形成树状结构。🎄

### 缺陷 #5：复制粘贴的主意被打乱

或许我们可以通过引入某种命名空间来挽救给 state 加「key」提议，有几种不同的方法可以做到这一点。

一种方法是使用闭包隔离 state 的 key，这需要你在 「实例化」 custom hooks时给每个 hook 裹上一层 function：

```jsx{5,6}
/*******************
 * useFormInput.js *
 ******************/
function createUseFormInput() {
  // 每次实例化都唯一
  const valueKey = Symbol();  

  return function useFormInput() {
    const [value, setValue] = useState(valueKey);
    return {
      value,
      onChange(e) {
        setValue(e.target.value);
      },
    };
  }
}
```

这种作法非常繁琐，Hooks 的设计目标之一就是避免使用高阶组件和 render props 的深层嵌套函数。在这里，我们不得不在使用 *任何* custom hook 时进行「实例化」 —— 而且在组件主体中只能单次使用生产的函数，这比直接调用 Hooks 麻烦好多。

另外，你不得不操作两次才能使组件用上 custom hook。一次在最顶层(或在编写 custom hook 时的函数里头)，还有一次是最终的调用。这意味着即使一个很小的改动，你也得在顶层声明和render函数间来回跳转：

```jsx{2,3,7,8}
// ⚠️ 这不是 React Hooks API
const useNameFormInput = createUseFormInput();
const useSurnameFormInput = createUseFormInput();

function Form() {
  // ...
  const name = useNameFormInput();
  const surname = useNameFormInput();
  // ...
}
```

你还需要非常精确的命名，总是需要考虑「两层」命名 —— 像 `createUseFormInput` 这样的工厂函数和 `useNameFormInput`、`useSurnameFormInput`这样的实例 Hooks。

如果你同时调用两次相同的 custom hook 「实例」，你会发生state冲突。事实上，上面的代码就是这种错误 —— 发现了吗？ 它应该为：

```jsx
  const name = useNameFormInput();
  const surname = useSurnameFormInput(); // Not useNameFormInput!
```

这些问题并非不可克服，但我认为它们会比遵守 [Hooks规则](https://reactjs.org/docs/hooks-rules.html) 的阻力大些。

重要的是，它们打破了复制粘贴的小算盘。在没有封装外层的情况下这种 custom hook 仍然可以使用，但它们只可以被调用一次(这在使用时会产生问题)。不幸的是，当一个API看起来可以正常运行，一旦你意识到在链的某个地方出现了冲突时，就不得不把所有定义好的东西包起来了。

### 缺陷 #6：我们仍然需要一个代码检查工具

还有另外一种使用密钥state来避免冲突的方法，如果你知道，可能会真的很生气，因为我不看好它，抱歉。

这个主意就是每次写 custom hook 时 *组合* 一个密钥，就像这样：

```jsx{4,5,16,17}
// ⚠️ 这不是 React Hooks API
function Form() {
  // ...
  const name = useFormInput('name');
  const surname = useFormInput('surname');
  // ...
  return (
    <>
      <input {...name} />
      <input {...surname} />
      {/* ... */}
    </>    
  )
}

function useFormInput(formInputKey) {
  const [value, setValue] = useState('useFormInput(' + formInputKey + ').value');
  return {
    value,
    onChange(e) {
      setValue(e.target.value);
    },
  };
}
```

和其他替代提议比，我最不喜欢这个，我觉得它没有什么价值。

一个 Hook 经过多次调用或者与其他 Hook 冲突之后，代码可能 *意外产出* 非唯一或合成无效密钥进行传递。更糟糕的是，如果它是在某些条件下发生的(我们会试图 「修复」 它对吧？)，可能在一段时间后才发生冲突。

我们想提醒大家，记住所有通过密钥来标记的 custom hooks 都很脆弱，它们不仅增加了运行时的工作量(别忘了它们要转成 *密钥* )，而且会渐渐增大 bundle 大小。**但如果说我们非要提醒一个问题，是哪个问题呢**？

如果非要在条件判断里声明 state 和 effects，这种方法可能是有作用的，但按过去经验来说，我发现它令人困惑。事实上，我不记得有人会在条件判断里定义`this.state`或者`componentMount`的。

这段代码到底意味着什么？

```jsx{3,4}
// ⚠️ 这不是 React Hooks API
function Counter(props) {
  if (props.isActive) {
    const [count, setCount] = useState('count');
    return (
      <p onClick={() => setCount(count + 1)}>
        {count}
      </p>;
    );
  }
  return null;
}
```

当 `props.isActive` 为 `false` 时 `count` 是否被保留？或者由于 `useState('count')` 没有被调用而重置 `count`？

如果条件为保留 state，effect 又会发生什么？

```jsx{5-8}
// ⚠️ 这不是 React Hooks API
function Counter(props) {
  if (props.isActive) {
    const [count, setCount] = useState('count');
    useEffect(() => {
      const id = setInterval(() => setCount(c => c + 1), 1000);
      return () => clearInterval(id);
    }, []);
    return (
      <p onClick={() => setCount(count + 1)}>
        {count}
      </p>;
    );
  }
  return null;
}
```

无疑它不会在 `props.isActive` 第一次是 `true` *之前* 运行，但一旦变成 `true`，它会停止运行吗？当 `props.isActive` 转变为 `false` 时 interval 会重置吗？如果是这样，effect 与 state(我们说不重置时) 的行为不同令人困惑。如果 effect 继续运行，那么 effect 外层的 `if` 不再控制 effect，这也令人感到困惑，我们不是说我们想要基于条件控制的 effects 吗？  

如果在渲染期间我们没有「使用」 state 但 它却被重置，如果有多个 `if` 分支包含 `useState('count')` 但只有其中一个会在给定时间里运行，会发生什么？这是有效的代码吗？如果我们的核心思想是 「以密钥分布」，那为什么要 「丢弃」 它？开发人员是否希望在这之后从组件中提前 `return` 以重置所有 state 呢？ 其实如果我们真的需要重置state，我们可以通过提取组件使其明确：

```jsx
function Counter(props) {
  if (props.isActive) {
    // 清晰地知道它有自己的 state
    return <TickingCounter />;
  }
  return null;
}
```

无论如何这可能成为是解决这些困惑问题的「最佳实践」，所以不管你选择哪种方式去解释，我觉得条件里 *声明* state 和 effect 的语义怎样都很怪异，你可能会不知不觉的感受到。

如果还要提醒的是 —— 正确地组合密钥的需求会变成「负担」，它并没有给我们带来任何想要的。但是，放弃这个需求(并回到最初的提案)确实给我们带来了一些东西，它使组件代码能够安全地复制粘贴到一个 custom hook 中，且不需要命名空间，减小 bundle 大小及轻微的效率提升(不需要Map查找)。

慢慢理解。

### 缺陷 #7：Hooks 之间无法传值

Hooks 有个最好的功能就是可以在它们之间传值。

以下是一个选择信息收件人的模拟示例，它显示了当前选择的好友是否在线：

```jsx{8,9}
const friendList = [
  { id: 1, name: 'Phoebe' },
  { id: 2, name: 'Rachel' },
  { id: 3, name: 'Ross' },
];

function ChatRecipientPicker() {
  const [recipientID, setRecipientID] = useState(1);
  const isRecipientOnline = useFriendStatus(recipientID);

  return (
    <>
      <Circle color={isRecipientOnline ? 'green' : 'red'} />
      <select
        value={recipientID}
        onChange={e => setRecipientID(Number(e.target.value))}
      >
        {friendList.map(friend => (
          <option key={friend.id} value={friend.id}>
            {friend.name}
          </option>
        ))}
      </select>
    </>
  );
}

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);
  const handleStatusChange = (status) => setIsOnline(status.isOnline);
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });
  return isOnline;
}
```

当改变收件人时，`useFriendStatus` Hook 就会退订上一个好友的状态，订阅接下来的这个。

这是可行的，因为我们可以将 `useState()` Hook 返回的值传给 `useFriendStatus()` Hook：

```jsx{2}
  const [recipientID, setRecipientID] = useState(1);
  const isRecipientOnline = useFriendStatus(recipientID);
```

Hooks之间传值非常有用。例如：[React Spring](https://medium.com/@drcmda/hooks-in-react-spring-a-tutorial-c6c436ad7ee4)可以创建一个尾随动画，其中多个值彼此「跟随」：

```jsx
  const [{ pos1 }, set] = useSpring({ pos1: [0, 0], config: fast });
  const [{ pos2 }] = useSpring({ pos2: pos1, config: slow });
  const [{ pos3 }] = useSpring({ pos3: pos2, config: slow });
```

(这是 [demo](https://codesandbox.io/s/ppxnl191zx)。)

在Hook初始化时添加默认参数或者将Hook写在装饰器表单中的提议，很难实现这种情况的逻辑。

如果不在函数体内调用 Hooks，就不可以轻松地在它们之间传值了。你可以改变这些值结构，让它们不需要在多层组件之间传递，也可以用 `useMemo` 来存储计算结果。但你也无法在 effects 中引用这些值，因为它们无法在闭包中被获取到。有些方法可以通过某些约定来解决这些问题，但它们需要你在心里「核算」输入和输出，这违背了 React 直接了当的风格。

在 Hooks 之间传值是我们提案的核心，Render props 模式在没有 Hooks 时是你最先能想到的，但像 [Component Component](https://ui.reach.tech/component-component) 这样的库，是无法适用于你遇到的所有场景的，它由于「错误的层次结构」存在大量的语法干扰。Hooks 用扁平化层次结构来实现传值 —— 且函数调用是最简单的传值方式。

### 缺陷 #8：步骤繁琐

有许多提议处于这种范畴里。他们尽可能的想让React摆脱对 Hooks 的依赖感，大多数方法是这么做的：让 `this` 拥有内置 Hooks，使它们变成额外的参数在React中无处不在，等等等。

我觉得 [Sebastian的回答](https://github.com/reactjs/rfcs/pull/68#issuecomment-439314884) 比我的描述，更能说服这种方式，我建议你去了解下「注入模型」。

我只想说这和程序员倾向于用 `try`/`catch` 捕获方法中的错误代码是一样的道理，同样对比 AMD由我们自己传入 `require` 的「显示」声明，我们更喜欢 `import`(或者 CommonJS `require`) 的 ES模块。

```jsx
// 有谁想念 AMD？
define(['require', 'dependency1', 'dependency2'], function (require) {
  var dependency1 = require('dependency1'),
  var dependency2 = require('dependency2');
  return function () {};
});
```

是的，AMD 可能更「诚实」 的陈述了在浏览器环境中模块不是同步加载的，但当你知道了这个后，写 `define`三明治 就变成做无用功了。

`try`/`catch`、`require`和 React Context API都是我们更喜欢「环境」式体验，多于直接声明使用的真实例子(即使通常我们更喜欢直爽风格)，我觉得 Hooks 也属于这种。

这类似于当我们声明组件时，就像从 `React` 抓个 `Component` 过来。如果我们用工厂的方式导出每个组件，可能我们的代码会更解耦：

```jsx
function createModal(React) {
  return class Modal extends React.Component {
    // ...
  };
}
```

但在实际中，这最后会变得多此一举而令人厌烦。当我们真的想以某种方式抓React时，我们应该在模块系统层面上实现。


