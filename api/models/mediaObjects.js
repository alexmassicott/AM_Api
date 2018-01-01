'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var mediaSchema = new Schema({
  Created_date: {
    type: Date,
    default: Date.now
  },
  url: {
    type: String,
    default: null
  }

});

module.exports = mongoose.model('Images', mediaSchema);
