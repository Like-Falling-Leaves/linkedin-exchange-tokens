var OAuth = require('oauth-1.0a');
var request = require('request');
var querystring = require('querystring');

module.exports = exchangeTokens;
module.exports.makeTokenInfo = makeTokenInfo;

function exchangeTokens(options, oauth2Token, done) {
  options = options || {};
  var oauthOptions = {
    consumer: { 
      public: options.linkedinKey || process.env.LIN_API_KEY,
      secret: options.linkedinSecret || process.env.LIN_API_SECRET
    },
    signature_method: 'HMAC-SHA1'
  };
  var oauth = OAuth(oauthOptions);
  var accessUrl = 'https://api.linkedin.com/uas/oauth/accessToken';
  data = {method: 'POST', url: accessUrl + '?xoauth_oauth2_access_token=' + encodeURIComponent(oauth2Token)};
  request.post({form: oauth.authorize(data), url: accessUrl}, function (err, res, body) {
    if (err) return complete(err);
    var token = querystring.parse(body || '');
    if (token.oauth_problem || !token.oauth_token || !token.oauth_token_secret) {
      return complete(token.oauth_problem || 'Auth Error');
    }
    return complete(null, makeTokenInfo(options, {
      public: token.oauth_token, 
      secret: token.oauth_token_secret, 
      expires: Date.now() + token.oauth_expires_in*1000
    }));
  });
  
  function complete(err, result) {
    if (done) done(err, result);
    done = null;
  }
}

function makeTokenInfo(options, tokenInfo) {
  var token = Object.create(tokenInfo);
  Object.defineProperty(token, 'api', {
    value: api.bind(token, options, token),
    enumerable: false,
    writable: true,
    configurable: true
  });
  return token;
}

function api(options, token, url, params, done) {
  if (typeof(params) == 'function') {
    done = params;
    params = null;
  }

  if (url.toLowerCase().indexOf('http') !== 0) {
    if (url[0] != '/') url = '/' + url;
    if (url.indexOf('/v1') !== 0) url = '/v1' + url;
    url = 'http://api.linkedin.com' + url;
  }

  options = options || {};
  var oauthOptions = {
    consumer: { 
      public: options.linkedinKey || process.env.LIN_API_KEY,
      secret: options.linkedinSecret || process.env.LIN_API_SECRET
    },
    signature_method: 'HMAC-SHA1'
  };
  var oauth = OAuth(oauthOptions);
  var data = {url: url, method: params ? 'POST' : 'GET'};
  data.headers = oauth.toHeader(oauth.authorize(data, token));
  data.headers['x-li-format'] = 'json';
  if (params) data.headers['Content-Type'] = 'application/json';
  if (params) data.body = JSON.stringify(params);
  request(data, function (err, response, body) {
    if (err) return done(err);
    try {
      var ret = JSON.parse(body || '{}');
    } catch (e) {
      return done(e);
    }
    return done(null, ret);
  });
  return this;
}
