const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: String,
  filepath: String,
  filetype: String,
});

module.exports = mongoose.model('File', fileSchema);