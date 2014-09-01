cancellable
===========

[![NPM Version](https://img.shields.io/npm/v/cancellable.svg?style=flat)](https://www.npmjs.org/package/cancellable)
[![Build Status](http://img.shields.io/travis/taoyuan/cancellable.svg?style=flat)](https://travis-ci.org/taoyuan/cancellable)
[![Dependencies](https://img.shields.io/david/taoyuan/cancellable.svg?style=flat)](https://david-dm.org/taoyuan/cancellable)

> A javascript library for making async operations cancellable

## Installation

```bash
$ npm install cancellable --save
```

## API

### cancellable([fn])

Returns a new cancellable:

```js
var cancellable = require('cancellable');

var fn = cancellable();
callAsyncOperation(arg1, arg2, arg3, fn.future);

setTimeout(function () {
    fn.cancel('Operation timed out');
}, 1000);
```

### cancellable.empty()

Returns an 'empty' cancellable future (one that will never be cancelled).

```js
var cancellable = require('cancellable');
function asyncOperation(arg1, arg2, arg3, callback) {
    callback = callback || cancellable.empty();

    // Continue with function knowing there is a cancellable future
}
```

### future.cancelled([callback])

If no arguments provide, returns true if the future has been cancelled:

```js
//In ES6
function asyncOperation(future) {
  return spawn(function* () {
    while(!future.cancelled()) {
      yield NextAsyncOp();
    }
  })
}
```

If cancelled with a callback, calls callback when the future is cancelled 
(this is probably currently the most useful of these methods).

```javascript
function get(url, future) {
    var req = request(url, future);

    future.cancelled(function (reason) {
        future(reason);
        req.abort();
    });
}
```

### future.throwIfCancelled()

Throws the reason if the future has been cancelled:

```javascript
//In ES6
function asyncOperation(future) {
    return spawn(function* () {
        while(true) {
            future.throwIfCancelled()
            yield NextAsyncOp();
        }
    })
}
```

## License

Copyright (c) 2014 Tao Yuan  
Licensed under the MIT license.
