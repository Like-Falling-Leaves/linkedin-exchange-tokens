# linkedin-exchange-tokens

A simple function to exchange the short-lived OAuth2 token provided by the LinkedIn JSAPI to a long-lived OAuth token that can be used by the server to make REST api calls.

This mechanism is described in this [linked-in documentation](https://developer.linkedin.com/documents/exchange-jsapi-tokens-rest-api-oauth-tokens)

This module also has a way to make REST API calls to linked in though that can be done using other modules as well.

[![NPM info](https://nodei.co/npm/linkedin-exchange-tokens.png?downloads=true)](https://npmjs.org/package/linkedin-exchange-tokens)


## Install

    npm install linkedin-exchange-tokens


## Usage

```javascript

   var exchangeTokens = require('linkedin-exchange-tokens');
   var options = {
     'public': 'Your Linked In API Key',
     'secret': 'Your Linked In API Secret'
   };

   // now assume your browser JS code calls the server with its OAuth2 token
   // alternatively, this could be from OAuth2 passportjs flow
   var oauth2Token = '<token from browser JSAPI: for example: IN.ENV.auth.oauth_token>';
   exchangeTokens(options, oauth2Token, function (err, tokenInfo) {
     // now tokenInfo is the oauth1 token info 
     // {
     //   'public': 'auth_token', 
     //   secret: 'oauth_token_secret', 
     //   expires: 'time when token expires'
     // }
     // You can use this to make rest calls as follows

     tokenInfo.api('/v1/people/~/connections, {}, function (err, info) {
       // boom!
     });
   });

```

You can also make REST calls with this API using OAuth1.0 tokens.


```javascript

   var exchangeTokens = require('linkedin-exchange-tokens');
   var options = {
     'public': 'Your Linked In API Key',
     'secret': 'Your Linked In API Secret'
   };

   // assume you have saved the tokenInfo from the previous example
   // into the database and want to use it to make REST calls later

   exchangeTokens.makeTokenInfo(options, tokenInfo)
     .api('/v1/people/~/connections', {}, function (err, info) {
        // boom!
     });

```

## Environment variables

You can pass the linked in API key and secret via *environment variables* instead of via the *options* parameter.

* LIN_API_KEY -- set this to the public API key
* LIN_API_SECRET -- set this to the API secret 