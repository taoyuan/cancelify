cancelify
=========

[![NPM Version](https://img.shields.io/npm/v/cancelify.svg?style=flat)](https://www.npmjs.org/package/cancelify)
[![Build Status](http://img.shields.io/travis/taoyuan/cancelify.svg?style=flat)](https://travis-ci.org/taoyuan/cancelify)

> A javascript library for making async operations cancelify

## Installation

```bash
$ npm install cancelify --save
```

## API

### cancelify([fn])

Returns a new cancelify:

```js
var cancelify = require('cancelify');

var cancelable = cancelify();
callAsyncOperation(arg1, arg2, arg3, cancelable.future);

setTimeout(function () {
    cancelable.cancel('Operation timed out');
}, 1000);
```

### cancelify.empty()

Returns an 'empty' cancelify future (one that will never be cancelled).

```js
var cancelify = require('cancelify');
function asyncOperation(arg1, arg2, arg3, callback) {
    callback = callback || cancelify.empty();

    // Continue with function knowing there is a cancelify future
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
