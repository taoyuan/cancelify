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

### cancelify

#### cancelify()

Returns a new cancelify:

```js
var cancelify = require('cancelify');

var cancellable = cancelify();
callAsyncOperation(arg1, arg2, arg3, cancellable.future());

setTimeout(function () {
    cancellable.cancel('Operation timed out');
}, 1000);
```

#### cancelify.possible()

Returns an 'empty' cancelify possible (one that will never be cancelled).

```js
function asyncOperation(arg1, arg2, arg3, possible) {
    possible = possible || cancelify.possible();

    // Continue with function knowing there is a cancellable
}
```

### cancellable

#### cancellable.cancel()

Cancels the current async operations.

```js
var cancelify = require('cancelify');
var cancellable = cancelify(function (err, data) {
    if (err) throw err;
    console.log(data);
});

asyncOperation(arg1, arg2, arg3, cancellable.possible());

cancellable.cancel('canceled');
```

#### cancellable.cancelled([callback])

If no arguments provide, returns true if the cancellable has been cancelled:

```js
//In ES6
function asyncOperation(cancellable) {
  return spawn(function* () {
    while(!cancellable.cancelled()) {
      yield NextAsyncOp();
    }
  })
}
```

If cancelled with a callback, calls callback when the cancellable is cancelled 
(this is probably currently the most useful of these methods).

```javascript
function get(url, possible) {
    var req = request(url, possible);

    possible.cancelled(function (reason) {
        req.abort();
    });
}
```

#### cancellable.throwIfCancelled()

Throws the reason if the cancellable has been cancelled:

```javascript
//In ES6
function asyncOperation(cancellable) {
    return spawn(function* () {
        while(true) {
            cancellable.throwIfCancelled()
            yield NextAsyncOp();
        }
    })
}
```

#### cancellable.possible()

Returns possible functions delegates cancelable:
* `canceled`
* `throwIfCancelled`

## License

Copyright (c) 2014 Tao Yuan. Licensed under the MIT license.
