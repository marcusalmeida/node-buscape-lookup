/**
 * Module dependencies
 */
var format = require('./lib/formatter')
  , helpers = require('./lib/helpers')
  , request = require('superagent')
  , _ = require('underscore');

// Endpoint template
var endpoint = _.template('http://<%=service%>/service/<%=method%>/<%=id%>/<%=country%>/');

var topProductsEndpoint = _.template('http://<%=service%>/service/v2/topProducts/<%=id%>/<%=country%>/');

module.exports = function (opts) {
  return new Buscape(opts);
};

var Buscape = function Buscape (opts) {
  // Use production by default
  if(opts.sandbox){
    this._service = 'sandbox.buscape.com.br';
  } else {
    this._service = 'bws.buscape.com.br';
  }

  // Allow keywords string in place of opts
  opts = 'string' === typeof opts ? {keywords: opts} : opts;

  if (opts.keywords) {
    this._keywords = opts.keywords;
  }

  if (opts.results) {
    this._resultsPerPage = opts.results;
  }
};

// Set application id
Buscape.prototype.id = function (id) {
  return this._id = id, this;
};

// Set source id, whatever the hell that is
Buscape.prototype.source = function (sourceId) {
  return this._sourceId = sourceId, this;
};

// Set Product id
Buscape.prototype.productId = function(productId) {
  return this._productId = productId, this;
}

// Set category
Buscape.prototype.categoryId = function(categoryId) {
  return this._categoryId = categoryId, this;
}

// Set price range
Buscape.prototype.price = function (price) {
  // Allow min..max style pricerange
  price = ('string' === typeof price) ? price.split('..') : price;

  if (price[0]) this._minPrice = price[0];
  if (price[1]) this._maxPrice = price[0];

  return this;
};

// Set search country
Buscape.prototype.country = function (country) {
  return this._country = country, this;
};

// Enable or disable test mode (make calls to the sanbox, rather than primary)
Buscape.prototype.test = function (test) {
  // Default test to true
  test = (arguments.length === 0 ? true : !!test)
  return this._service = test ? 'sandbox.buscape.com' : 'bws.buscape.com', this;
};

// Return a limited number of results
Buscape.prototype.limit = function (limit) {
  // Don't accept falsy or 0 limits
  if (!limit) return this;
  return this._limit = limit, this;
};

// Return only one result
Buscape.prototype.one = function (one) {
  // Default one to true
  one = (arguments.length === 0 ? true : !!one)
  return this._one = one, this;
};

// Set caller ip address
Buscape.prototype.client = function (ip) {
  return this._client = ip, this;
}

Buscape.prototype.page = function (page) {
  return this._page = page, this;
};

Buscape.prototype.order = function(orderBy) {
  return this._orderBy = orderBy, this;
};

Buscape.prototype.api = function(method) {
  return this._api = method, this;
};

Buscape.prototype.topProducts = function(topProducts) {
  return this._topProducts = topProducts, this;
};

Buscape.prototype.done = function (cb) {
  var limit = this._limit
    , one = this._one
    , buscape = this._buscape
    , seller = this._seller;

  if(this._topProducts){
    request
      .get(topProductsEndpoint({
        service: this._service,
        id: this._id,
        country: this._country || 'BR'
      }))
      .query({sourceId: this._sourceId})
      .query({categoryId: this._categoryId})
      .query({results: this._resultsPerPage})
      .query({page: this._page})
      .query({format: 'json'})
      .end(function (err, res) {
        if (err) return cb(err);

        // No products found
        if (!res.body.product) res.body.product = [];

        // Format results
        var formatted = format.topProducts(res.body.product);

        // Limit
        if (limit) {
          formatted = _.first(formatted, limit);
        }

        // One
        if (one) {
          formatted = _.first(formatted) || null;
        }

        return cb(null, formatted);
      }.bind(this));

  } else {
    request
      .get(endpoint({
        service: this._service,
        method: this._api,
        id: this._id,
        country: this._country || 'BR'
      }))
      .query({productId: this._productId})
      .query({categoryId: this._categoryId})
      .query(_.isArray(this._keywords) ? helpers.searchParams(this._keywords) : {keyword: this._keywords})
      .query({priceMin: this._minPrice})
      .query({priceMax: this._maxPrice})
      .query({clientIp: this._client})
      .query({sourceId: this._sourceId})
      .query({order: this._orderBy})
      .query({results: this._resultsPerPage})
      .query({page: this._page})
      .query({format: 'json'})
      .end(function (err, res) {
        if (err) return cb(err);

        // Not found
        if (!res.body.offer && !res.body.product && !res.body.category) res.body.offer = res.body.product = res.body.category = [];

        // Format results
        var formatted;

        if(this._api === 'findProductList'){
          formatted = format.products(res.body.product);
        } else if (this._api === 'findOfferList') {
          formatted = format.offers(res.body.offer);
        } else if(this._api === 'findCategoryList') {
          formatted = format.category(res.body.category);
        }

        // Limit
        if (limit) {
          formatted = _.first(formatted, limit);
        }

        // One
        if (one) {
          formatted = _.first(formatted) || null;
        }

        metadata = format.metadata(res.body);

        return cb(null, _.extend({results: formatted}, metadata));

      }.bind(this));
  }
};
