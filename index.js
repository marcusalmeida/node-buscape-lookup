/**
 * Module dependencies
 */
var request = require('superagent')
  , _ = require('underscore');

// Endpoint template
var endpoint = _.template('http://<%=service%>/service/<%=method%>/<%=id%>/<%=country%>/');

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
    this.mode = 'search';
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

// Set seller id
Buscape.prototype.seller = function (seller) {
  // Switch to buscape mode
  if (seller === 'buscape') return this._buscape = true, this;

  return this._seller = seller, this;
};

Buscape.prototype.page = function (page) {
  return this._page = page, this;
};

Buscape.prototype.order = function(orderBy) {
  return this._orderBy = orderBy, this;
};


Buscape.prototype.done = function (cb) {
  var limit = this._limit
    , one = this._one
    , buscape = this._buscape
    , seller = this._seller;

  request
    .get(endpoint({
      service: this._service,
      method: buscape ? 'findProductList' : 'findOfferList',
      id: this._id,
      country: this._country || 'BR'
    }))
    .query({categoryId: this._categoryId})
    .query({keyword: this._keywords})
    .query({priceMin: this._minPrice})
    .query({priceMax: this._maxPrice})
    .query({clientIp: this._client})
    .query({sourceId: this._sourceId})
    .query({order: this._orderBy})
    .query({allowedSellers: buscape ? null : this._seller})
    .query({format: 'json'})
    .query({page: this._page})
    .end(function (err, res) {
      if (err) return cb(err);

      // No offers found
      if (!res.body.offer && !res.body.product) res.body.offer = res.body.product = [];

      // Format results
      var formatted = buscape ? formatBuscape(res.body.product) : format(res.body.offer);

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
};

var format = function (products) {
  return products.map(function (product) {
    var p = product.offer
      , name = p.offername || p.offershortname
      , price = p.price.value
      , productId = p.productid
      , currency = p.price.currency.abbreviation
      , link = productLink(p.links)
      , thumb = p.thumbnail.url
      , seller = p.seller.id
      , sellerExtra = p.seller.extra
      , sellerName = p.seller.sellername
      , sellerThumbNail = p.seller.thumbnail.url
      , sellerRating = p.seller.rating.useraveragerating.rating
      , sellerComments = p.seller.rating.useraveragerating.numcomments
      , id = p.id;

    // Filter unusable results
    if (!p || !name || !price || !link) return null;

    return {
      id: id,
      seller: {
        id: seller,
        name: sellerName,
        extra: sellerExtra,
        thumb: sellerThumbNail,
        rating: {
          user_average_rating : {
            rating: sellerRating,
            num_comments: sellerComments
          }
        }
      },
      product: {
        id: productId,
        name: name,
        listPrice: price,
        currency: currency,
        url: link
      }
    }
  })
  .filter(function (p) {
    return p !== null
  });
};

var formatBuscape = function (products) {
  return products.map(function (product) {
    var p = product.product
      , name = p.productname || p.productshortname
      , price = p.pricemin || p.pricemax
      , offers = p.numoffers
      , currency = p.currency.abbreviation
      , link = productLink(p.links)
      , id = p.id;

    if (!p || !name || !price || !link) return null;

    return {
      name: name,
      listPrice: price,
      currency: currency,
      url: link,
      id: id
    }
  }).filter(function (p) {
    return p !== null;
  });
};

var productLink = function (links) {
  var productLink = _.find(links, function (l) {
    return l.link.type === 'offer' || l.link.type === 'product';
  });

  return productLink.link.url || null;
};
