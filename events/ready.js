const { Events } = require('discord.js');
const mongoose = require('mongoose');

const mongoDB = process.env.MONGODB;

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    await mongoose.connect(mongoDB);

    if (mongoose.connect) {
      console.log('Connected to MongoDB');
    }

    console.log(`Logged in as ${client.user.tag}`);
    console.log(`Servers (${client.guilds.cache.size}):`);
    console.log(
      client.guilds.cache.forEach((guild) => console.log(guild.name))
    );
    client.user.setPresence({
      activities: [{ name: 'wack a mole' }],
      status: 'online',
    });
  },
};
