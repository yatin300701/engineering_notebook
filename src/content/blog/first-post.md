---
title: Understanding JavaScript Closures
description: A deep dive into JavaScript closures, how they work internally, and where they are useful in real-world applications.
tags: ["javascript"]
pubDate: 2026-03-15
heroImage: ../../assets/blog-placeholder-about.jpg
---

Closures are one of the most important concepts in JavaScript, but also one of the most misunderstood. Many developers use closures without fully understanding what is happening under the hood.

In this article we will explore:

- What closures actually are
- How JavaScript creates closures
- Why closures exist
- Real-world use cases
- Common pitfalls

## What is a Closure?

A **closure** is created when a function remembers the variables from its **lexical scope** even after the outer function has finished executing.

In simpler terms:

> A closure allows a function to access variables from its outer scope even after that outer function has returned.

Example:

```javascript
function outer() {
  const message = "Hello from closure";

  function inner() {
    console.log(message);
  }

  return inner;
}

const fn = outer();
fn();
```
