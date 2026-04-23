const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  gender: String,
  bodyType: String,
  style: String,
  category: String, // top / bottom
  imageUrl: String
});

module.exports = mongoose.model('Outfit', outfitSchema);