---
title: Everything about 'this'
description: All important cases, and interview preparations for js 'this' keyword
tags: ["JavaScript"]
pubDate: 2026-05-9
heroImage: ../../assets/blogs/js-variables.png
---

# Everything about 'this' keyword

### What is 'this'

this refers to the execution context - the object that is currently calling the function.

- object executing the current function
- its not fixed and is determined at **call time**, not at **definition time**(except for arrow functions)
- its and to : "who called this function?"

```
    const user = {
        name: "Alice",
        greet(){
            console.log(this.name);
        }
    }
    user.greet()
```

** Alice ** - called by user at runtime (last line)

### In global scope

this is ** window ** (browser) or ** global ** (Node.js).
In strict mode, it's undefined

### Implicit binding

When a function is called as a method of an object, 'this' is that object

```
const car = {
    brand: "Toyota",
    getBrand(){
        return this.brand;
    }
}

console.log(car.getBrand())

// Lost Binding
const fn = car.getBrand;
console.log(fn())
```

** Toyota ** - object before . in this is car
** undefined ** - no object behind fn , so check global

### Explicit Binding

call(), apply(), bind() let you manually set what this refers to

** call(thisArg,agr1,agr2) ** - invokes immediately, args passed individually
** apply(thisArg, [args]) ** - invokes immediately, args passed as array
** bind(thisArg) ** - returns NEW function with 'this' permanently bound

```
function greet(greeting){
    return `${greeting}, I am {this.name} `
}

const alice = { name: "Alice"};
const bob = {name: "Bob"};

greet.call(alice,"Hello")
greet.apply(alice,["Hello"])

const greetAlice = greet.bind(alice)
greetAlice("Hey")

```

** Hello, I am Alice **
** Hello, I am Bob **
** Hey, I am Alice **

### New Keyword

When a function is called with new, this refers to the newly created object.

- JS creates a new empty object
- Sets 'this' to new object
- executes the function body
- returns 'this'

```
function Person(name,age){
    this.name = name;
    this.age = age;
}

const alice = new Person("Alice",30)
console.log(alice.name) // "Alice"
console.log(alice.age) // 30


// ES6 Class (same behaviour under the hood)

class Dog{
    constructor(name){
        this.name = name; // this = new Dog instance
    }
}
const d = new Dog("Rex")
console.log(d.name) // Rex
```

### Arrow Functions

Arrow functions don't have their own this - they inherit from their enclosing lexical scope

- these are lexically bound
- don't create their own this , capture from surrounding this at run time
- this makes them good for callback but not for method

```
   cosnt timer = {
       name: "MyTimer",
       start(){
           setTimeout(()=>{
               console.log(this.name)
           },1000)
       }
   }
   timer.start()
```

MyTimer

```
   const obj = {
       name:"Test",
       getName:()=>{
           console.log(this.name) // undefined - captured global this
       }
   }

   obj.getName() // getName is arrow - so no obj  instead its global
```

```
const fn = () =>console.log(this)
fn.call({x:1}) // still outer this not {x:1}
```

- Arrow functions ignore any attempt to set this via call, apply or bind

### Binding rules

when multiple binding rules apply

** new fn()** > \*\* call(), bind(), apply() > obj.fn > global or undefined in strict

```
   function show(){
       console.log(this.x)
   }

   // Priority demo

   const obj = { x:1, show}
   const bound = show.bind({x:2})

   obj.show()  // 1
   bound()     // 2

   function Foo(){
       this.x = 99
   }
   const bound2 = Foo.bind({x:50})
   const instance  = new bound2() // new > explicit
   console.log(instance.x) // 99
```

### this in classes

In class methods, this refers to the instance. But callbacks still loose this

```
 class Counter{
    count = 0;

    // Regular method  - loses call back
    increment(){
        this.count++;
    }

    // Arrow class field - this is always the instance
    descrment = ()=>{
        this.count --;
    }
 }

 const c = new Counter()
 c.increment() // works

 const inc = c.increment;
 inc()  // as call back breaks - this refers to global - if dont want to loose obj, use bind in constuctor

 const dec = c.decrement
 dec() // works - this refers to class
```

### Tricky questions

Nested function looses this

```
const obj = {
   name:"obj",
   outer(){
       function inner(){
           console.log(this.name) // undefined
       }
       inner()
       const fixed = () => console.log(this.name) /. obj
       fixed()
   }
}
```

IFFI loses this

```
 const obj2 ={
    name:"test1",
    run(){
        (function(){
            console.log(this) // global / undefined
        })()
    }
 }
```
