const { model, Schema } = require('mongoose');

let displaySchema = new Schema({
  guildId: String,
  channelId: String,
  messageId: String,
});

module.exports = model('display', displaySchema);
