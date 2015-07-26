/**
 * Created with IntelliJ IDEA.
 * User: ksheehan
 * Date: 3/13/13
 * Time: 1:52 PM
 * To change this template use File | Settings | File Templates.
 */

var config = require('../../config/acme_config.js');
var passport = require('passport');
var EplusStrategy = require('../passport-eplus').Strategy;
var moment = require( 'moment' );

ProviderLogin = function () {
    console.log("ProviderOauthLogin initializing.");
};

ProviderLogin.prototype.serializeUser = function(user, done) {
    done(null, user.id);
};

ProviderLogin.prototype.deserializeUser = function(obj, done) {
    done(null, obj);
};


ProviderLogin.prototype.passportStrategy = new EplusStrategy({
        authorizationURL: config.oauth_authorize,
        tokenURL: config.oauth_token,
        clientID: config.oauth_clientID,
        clientSecret: config.oauth_clientSecret,
        callbackURL: config.oauth_callbackURL,
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
        req.session.passport.accessToken = accessToken;
        req.session.passport.refreshToken = refreshToken;

        // TODO: Remove logging before release!

//        console.log( "passport EplusStrategy: refreshToken:  " + refreshToken );
//        console.log( "passport EplusStrategy: accessToken:  " + refreshToken );
        console.log( "passport EplusStrategy: callback at:  " + moment().format()  );
        console.log( "passport EplusStrategy: profile:  " + JSON.stringify( profile )  );

        var userRole = "unauthorized";
        var user = null;
        var found = false;
        var i = 0;

        for (found, i = profile.groups.length; i && !(found = profile.groups[--i] === config.admin_role_ad););

        if (found) {

            console.log( "passport EplusStrategy Admin role found" );

            userRole = config.admin_role;
        } else {
            for (found, i = profile.groups.length; i && !(found = profile.groups[--i] === config.agent_role_ad););
            if (found) {
                console.log( "passport EplusStrategy Agent role found" );
                userRole = config.agent_role;
            }
        }

        console.log('passport EplusStrategy role ' + userRole);

        if (found) {
            user = { userName: profile.userName, firstname: profile.firstname, lastname: profile.lastname, role: userRole };

            console.log ('passport EplusStrategy user %j' , user);

            req.session.passport.user = user;
        }

        return done(null, user);
    }
);

ProviderLogin.prototype.appAll = function(req, res, next){

    if(req.isAuthenticated()){
        next();
    }else{
        passport.authenticate('EnergyPlus', { scope: config.oauth_scope },
            function(err, user) {
                if (err) {
                    return next(err)
                }
                if (!user) {
                        var redirectUrl = config.oauth_auth_server  + '/Account/LogOff?returnUrl=' + config.oauth_callbackURL + "unauthorized";
                        //console.log('appAll !user - ' + redirectUrl);
                        res.redirect(redirectUrl);
                } else {
                    next();
                }
            })(req, res, next);
    }
};

ProviderLogin.prototype.postLogin = function(req, res) {
    res.redirect('/');
};

ProviderLogin.prototype.postLoginCallback = function(req, res) {
    res.redirect('/');
};

ProviderLogin.prototype.logout = function(req, res){
    //console.log('logout - ' + req.isAuthenticated());
    req.logout();
    //console.log('logout - ' + req.isAuthenticated());
    var redirectUrl = config.oauth_auth_server  + '/Account/LogOff?returnUrl=' + config.oauth_callbackURL;
    //console.log('logout - ' + redirectUrl);
    res.redirect(redirectUrl);
};


exports.ProviderLogin = ProviderLogin;




