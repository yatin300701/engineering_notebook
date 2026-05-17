---
title: Prototype chain and Inheritance
description: Everything about prototype chain and interview questions in js
tags: ["JavaScript"]
pubDate: 2026-05-16
heroImage: ../../assets/blogs/prototype-chain-and-inheritance.png
---

# Prototype

Every JS object has an internal [[Protoype]] property (accessed via **proto** or Object.getPrototypeOf()). This prototype is itself an object that can have its own prototype, creating a chain.

```
const obj = {}
console.log(Object.PrototypeOf(obj) === Object.prototype) // true
console.log(obj.__proto__ === Object.prototype) // true
```

### Function and constructor functions

Every function has a prototype property. This is NOT same as the [[Prototype]] of the function itself.
The prototype property is used when the function is called as a constructor with new.

```
function User(name){
    this.name = name
}
console.log(User.prototype) // {constructor: User}
console.log(User.__proto__) // {[Function]}
const user = new User("Alice")
console.log(Object.getPrototypeOf(user) == User.prototype) // true
```

#### Key Distinction

> Function.prototype - Property on the function itself (used for inheritance)
> obj.**proto** - Internal [[Prototype]] reference

A function's prototype is an object used to share methods and properties across all instances created by the function when used as constructor

eg

```
function Car(model){
    this.model = model // unique to each instance
}

Car.prototype.drive = function(){
    console.log(this.model + " is driving!");
}

const car1 = new Car("Tesla")
const car2 = new Car("Ford")

car1.drive()
car2.drive()

// Both use the same 'drive' function in memory.
```

### Prototype Lookup

When you access a property of an object, JS searches :

1. The object itself
2. Its [[Prototype]]
3. The prototype's [[Prototype]]
4. Continue chain untill null

### Object creation methods

| Method                 | Description                                                         | Sets `[[Prototype]]`    | Explanation                                                                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new Constructor()`    | Creates an object using a constructor function or class             | `Constructor.prototype` | When `new` is used, JavaScript internally creates a new object and links its hidden `[[Prototype]]` to `Constructor.prototype`. This is how instances inherit methods from the constructor’s prototype. |
| `Object.create(proto)` | Creates an object with a custom prototype                           | `proto` parameter       | `Object.create()` directly lets you choose what the prototype should be. It does not call a constructor. Useful for manual prototype chaining and inheritance control.                                  |
| `{}` or `new Object()` | Creates a plain object                                              | `Object.prototype`      | Regular object literals automatically inherit from `Object.prototype`, which provides common methods like `toString()`, `hasOwnProperty()`, etc.                                                        |
| `Object.assign()`      | Copies enumerable properties from source objects to a target object | Not affected            | `Object.assign()` only copies properties. It does not modify or replace the target object's `[[Prototype]]`. The prototype remains whatever it originally was.                                          |

### hasOwnProperty vs in operator

```
const obj = Object.create({inherited: true}) // created an empty obj and assigned its prototype to obj passed to it ie {inherited: true}....
obj.own = true // created a key own in this obj


console.log(obj.hasOwnProperty('own')) // true
console.log(obj.hasOwnProperty('inherited')) // false (does not loopup in chain)

console.log('own' in obj) //true
console.log('inheritd' in obj) // true (looks up in chain)
```

##### Use hasOwnPropertyp() or Object.prototype.hasOwnProperty.call() to check own and inheritred properties

#### When you set a property on an object, you create an own property that shadows the inherited one

```
const proto = {method:"from proto"}
const obj = Object.create(proto)

console.log(obj.method) // "from proto"

obj.method = "from obj"

console.log(obj.method) // "from obj"

delete obj.method

console.log(obj.method) // "from proto" - back to inheritance
```

### Inheritance Patterens

1. Constructor Inheritance (Function.prototype.call)

```
function Animal(name){
    this.name = name
}

function Dog(name,breed){
    Animal.call(this, name) // copies parent's own properties
    this.breed = breed;
}

Dog.prototype = Object.create(Animal.prototype)
Dog.prototype.constructor = Dog

Dog.prototype.bark = function(){
    return this.name + " barks"
}

const dog = new Dog("Max","Golden")
// this becomes, const dog ={}; Dog.call(dog,'Max','Golden') -> inside ->Animal.call(dog,'Max') -> dog.name = "Max"
// Animal.call() copies properties created inside constructor , not fully ie prototype methods
// so to link Dog.prototype = Object.create(Animal.prototyp) -> Dog.prototyp -> Animal.prototype
// After this Dog.prototype.constructor is also ref Animal
// So we change it back to Dog -> Dog.prototype.constructor = Dog
console.log(dog.name) // Max
console.log(dog.bark()) // Max Barks
```

```
dog
 ├── name: "Max"
 ├── breed: "Golden"
 │
 └── [[Prototype]]
       ↓
    Dog.prototype
       ├── bark()
       │
       └── [[Prototype]]
             ↓
          Animal.prototype
                ↓
          Object.prototype
```

2. Object Create Pattern

```
const Animal = {
    speak(){
        return this.name + " speaks"
    }
}

const dog = Object.create(Animal)
dog.name = "Buddy"
dog.bark = function(){
    return this.name + " barks"
}


console.log(dog.speaks()) // Buddy speaks
console.log(dog.bark()) // Buddy barks
```

3. Prototype Delegation

```
const canEat(){
    eat(){
        return  this.name + " eats"
    }
}
const canWalk(){
    walk(){
        return this.name + " walks"
    }
}

function Dog(name){
    this.name = name
}

Object.assign(Dog.prototype,canEat,canWalk)

// Object.assign() copies properties from one or more source objects into a target object.

const dog = new Dog("Rex")
console.log(dog.eat()) // "Rex eats"
console.log(dog.walk()) // "Rex walks"
```

4. Factory functions

```
function createDog(name, breed){
    return {
        name,
        breed,
        bark(){
            return this.name + " barks"
        }
    }
}
const dog = createDog("Max","Golden")
console.log(dog.bark()) // Max barks
```

### ES6 Classes

ES6 classes are syntactic sugar over prototype-based inheritance. They still use prototypes under the hood.

### Important Questions

Q. How does instancof actually works ?

A. instanceof checks if Constructor.prototype appears anywhere in the object's prototype chain.

```
    function Animal(){}
    funcation Dog(){}

    Dog.prototype = Object.create(Animal.prototype)

    const dog = new Dog()

    console.log(dog instanceof Dog) // true
    console.log(dog instanceof Animal) // true
    console.log(dog instanceof Object) // true
```

#### Instanceof checks prototype chain and not the actual constructor that created the object

```
class User {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(this.name);
  }
}

class Admin extends User {
  greet() {
    console.log("Admin: " + this.name);
  }
}

const admin = new Admin("Alice");
// there is no constructor in Admin, so js automatically one , so no need to do super()

admin.greet(); // "Admin: Alice"

const greetFn = admin.greet;
greetFn(); // undefined (or error in strict mode) as this is determined how its called , not where defined

// Solution 1: Bind
const greetBound = admin.greet.bind(admin);
greetBound(); // "Admin: Alice"

// Solution 2: Arrow function
const User2 = class {
  constructor(name) {
    this.name = name;
    this.greet = () => console.log(this.name);
  }
};

const user2 = new User2("Bob");
const fn = user2.greet;
fn(); // "Bob" - arrow function preserves 'this' read this blog
```

Q. Create Object.create polyfill
A.

```
Object.create = function(proto){
    function f(){}
    f.prototype = proto
    return new f()
}

// use

const parent = {greet:()=>"hello"}
const child = Object.create(parent)
console.log(child.greet()) // hello
```

Q. What's the difference between class inheritance and prototype delegation?

A. Class inheritance is class links its proto to parent class.
While in prototype delegation , object don't have a property and it delegates lookup to anther object

Prototype delegation

```
const animal = {
    eat(){
        console.log("eat")
    }
}

const dog = Object.create(animal)
dog.eat()
```

Class Inheritance

```
class Animal{
    eat(){
        console.log("eat")
    }
}

class Dog extends Animal{}
```

Dog.prototype = Object.create(Animal.prototype)

Q. Custom bind
A.

```
Function.prototype.myBind = function(obj, ...args){
    const originalFn = this; // refers to function calling it Greet

    return function(...laterArgs){
        return originalFn.apply(
            obj,
            [...args,laterArgs]
        )
    }
}

function greet(city, country) {
    console.log(
        this.name + " from " + city + ", " + country
    );
}

const user = {
    name: "Yash"
};

const boundFn = greet.myBind(user, "Delhi");

boundFn("India");
```
