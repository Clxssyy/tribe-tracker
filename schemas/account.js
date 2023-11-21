const { model, Schema } = require('mongoose');

let accountSchema = new Schema({
  name: String,
  available: Boolean,
  lastLogin: Date,
  currentUser: String,
  lastUser: String,
});

module.exports = model('account', accountSchema);
