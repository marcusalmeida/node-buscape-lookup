# buscape-lookup

## Introduction

This module is a simple wrapper around buscape's lomadee publisher api for node.

## Dependencies

* [superagent](http://github.com/visionmedia/superagent)
* [underscore](http://github.com/jashkenas/underscore)

## Usage examples

Full example:

```javascript
var buscape = require('buscape-lookup');

buscape({keywords: 'test'})
  .id('api key')
  .price('120..560')
  .country('BR')
  .limit(5)
  .done(function (err, result) {
    console.log(JSON.stringify(result));
  });
```

Limit to one result:

```javascript
var buscape = require('buscape-lookup');

buscape({keywords: 'test'})
  .id('api key')
  .one()
  .done(function (err, result) {
    console.log(JSON.stringify(result));
  });
```

Pass in keywords directly

```javascript
var buscape = require('buscape-lookup');

buscape('test')
  .id('api key')
  .done(function (err, result) {
    console.log(JSON.stringify(result));
  });
```

## LICENSE

MIT