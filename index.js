'use strict';

var form =  require('./lib/withForm')
module.exports = form.default;
exports.isRequired =  form.isRequired;
exports.maxLength =  form.maxLength;
exports.minLength =  form.minLength;
exports.email =  form.email;