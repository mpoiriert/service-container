/**
 * Construct a Builder object
 */
module.exports = (function () {
    const Builder = require('./lib/Builder');
    // Create an instance of the builder with the proper dependencies injected
    return new Builder(
        require('fs'),
        require,
        require('./lib/Container'),
        require('./lib/Definition')
    );
}());