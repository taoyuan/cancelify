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

var cancelable = cancelify();
callAsyncOperation(arg1, arg2, arg3, cancelable.future());

setTimeout(function () {
    cancelable.cancel('Operation timed out');
}, 1000);
```

#### cancelify.possible()

Returns an 'empty' cancelify possible (one that will never be canceled).

```js
function asyncOperation(arg1, arg2, arg3, possible) {
    possible = possible || cancelify.possible();

    // Continue with function knowing there is a cancelable
}
```

### cancelable

#### cancelable.cancel()

Cancels the current async operations.

```js
var cancelify = require('cancelify');
var cancelable = cancelify(function (err, data) {
    if (err) throw err;
    console.log(data);
});

asyncOperation(arg1, arg2, arg3, cancelable.possible());

cancelable.cancel('canceled');
```

#### cancelable.canceled([callback])

If no arguments provide, returns true if the cancelable has been canceled:

```js
//In ES6
function asyncOperation(cancelable) {
  return spawn(function* () {
    while(!cancelable.canceled()) {
      yield NextAsyncOp();
    }
  })
}
```

If canceled with a callback, calls callback when the cancelable is canceled 
(this is probably currently the most useful of these methods).

```javascript
function get(url, possible) {
    var req = request(url, possible);

    possible.canceled(function (reason) {
        req.abort();
    });
}
```

#### cancelable.throwIfCanceled()

Throws the reason if the cancelable has been canceled:

```javascript
//In ES6
function asyncOperation(cancelable) {
    return spawn(function* () {
        while(true) {
            cancelable.throwIfCanceled()
            yield NextAsyncOp();
        }
    })
}
```

#### cancelable.possible()

Returns possible functions delegates cancelable:
* `canceled`
* `throwIfCanceled`

## License

Copyright (c) 2014 Tao Yuan. Licensed under the MIT license.
