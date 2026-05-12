---
title: Everything about Event Loop in JS
description: All important cases, and interview preparations for js event loop
tags: ["JavaScript"]
pubDate: 2026-05-10
heroImage: ../../assets/blogs/event-loop.png
---

# Event Loop

### What is event loop ?

Js is ** single threaded ** . The event loop exits to handle async operations without blocking.

Event Loop mechanism:

1. Runs your sync code first ( call stack )
2. Offloads async work to Web APIs (browser / node)
3. Queues callbacks when async work completes
4. Picks from those queues when stack is empty

Its traffic controller

- Js drives one car at a time
- event loop manages the waiting lane

```
console.log("1. start")

setTimeout(()=>{
    console.log("3. Timeout")
},0)

Promise.resolve().then(()=>{
    console.log("2.5 - Promise")
})

console.log("2. End")
```

Output order

1. start
2. End
   2.5 - Promise - microtask runs BEFORE timeout
3. Timeout - macrotask runs last

### Call Stack

A LIFO stack that tracks which function is currently executing.

```
function c(){
    console.log("c")
}
function b(){
    c()
}
function a(){
    b()
}

a()
```

Stack frames:
top to bottom

- c
- b
- a
- global

Stack overflow - infinite recursion -> a function keeps calling itself without a base case, filling the stack until the
engine throws "Maximum call stack size exceeded"

### Web APIs / Node APIs

Browser / Node handles async work (timers, fetch, events) outside the JS thread

- JS itself has NO concept of timers, HTTP req or DOM events
- these are provided by host env
- Browser: setTimeout, fetch, addEventListner, localStorage
- NodeJs: fs, http, crypto, setTimeout

When you call setTimeout

1. JS hands if off to Web API
2. JS continues running - it does't wait
3. After 1000ms, the Web API pushes 'cb' to the Callback queue
4. The event loop picks it up when the stack is empty

So setTimeout - works after sync code

### Microtasks vs Macrotasks

Microtasks (Promises) always run before macrotasks (setTimeout).

- there are two queues of call back waiting to run

1. Microtask Queue (high priority)
   - Promise.then / catch finally
   - queueMicrotask()
   - mutationObserver
   - async / await - promised

2. Macrotask Queue / Task Queue (lower priority)
   - setTimeout , setInterval, setImmediate (nodeJs)
   - MessageChannel
   - DOM events (click...)
   - fetch callbacks

#### The rule

After each macrotask, the event loop drains the entire microtask queue before picking the next macrotask
Which is why promise feels faster then setTimeout

```
    console.log("1")

    setTimeout(()=>console.log("2 - macrotask))

    Promise.resolve()
    .then(()=>console.log("3 - microtask 1"))
    .then(()=>console.log("4 - microtask 2"))

    queueMicrotask(()=>console.log("5 - microtask 3"))

    console.log("6")
```

Output

1
6
3
4
5
2

### Microtask starvation

If microtasks keep adding more microtask, macrotask will never run.

### Async Await

Its a syntactic suger over Promises - await yields to the microtask queue

Await pauses the async function itself and yields contol back to the caller.
The Js thread continues with other sync code

```
console.log("START")

setTimeout(()=>{
    console.log("macrotask 1")
    Promise.resolve().then(()=>console.log("micro inside macro"))
},0)

setTimeout(()=>console.log(macrotask 2"),0)

Promise.reolve().then(()=>{
    console.log("microtask 1");
    return Promise.resolve();
})
.then(()=>console.log("microtask 2"))

console.log("END")
```

Output:

START
END
microtask 1
microtask 2
macrotask 1
micro inside macro
macrotask 2

> The promise microtask finishes, before the next macrotask is picked up

### NodeJs Event Loop

Node has extra phases:
timers -> I/O -> poll -> check (setImmediate) -> close. Plus process.nextTick

- uses **libuv** for its event loop, which has multiple phases

1. timers
   - setTimeout
   - setInterval
2. pending callbacks
   - I/O errors from pre iteration
3. idle / prepare
   - internal use
4. poll
   - retrieve new I/O events (blocking if queue empty)
5. check
   - setImmediate
6. close callbacks
   - socket.on('close')

Special: process.nextTick runs before ANY microtask - even before Promise callbacks

Priority:

process.nextTick > Promise.then > setImmediate > setTimeout

```
console.log("start")

setImmediate(()=>console.log("setImmediate"))

setTimeout(()=> console.log("setTimeout"),0);

Promise.resolve().then(()=>console.log("Promise"))

process.nextTick(()=>console.log("nextTick"))

console.log("end")
```

Output

start
end
nextTick
Promise
setTimeout
setImmediate
