var _ = require('underscore');

var Utils = function () {
};

Utils.prototype.isEmail = function (email) {
    return _.isString(email) && /^[a-zA-Z]\S+@\S+.\S+/.test(email);
};

Utils.prototype.isMobile = function (mob) {
    return /[0-9]{10}/.test(mob);
};

Utils.prototype.isValidPassword = function (password) {
    return _.isString(password) && (password.length > 7);
};

Utils.prototype.isPincode = function (pincode) {
    return /[1-9][0-9]{5}/.test(pincode);
};

module.exports = new Utils();