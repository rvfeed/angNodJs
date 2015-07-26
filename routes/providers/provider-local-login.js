/**
 * Created with IntelliJ IDEA.
 * User: ksheehan
 * Date: 3/13/13
 * Time: 1:52 PM
 * To change this template use File | Settings | File Templates.
 */

var config = require('../../config/acme_config.js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

users = [
    { id: 1, userName: 'acmetestwbadm', firstname: 'Amce', lastname: 'Admin',
        password: 'admin', email: 'ku@example.com', role: "ADMIN" },

    { id: 2, userName: 'mreppy.lh', firstname: 'Mikey', lastname: 'Reppy',
        password: 'admin', email: 'mx@example.com', role: "ADMIN" },

    { id: 3, userName: 'dcarder', firstname: 'Dave', lastname: 'Carder',
        password: 'jbond', email: 'mcarpenter@example.com', role: "AGENT" },

    { id: 4, userName: 'bcox', firstname: 'Brian', lastname: 'Cox',
        password: 'jbond', email: 'bc@example.com', role: "AGENT" },

    { id: 5, userName: 'acmetestwb', firstname: 'Acme', lastname: 'Agent',
        password: 'jbond', email: 'df@example.com', role: "AGENT" }

];




ProviderLogin = function () {
    console.log("ProviderLocalLogin initializing.");
};

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.

function findById(id, fn) {
    var idx = id - 1;
    if (users[idx]) {
        fn(null, users[idx]);
    } else {
        fn(new Error('User ' + id + ' does not exist'));
    }
}

ProviderLogin.prototype.serializeUser = function(user, done) {
    done(null, user.id);
};

ProviderLogin.prototype.deserializeUser = function(id, done) {
    findById(id, function (err, user) {
        done(err, user);
    });
};

function findByUsername(userName, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.userName === userName) {
            return fn(null, user);
        }
    }
    return fn(null, null);
};
// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a userName and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.

ProviderLogin.prototype.passportStrategy = new LocalStrategy(
    function(userName, password, done) {
        console.log('LocalStrategy 1');
        // asynchronous verification, for effect...
        process.nextTick(function () {
            console.log('LocalStrategy 1');

            // Find the user by userName.  If there is no user with the given
            // userName, or the password is not correct, set the user to `false` to
            // indicate failure and set a flash message.  Otherwise, return the
            // authenticated `user`.
            findByUsername(userName, function(err, user) {
                if (err) {
                    console.error( "error in local findByUsername " + err );
                    return done(err);
                }
                if (!user) {
                    console.error( "No user found for '" + userName +
                        "'." );

                    return done(null, false, { message: 'Unknown user ' + userName });
                }
                if (user.password != password) {
                    console.log( "password is invalid for '" + userName + "'." );
                    return done(null, false, { message: 'Invalid password' }); }
                return done(null, user);
            })
        });
    }
);

ProviderLogin.prototype.appAll = function (req, res, next) {
    if (req.isAuthenticated()) {
        console.log('all - auth - ' + req.isAuthenticated());
        next();
    } else {
        console.log('all - not auth - ' + req.isAuthenticated());
        res.render('login');
    }
};

ProviderLogin.prototype.postLogin = passport.authenticate(config.loginStrategy, { failureRedirect:'/' });

ProviderLogin.prototype.postLoginCallback = function (req, res) {
    console.log('login postLogin - ' + req.isAuthenticated());
    if(req.user.role=="ADMIN"){
        res.redirect("/#/listCampaigns");
    }else{
        res.redirect("/#/myCampaigns");
    }
};

ProviderLogin.prototype.logout = function(req, res){
    //console.log('logout - ' + req.isAuthenticated());
    req.logout();
    //console.log('logout - ' + req.isAuthenticated());
    res.redirect("/");
};


exports.ProviderLogin = ProviderLogin;




