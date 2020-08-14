# @jsweb/worker

JavaScript module to parallel process data through dynamic multi-thread workers.

## Installation

### NPM or Yarn

The most common way used for the modern web applications development:

`npm i -S @jsweb/worker`

`yarn add @jsweb/worker`

And at your JS you can import the module that fits your environment:

```javascript
// ES6+ frontend web dev to use worker at the browser
import worker from '@jsweb/worker'

// ES6+ backend dev to use worker in Node.js
import worker from '@jsweb/worker/dist/node.mjs'

// CommonJS backend dev to use worker in Node.js
const worker = require('@jsweb/worker/dist/node.js')
```

Yes, it works in Node.js, but you must to import/require the correct module for your dev environment.

### CDN

If you prefer, you can get it directly from Unpkg CDN to use it in web frontend.

```html
<script src="https://unpkg.com/@jsweb/worker"></script>
```

By including the script in your page as traditional JS, the `jsWebWorker` function becomes available at the global scope.

This `main` exported module is in UMD format and targets browser.

But if you want to use a modern ES6+ module, you can do this:

```html
<script type="module">
  import worker from 'https://unpkg.com/@jsweb/worker/dist/browser.js'

  // Your code goes here...
</script>
```

## Usage example

```javascript
import worker from '@jsweb/worker'

let result

const data = [...aLotOfItemsHere]

worker(data)
  .env('two', 2)
  .map((item) => item.value ** self.env.two)
  .reduce((value, sum) => value + sum, 0)
  .finally((sum) => (result = sum))
```

**Important:**

Notice the `self` thing into the code!

Any function task running at the Worker must refer to the environment as `self` to access other context resources, except for globals.

## The `worker`

### Instance

The `worker` function returns a high level object instance that works like `Promise`, with `async` methods.

In fact, it uses a `Promise` internaly to guide the entire process data flow when methods are called.

You can chain or `async/await` them to get the results.

The `worker` instance receive 2 arguments:

1. data or value to process (required)
2. a number to setup concurrent threads to process data (optional)

```javascript
worker(data, 4).exec(...)
```

The worker tries to detect how much "hardware concurrency threads" are available to use, or use the default: `2`.

### Environment (scope)

At the browser, Workers run in parallel hardware threads, detached from main JS application thread.

It means you don't have access to all props and features available at the global JS scope.

If you need to know more about this, try to start here: [Web Workers API : Functions and interfaces available in workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#Functions_and_interfaces_available_in_workers).

At the Node.js environment, workers use `child_process`. To know more about this, go to [Node.js API: child_process](https://nodejs.org/api/child_process.html)

## Methods

All methods are asyncronous and return the `worker` instance to chain other methods, except the `.finally` method, that ends the flow `worker` and returns just a native `Promise`.

### .env(key, value)

Sets a Worker environment constant attached to 'self.env' object.

- `key` must to be a valid object key
- `value` can be any data to be available at Worker environment

Inside your tasks functions, you can refer to these constants through 'self.env' object.

```javascript
worker(data)
  .env('x', 5)
  .env('y', 25)
  .exec((value) => value * self.env.x * self.env.y)
```

### .imports(...args)

Imports code to use at Worker enviroment like functions or scripts.

Accepts any number of named functions or scripts URLs.

```javascript
const moment = 'https://momentjs.com/downloads/moment.min.js'

function howManyTimeAgo(dt) {
  return self.moment(dt).fromNow()
}

function ageCalc({ birthDate }) {
  return self.howManyTimeAgo(birthDate)
}

worker(data).imports(moment, howManyTimeAgo).exec(ageCalc)
```

It's just a "dumb" example... But it's important to remember about Worker scope!

### .unpkg(...args)

Import NPM modules from [UNPKG CDN](https://unpkg.com/) to use at Worker environment.

Accepts any number of string arguments to identify modules.

```javascript
function createKeysForAllItems(item) {
  item.key = self.randkey.uuid()

  return item
}

worker(data).unpkg('randkey').map(createKeysForAllItems)
```

### .exec(task)

Executes a task function in a single parallel thread.

```javascript
worker(data)
  .env('x', 5)
  .env('y', 25)
  .exec((value) => value * self.env.x * self.env.y)
```

### .map(task)

Executes a multi-thread `Array.map` method.

```javascript
worker(data)
  .env('two', 2)
  .map((item) => item.value ** self.env.two)
```

### .reduce(task, arg)

Executes a multi-thread `Array.reduce` method.

```javascript
worker(data).reduce((value, sum) => value + sum, 0)
```

### .filter(task)

Executes a single parallel thread `Array.filter` method.

```javascript
worker(data).filter((value) => value.includes('OK'))
```

### .sort(task)

Executes a single parallel thread `Array.sort` method.

```javascript
worker(data).sort((a, b) => a - b)
```

### .flatMap(task)

Executes a multi-thread `Array.flatMap` method.

```javascript
const data = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  // ...
]

worker(data)
  .env('two', 2)
  .faltMap((item) => item.value ** self.env.two)
```

### .then(task)

Promise-like async step.

Unlike the native `Promise.then`, which returns a `Promise`, this method returns the `worker` instance to chain another methods.

```javascript
worker(data)
  .filter((value) => value.includes('OK'))
  .then(doSomeThing)
```

### .finally(task)

Promise-like async **last** step.

Like the native `Promise.finally`, this method returns a `Promise` and stops the `worker` instance flow.

You can't chain other `worker` methods after this.

```javascript
worker(data)
  .filter((value) => value.includes('OK'))
  .then(doSomeThing)
  .finally(doLastThing)
```

## How this module works?

Coming soon...
