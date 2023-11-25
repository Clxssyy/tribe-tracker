const displaySchema = require('../schemas/display');
const accountSchema = require('../schemas/account');
const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction) => {
  const display = await displaySchema.findOne({
    guildId: interaction.guild.id,
  });
  const message = await interaction.channel.messages.fetch(display.messageId);

  const accounts = await accountSchema.find();

  const fields = [
    { name: 'Account', value: '\u200B', inline: true },
    { name: 'Status', value: '\u200B', inline: true },
    { name: 'Last Activity', value: '\u200B', inline: true },
  ];

  for (let i = 0; i < accounts.length; i++) {
    let date = accounts[i].lastLogin;
    let hoursSinceLastLogin = '';

    if (!date) {
      hoursSinceLastLogin = 'Never';
    } else {
      const lastLoginTime = new Date(date);
      const currentTime = new Date();
      const timeDifference = Math.abs(currentTime - lastLoginTime);
      hoursSinceLastLogin = Math.floor(timeDifference / (1000 * 60 * 60));
      hoursSinceLastLogin = `${hoursSinceLastLogin} hours ago`;
    }

    const user = interaction.guild.members.cache.find(
      (member) => member.user.tag === accounts[i].lastUser
    );

    let username = '';

    if (user) {
      username = user.user.displayName;
    }

    fields.push(
      { name: accounts[i].name, value: '\u200B', inline: true },
      {
        name: accounts[i].available ? ':white_check_mark:' : ':no_entry:',
        value: '\u200B',
        inline: true,
      },
      {
        name: user ? username : accounts[i].lastUser,
        value: `${hoursSinceLastLogin}`,
        inline: true,
      }
    );
  }

  const response = await new EmbedBuilder()
    .setColor(0x6ab7dd)
    .setTitle('Tribe Activity')
    .setDescription(
      `Click the buttons below to clock in or out!\n\nOnly works if you use it correctly!`
    )
    .addFields(fields)
    .setTimestamp();

  message.edit({
    embeds: [response],
  });
};
