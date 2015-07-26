/**
 * Created with IntelliJ IDEA.
 * User: ksheehan
 * Date: 4/17/13
 * Time: 9:25 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Module dependencies.
 */
var util = require('util');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var InternalOAuthError = require('passport-oauth').InternalOAuthError;
var config = require('../../config/acme_config.js');


function Strategy(options, verify) {
    options = options || {};

    OAuth2Strategy.call(this, options, verify);

    this.name = config.loginStrategy;
}

/**
 * Inherit from `OAuthStrategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


Strategy.prototype.userProfile = function(accessToken, done) {
    this._oauth2.useAuthorizationHeaderforGET(true);

    this._oauth2.get(config.oauth_profile_url, accessToken, function (err, body, res) {
        if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

        try {

            var json = JSON.parse(body);
            var parsed = JSON.parse(json);

            var profile = { provider: config.loginStrategy };

            // TODO: resolve case username vs userName
            // acme is using userName
            profile.userName = parsed.username;
            profile.firstname = parsed.firstname;
            profile.lastname = parsed.lastname;
            profile.groups = parsed.groups;

            profile._raw = json;
            profile._json = parsed;

            done(null, profile);
        } catch(e) {
            done(e);
        }
    });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;