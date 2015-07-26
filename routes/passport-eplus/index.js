/**
 * Created with IntelliJ IDEA.
 * User: ksheehan
 * Date: 4/17/13
 * Time: 9:24 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Module dependencies.
 */
var Strategy = require('./strategy');


/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports.Strategy = Strategy;