var getSlug = require('speakingurl')
  , _ = require('underscore');

var Formatter = {};

Formatter.offers = function (offers) {
  if(offers){
    return offers.map(function (item) {
      var o = item.offer
      return {
        id : o.id,
        offerName: o.offername,
        shortName: o.offershortname,
        categoryId: o.categoryid,
        price: o.price,
        images: o.thumbnail,
        links: o.links,
        seller: {
          id: o.seller.id,
          name: o.seller.sellername,
          images: o.seller.thumbnail,
          rating: o.seller.rating,
          links: o.seller.links,
          contacts: o.seller.contacts
        }
      }
    })
    .filter(function (p) {
      return p !== null
    });
  } else {
    return [];
  }
};

Formatter.products = function (products) {
  if(products){
    return products.map(function (item) {
      var p = item.product;

      return {
        product: {
          id: p.id,
          name: p.productname,
          shortName: p.productshortname,
          slug: getSlug(p.productshortname),
          category: {
            id: p.categoryid
          },
          totalSellers: p.totalsellers,
          numOffers: p.numoffers,
          minPrice: p.pricemin,
          maxPrice: p.pricemax,
          currency: p.currency.abbreviation,
          images : p.thumbnail,
          rating : p.rating,
          link: p.links,
          specification: p.specification
        }
      }
    }).filter(function (p) {
      return p !== null;
    });
  }else {
    return [];
  }
};

Formatter.category = function(category) {
  return [{
    id: category.id,
    name: category.name,
    images: category.thumbnail,
    links: category.links,
    filter: category.filters
  }];
}

Formatter.topProducts = function (products) {
  if(products){
    return products.map(function (p) {
      return {
        product: {
          id: p.id,
          name: p.productName,
          shortName: p.productShortName,
          slug: getSlug(p.productShortName),
          category: {
            id: p.categoryId,
            name: p.categoryName,
            slug: getSlug(p.categoryName),
          },
          totalSellers: p.totalSellers,
          numOffers: p.numOffers,
          minPrice: p.priceMin,
          maxPrice: p.priceMax,
          currency: p.currency.abbreviation,
          images : p.thumbnail,
          rating : p.rating,
          link: _.where(p.links.link, { type: 'xml'}),
          specification: _.where(p.specification.links.link, { type: 'xml'})
        }
      }
    })
    .filter(function (p) {
      return p !== null
    });
  } else {
    return [];
  }
};

Formatter.metadata = function(m) {
  return {
    metadata: {
      totalpages : m.totalpages,
      page: m.page,
      totalResultsReturned: m.totalresultsreturned,
      totalResultsAvailable: m.totalresultsavailable,
      details: m.details
    }
  };
};

module.exports = Formatter;
