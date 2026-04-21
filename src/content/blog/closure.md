---
title: Closure
description: Working of closure in JavaScript and some interview questions based on that
tags: ["JavaScript"]
pubDate: 2026-04-22
heroImage: ../../assets/blogs/closure.png
---

- combination of a function bundled together (enclosed) with references to its own surrounding state (the lexical environment)
- it gives inner fn access to outer function's scope even after the outer function has finished executing
- GC does not clean it as inner function has reference/pointer to it

```js
function createBank() {
  let balance = 0;

  return {
    deposit: function (amount) {
      balance += amount;
    },
    checkBalance: function () {
      return balance;
    },
  };
}

const myAccount = createBank();
myAccount.deposit(100);
console.log(myAccount.deposit(100));
console.log(myAccount.checkBalance());
console.log(myAccount.balance);
```

→ undefined 200 undefined

---

```js
for (var i = 1; i <= 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, 1000);
}
```

→ 4 4 4

As 'var' makes i global variable, so after timeout when it needs to print i, it has already been updated bby i++ to 4

---

```js
for (let i = 1; i <= 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, 1000);
}
```

→ 1 2 3

As "let" is block scope

## To reclaim memory set value of inner function to null

- use `let` inner = outer
- as `let` inner = null
