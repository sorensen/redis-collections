
Redis Collections
=================

[![Build Status](https://secure.travis-ci.org/sorensen/redis-collections.png)](http://travis-ci.org/sorensen/redis-collections)



Usage
-----

```js
var Collections = require('redis-collections')
  , redis = require('redis')
  , db = redis.createClient()
  , collection = new Collections()
```


Example
-------


Methods
-------

### instance.setbit(key, offset, value, [callback])

Pass-through to the redis [SETBIT](http://redis.io/commands/bitop) command.

* `key` - redis key
* `offset` - bit offset
* `value` - bit value (1 / 0)
* `callback` - standard callback (optional)

**Alias**: [`set`]

```js
bmap.setbit('test', 2, 1, function(err, previous) {
  previous === 0 // true
})
```


Install
-------

With [npm](https://npmjs.org)

```
npm install redis-collections
```


License
-------

(The MIT License)

Copyright (c) 2013 Beau Sorensen <mail@beausorensen.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.