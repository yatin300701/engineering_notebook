---
title: Execution Context JS
description: Everything about execution context. Types of execution context, how it works, why it is important, and how to use it effectively.
tags: ["javascript"]
pubDate: 2026-04-08
heroImage: ../../assets/blogs/js-ec.png
---

# Execution Context (JS Internals)

Execution context is the **environment where JavaScript code runs**.

Think of it as:

> A sandbox holding everything needed to execute code.

---

## Types of Execution Context

There are 3 main types:

1. **Global Execution Context (GEC)**
2. **Function Execution Context (FEC)**
3. **Eval Execution Context** (rare)

---

## Global Execution Context (GEC)

- Created when JS file starts running
- Runs inside an **execution environment**
- Stored in memory with everything needed

### What gets created?

- Global object
- Variables
- Functions

# Function Execution Context (FEC)

Each function call creates a new, independent execution context, even for the same function.

## What Gets Created Inside FEC?

During the creation phase, the engine sets up:

### 1. Arguments Object _(for non-arrow functions)_

```js
function test(a, b) {
  console.log(arguments);
}
test(1, 2);
```

### 2. Lexical Environment

- Parameters
- `let` / `const`
- Inner functions

### 3. Variable Environment

- `var` declarations

### 4. `this` Binding

- Depends on how the function is called

### 5. Outer Reference

- Link to parent scope (used for scope chain)

---

## Key Points

- Created at function invocation
- Destroyed after execution (unless closures retain it)
- Enables:
  - Local scope
  - Closures
  - Recursion

---

## Eval Execution Context

An Eval Execution Context is created when `eval()` executes code from a string.

```js
eval("var x = 10");
```

### Key Points

- Executes code at runtime
- Can modify existing scope (direct eval)
- Can run in global scope (indirect eval)
- Rarely used in real-world applications

### Why It Is Avoided

- Breaks predictable scoping
- Security risks (code injection)
- Prevents engine optimizations

> **Avoid using `eval()` in production code.**

---

## How JS Runs (High Level)

JS runs in two phases:

### 1. Creation Phase _(Memory Phase)_

- Memory allocated
- `var` → initialized as `undefined`
- `let` / `const` → declared but uninitialized (Temporal Dead Zone)
- Functions → stored completely
- Scope chain established

### 2. Execution Phase

- Code executes line by line
- Variables get assigned actual values
- Functions are invoked

---

## Inside Execution Context

Every execution context contains:

| Component                | Purpose                                                               |
| ------------------------ | --------------------------------------------------------------------- |
| **Variable Environment** | Holds `var` declarations                                              |
| **Lexical Environment**  | Holds `let`/`const`, parameters, inner functions, and outer reference |
| **`this` Binding**       | Reference to the current execution object                             |

---

## Lexical Environment (LE)

It contains:

- Variables and function declarations
- Reference to the outer environment (parent scope)

```
Lexical Environment = {
  Environment Record,
  Outer Reference
}
```

---
