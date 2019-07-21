const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  stock: String,
  IP: [String],
  likes: Number
});

var Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;