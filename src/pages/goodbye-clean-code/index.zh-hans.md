---
title: 'Goodbye, Clean Code'
date: '2020-01-11'
spoiler: Let clean code guide you. Then let it go.
---

那是一个深夜。

我的同事刚刚检查完他们花了一整个周所完成的代码。当时我们正在做一个图形编辑器，已经实现了通过拖动边缘的小手柄来调整矩形和椭圆形等形状的功能。

代码运行起来没问题。

但是代码里有很多重复的地方。每个形状（例如矩形或椭圆形）都有一组不同的手柄，当我们沿不同方向拖动手柄时，它们会以不同的方式影响形状的位置和大小。如果用户按住Shift键，我们还需要在调整大小的同时保持比例
。这里面有很多数学计算。

代码看起来像这样：

```javascript
let Rectangle = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
};

let Oval = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeTop(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeBottom(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
};

let Header = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },  
}

let TextBlock = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
};
```
这些重复的代码让我非常困扰。

*这些代码一点都不整洁。*

大部分的重复代码存在于相似方向的拖拽上。举个例子，`Oval.resizeLeft()`和`Header.resizeLeft()`有相似之处，因为它们都需要处理左侧把手的拖拽。

还有一些重复代码存在于同一个形状的方法中。举个例子，`Oval.resizeLeft()`和其他的`Oval`方法有相似之处。这是因为他们都在处理椭圆形。同样的道理，在矩形、页头和文本框中也存在这个问题，因为它们都是矩形。

*我想到了一个办法！*

我们可以通过这样的方式，把重复的代码都抽离出来：
```javascript
let Directions = {
  top(...) {
    // 5 unique lines of math
  },
  left(...) {
    // 5 unique lines of math
  },
  bottom(...) {
    // 5 unique lines of math
  },
  right(...) {
    // 5 unique lines of math
  },
};

let Shapes = {
  Oval(...) {
    // 5 unique lines of math
  },
  Rectangle(...) {
    // 5 unique lines of math
  },
}
```
然后组织它们的行为：
```javascript
let {top, bottom, left, right} = Directions;

function createHandle(directions) {
  // 20 lines of code
}

let fourCorners = [
  createHandle([top, left]),
  createHandle([top, right]),
  createHandle([bottom, left]),
  createHandle([bottom, right]),
];
let fourSides = [
  createHandle([top]),
  createHandle([left]),
  createHandle([right]),
  createHandle([bottom]),
];
let twoSides = [
  createHandle([left]),
  createHandle([right]),
];

function createBox(shape, handles) {
  // 20 lines of code
}

let Rectangle = createBox(Shapes.Rectangle, fourCorners);
let Oval = createBox(Shapes.Oval, fourSides);
let Header = createBox(Shapes.Rectangle, twoSides);
let TextBox = createBox(Shapes.Rectangle, fourCorners);
```
代码总量减少一半，并且重复代码全部消失了！好整洁。如果要更改特定方向或形状的行为，只需要在一个地方进行修改，不需要像以前那样把所有方法都更新一遍。

已经很晚了（睡意逐渐让我分心）。我把重构后的代码合并到了主分支，然后满怀着清理完同事的凌乱代码而产生的自豪感，进入了梦乡。

## 第二天早上

... 好像有点不对劲

老板把我叫出去进行了一次面对面交谈，他很礼貌的让我把昨晚的代码还原回去。我懵了，因为我坚信上一版的代码一团糟，而我的非常整洁！

我很勉强的答应了，但却一直心有不甘。直到很多年后，我才明白了其中的道理。

## 这是一个阶段

痴迷于"整洁的代码"和"消除重复"是我们许多人都会经历的一个阶段。当我们对自己的代码不够自信时，就很容易将自我价值感和专业自豪感附加到可以衡量的事物上。比如一系列的严格lint规则、命名规范、文件结构、禁止重复等。

刚开始你可能并不清楚如何清理重复代码，但是随着实践增多你会越来越得心应手。渐渐地，你可以判断出在每一次代码更改后，代码的重复度到底是增多了还是减少了。结果，年轻的我们就会觉得，消除重复代码就是在提升代码的质量。更糟糕的是，这种想法会跟人们的自我认同感交织在一起："我就是那种会写整洁代码的人"。这种想法就像任何一种自我欺骗一样，如此的强烈。

一旦我们知道了何为[抽象](https://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction)，就会按耐不住想要去提升这种能力，以至于每当看到重复代码就会去凭空提取一些抽象出来。经过几年的"磨练"，我们终于做到了——目光所及之处，全都是有待抽象的重复代码。如果有人对我们说抽象是一种美德，那我们一定会跟他做同志了。然后一起去批判那些不崇尚"整洁代码"的人。

现在我明白了，我的"重构"从两个方面来说是一场灾难：

* 首先，我没有跟写下它们的人交谈过。我在没有他们参与的情况下，独自重写了代码并合并进了主分支。即使这是一项改进（其实并不是），这也不是解决问题的好办法。健壮的工程团队最重要的是建立起信任。在项目协作开发中，没有和同事深入讨论就去重写他们的代码，对我们的团队协作能力是一个巨大的打击。

* 其次，没有什么是免费的。我的代码牺牲了应对需求变化的能力，换来了更少的重复代码，但这其实不是一个好买卖。例如，后来我们针对不同形状的不同手柄，新增了许多特殊的情景和行为。我的抽象必须用数倍的复杂度去完成这些需求，而对于原来凌乱的版本，这样的改动跟切蛋糕一样容易。

我是在说你应该写"脏乱"的代码吗？不，我建议你深入思考一下何为"整洁"何为"脏乱"。你感受到过"反叛"？"正义"？"美丽"？"优雅"吗？你怎么确定你能把这些精神品质映射到具体的工程成果呢？它们究竟如何影响编写和[修改代码](/optimized-for-change/)的方式呢？

我能肯定的是我自己对这些事情没有深思过。我仅仅对代码的外观进行了很多思考，但却没有考虑过它们是如何从一个团队中形成的。

编码是一段旅程。考虑一下你从写下第一行代码至今所经历的事情。我猜，当你第一次抽离出一个函数或者重构了一个类，并让代码变得更简单的时候，你当时一定很开心。如果你对自己的技术感到自豪，就去追求代码的整洁性。先这样做一段时间吧。

但是不要停在那里。不要成为一个整洁代码的狂热者。整洁的代码从来不是最终目标。而是一种从正在处理的系统的巨大复杂性中获得某种意义的尝试。这是一种防御机制，当你不确定你的更改会对项目产生怎样的影响时，你可能需要一些指导。

Let clean code guide you. **Then let it go.**
