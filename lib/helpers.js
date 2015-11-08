var _ = require('underscore');

var Helpers = {};

Helpers.productLink = function (links) {
  var productLink = _.find(links, function (l) {
    return l.link.type === 'offer' || l.link.type === 'product';
  });

  return productLink.link.url || null;
};

Helpers.searchParams = function(keywords) {
  var iteratee = function(memo, keyword) {
    if(_.indexOf(keywords, keyword) === 0){
      return keyword;
    } else {
      return memo + '+'+ keyword;
    }
  };
  return 'keyword= '+ _.reduce(keywords, iteratee, '').toString();
};

module.exports = Helpers;