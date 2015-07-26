// Dependencies:
// global install of mocha (npm install -g mocha)

var assert = require('assert');
var Provider = require('../../routes/providers/provider-mongodb').Provider;
var config = require('../../config/acme_config');

var db = null;

describe('providerMongoDbSpec.js', function () {

    before(function (done) {
        db = new Provider(config.mongodb_name, config.mongodb_ip, config.mongodb_port);


        // TODO: Check docs for on open ready etc function
        setTimeout(function () {
            console.log("db init timeout running");

            done();

        }, 250);
    });

    describe('#getUserData()', function () {

        it('should give me data', function (done) {

//            console.log( "about to call db" );

            db.getUserData(function (err, data) {

//                console.log( "getuserdata test callback" );

                if (err) return done(err);

                assert.equal(data.length > 1, true, "data length");

                return done();
            });
        }); // end of it


        it('should have bcox user in all users' +
            '', function (done) {

//            console.log( "about to call db" );

            db.getUserData(function (err, data) {

//                console.log( "getuserdata test callback" );

                if (err) return done(err);

                for (var i = 0; i < data.length; i++) {
                    if (data[i].userName === 'bcox') {

                        var user = data[i];
                        return checkUser(user, done);
                    }
                }

                return done("never found user");
            });
        }); // end of it

    }); // end of get userdata describe


    describe('#getUserDataForUserName()', function () {

        it('should give me user data for a good user', function (done) {

            var userName = 'bcox';

            db.getUserDataForUserName(userName, function (err, data) {

                if (err) return done(err);

                assert.equal(data.length, 1, "data length");

                var user = data[0];

                return checkUser(user, done);
            });
        }); // end of it


        it('should give me no user data for a bad user', function (done) {

            var userName = 'i really hope this is not a valid userName';

            db.getUserDataForUserName(userName, function (err, data) {

                if (err) return done(err);

                assert.equal(data.length, 0, "data length");

                return done();
            });
        }); // end of it


    }); // end of getUserDataForUserName describe


    describe('#updateUserGridData()', function () {

        // TODO: insert a user but for now it's fine to use the mikey user
        var userName = 'mreppy.lh';

        // Test data only.  As sravanthi's been figuring out with the rules, it appears
        // only ok to save a field with '$' in the field name if the field is in an object which is
        // in an array.

        // userData.user.configuration.grid[{'$test':'foo'}] is ok

        // userData.user.configuration[0].grid:{'$test':'foo'} is NOT ok

        var gridConfiguration = [
            {
                '$test':'foobar',
                'pagingOptions':{
                    'pageSize':293},
                'pageSort':{
                    'field':'accountNumber',
                    'direction':'asc'
                }}
        ];

        // before each test insert an empty config item.
        beforeEach( function (done) {
            console.log( 'before each for #updateUserGridData()');
            db.updateUserGridData([], userName, function (err, data) {

                if (err) return done(err);
                console.log( 'before each update response ');

                assert.equal(data, 1, "db save result: '" + JSON.stringify( data ) +
                    "'");

                return done();
            });
        } );

        it('should report success', function (done) {

            db.updateUserGridData(gridConfiguration, userName, function (err, data) {

                if (err) return done(err);


                assert.equal(data, 1, "db save result");

                return done();
            });
        }); // end of it


        it('should save grid config', function (done) {

            db.updateUserGridData(gridConfiguration, userName, function (err, data) {

                if (err) return done(err);

                assert.equal(data, 1, "db save result");

                db.getUserDataForUserName(userName, function (e2, data) {
                    if (e2) return done(e2);

                    // TODO rename configxxx to configuration after fixing filter storage and testing

                    assert.deepEqual(gridConfiguration, data[0].configxxx.grid,
                        'Grid data saved for user ' + JSON.stringify(data));

                    return done();
                });

            });
        }); // end of it


    }); // end of updateUserGridData describe


}); // end of provider describe


function checkUser(user, done) {
// example data
//                        var expectedUser = {
//                            "department" : "Development",
//                            "description" : "Technology - Quality Assurance Analyst",
//                            "firstName" : "Brian",
//                            "fullName" : "Brian Oseredzuk",
//                            "isActive" : true,
//                            "lastName" : "Oseredzuk",
//                            "roles" : [
//                            "AGENT",
//                            "ADMIN"
//                        ],
//                            "userName" : "boseredzuk"
//                        };

    assert.equal(user.isActive, true, "isActive");
    assert.equal(user.firstName.length > 0, true, "some kind of first name");
    assert.equal(user.lastName.length > 0, true, "some kind of first name");
    assert.equal(user.fullName.length > 0, true, "some kind of first name");

    assert.equal(user.fullName.indexOf(user.firstName) >= 0, true,
        "full name contains first name");

    assert.equal(user.fullName.indexOf(user.lastName) >= 0, true,
        "full name contains first name");

    assert.equal(user.roles.length > 0, true,
        "user has roles");

    return done();
}