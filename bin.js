#!/usr/bin/env node

/**
 * Dependencies
 */
var buscape = require('./')
  , prettyjson = require('prettyjson')
  , nomnom = require('nomnom');

var options = {
  indent: 2
};

var opts = nomnom
  .script('buscape')
  .nocolors()
  .option('id', {
    abbr: 'i',
    required: true,
    help: 'Lomadee api key'
  })
  .option('api', {
    abbr: 'a',
    help: 'Method name for API (findProductList, findOffersList)'
  })
  .option('price', {
    abbr: 'p',
    help: 'Price range in the form <min>..<max>'
  })
  .option('source', {
    help: 'Set source id'
  })
  .option('country', {
    abbr: 'c',
    help: 'Country to query in'
  })
  .option('keywords', {
    abbr: 'k',
    required: true,
    help: 'Keywords to search'
  })
  .option('test', {
    abbr: 't',
    flag: true,
    help: 'Test mode'
  })
  .option('limit', {
    abbr: 'l',
    help: 'Limit number of returned products'
  })
  .option('one', {
    abbr: '1',
    help: 'Return only one product',
    flag: true,
    default: false
  })
  .option('client', {
    help: 'Set client ip'
  })
  .option('page', {
    help: 'Set page',
    abbr: 'p'
  })
  .option('category', {
    help: 'Set category id',
    abbr: 'cat'
  })
  .option('topProducts', {
    help: 'Set flag for top products',
    abbr: 'top'
  })
  .parse();

buscape({keywords: opts.keywords, results: 20})
  .id(opts.id)
  .country(opts.country)
  .test(opts.test)
  .one(opts.one)
  .limit(opts.limit)
  .source(opts.source)
  .client(opts.client)
  .topProducts(opts.topProducts)
  .api(opts.api)
  .page(opts.page)
  .categoryId(opts.category)
  .done(function (err, res) {
    console.log(prettyjson.render(res, options));
  });
