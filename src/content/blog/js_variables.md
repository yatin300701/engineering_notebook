---
title: JS  Variables
description: Everything about JS variables. From scope, shadowing or important interview questions
tags: ["JavaScript"]
pubDate: 2026-04-11
heroImage: ../../assets/blogs/js-variables.png
---

JS uses three keywords to declare variables such as `let`, `var`, `const`. Each with different rules for scope (where variable lives) & hoisting (how engine "sees" from the variable before code runs).

## Feature Comparison

| Feature       | var                                | let           | const         |
| ------------- | ---------------------------------- | ------------- | ------------- |
| Scope         | Function                           | Block         | Block         |
| Hoisting      | Hoisted (initialized as undefined) | Hoisted (TDZ) | Hoisted (TDZ) |
| Reassignment  | Allowed                            | Allowed       | No            |
| Redeclaration | Allowed                            | Not           | Not           |

**TDZ** – the period before entering a scope and the actual line where a `let` or `const` variable is declared. If you try to access them during this time, you get a `ReferenceError`.

---

```js
{
  var a = 10;
  let b = 20;
}

console.log(a, b);
```

-> 10 undefined

---

`const` has two more rules on `let`:

1. **Mandatory initialization** – can't declare a `const` without assigning it a value immediately. (Syntax error)
2. **Assignment vs mutation** – prevents reassignment, but does not make data immutable always.

---

## The Global Object

The Global Object is the ultimate top-level container in JS. Everything that isn't inside a function or block is technically "global".

Its name:

- In browser – the global object is `window`
- In Node.js – is `global`

### Declaration

| Declaration    | Becomes property of window? |
| -------------- | --------------------------- |
| `var x = 1;`   | Yes (`window.x` is 1)       |
| `let y = 2;`   | No                          |
| `const z = 3;` | No                          |

- `var` adds variable in global scope
- `let` & `const` live in "Script" scope rather than polluting the window object

---

## Shadowing

Shadowing occurs when a variable declaration declared in an inner scope has the same name as a variable in an outer scope. The inner variable "shadows" or hides the outer one.

```js
let color = "red";
if (true) {
  let color = "blue";
  console.log("Inside", color);
}
console.log("outside:", color);
```

→ blue, red

---

### Key point in Lexical Scoping

- engine looks for a variable in the immediate scope first, if it doesn't find it, moves one level up

---

## Variable Shadowing with let, var

- `var` does not care about its block

```js
var x = 10;
if (true) {
  var x = 20;
  console.log(x);
}
console.log(x);
```

→ 20, 20

---

## Illegal Shadowing

- You can shadow a `var` with a `let`, but not `let` with `var` in same block

```js
let a = 10;
{
  var a = 20; // Illegal
}
```

- as it collides with same name in global

---

## Variable Environment & the Scope Chain

- when searching for a variable, JS follows Scope Chain:
  1. Looks in the lexical scope (current function or block)
  2. If not found, looks outer scope
  3. Keeps looking up till global
  4. If not found – reference error

---

## Auto-global

When you assign a value to a variable that has never been declared (no `var`, `let`, `const`), JS doesn't just throw an error immediately (unless in "strict mode").

It creates "Auto-global":

- if not found, add in global object
