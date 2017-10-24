var _ = require('underscore');

var Helpers = function () {
};

Helpers.prototype.isEmail = function (email) {
    return _.isString(email) && /^[a-zA-Z]\S*@\S+.\S+/.test(email);
};

Helpers.prototype.isMobile = function (mob) {
    return /[0-9]{10}/.test(mob);
};

Helpers.prototype.ispassword = function(pword) {
    return pword.length >= 6;
};

Helpers.prototype.isPincode = function (pincode) {
    return /[1-9][0-9]{5}/.test(pincode);
};

module.exports = new Helpers();