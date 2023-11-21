const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');

const displaySchema = require('../../schemas/display');
const accountSchema = require('../../schemas/account');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup the bot to work (resets previous setups).')
    .setDMPermission(false),
  async execute(interaction) {
    interaction.reply({ ephemeral: true, content: 'Setting up...' });

    const loginButton = await new ButtonBuilder()
      .setCustomId('login')
      .setLabel('Clock in!')
      .setStyle(ButtonStyle.Success);
    const logoutButton = await new ButtonBuilder()
      .setCustomId('logout')
      .setLabel('Clock out?')
      .setStyle(ButtonStyle.Danger);
    const reloadButton = await new ButtonBuilder()
      .setCustomId('reload')
      .setLabel('Reload')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(
      loginButton,
      logoutButton,
      reloadButton
    );

    const fields = [
      { name: 'Account', value: '\u200B', inline: true },
      { name: 'Status', value: '\u200B', inline: true },
      { name: 'Last Activity', value: '\u200B', inline: true },
    ];
    const accounts = await accountSchema.find();

    for (let i = 0; i < accounts.length; i++) {
      let date = accounts[i].lastLogin;
      let hoursSinceLastLogin = '';

      if (!date) {
        hoursSinceLastLogin = 'Never';
      } else {
        const lastLoginTime = new Date(date);
        const currentTime = new Date();
        const timeDifference = Math.abs(currentTime - lastLoginTime);
        hoursSinceLastLogin = Math.floor(
          timeDifference / (1000 * 60 * 60)
        );
        hoursSinceLastLogin = `${hoursSinceLastLogin} hours ago`;
      }

      fields.push(
        { name: accounts[i].name, value: '\u200B', inline: true },
        {
          name: accounts[i].available ? ':white_check_mark:' : ':no_entry:',
          value: '\u200B',
          inline: true,
        },
        {
          name: accounts[i].lastUser ? accounts[i].lastUser : 'No one',
          value: `${hoursSinceLastLogin}`,
          inline: true,
        }
      );
    }

    const response = await new EmbedBuilder()
      .setColor(0x6ab7dd)
      .setTitle('Tribe Activity')
      .setDescription(
        `Shared Account Status\n\nClick the buttons below to clock in or out!\n\nOnly works if you use it correctly!`
      )
      .addFields(fields)
      .setTimestamp();

    const sentMessage = await interaction.channel.send({
      embeds: [response],
      components: [row],
    });

    const messageId = sentMessage.id;

    const data = await displaySchema.findOne({ guildId: interaction.guildId });

    if (data) {
      await displaySchema.findOneAndUpdate(
        { guildId: interaction.guildId },
        {
          channelId: interaction.channelId,
          messageId: messageId,
        }
      );
    } else {
      await new displaySchema({
        guildId: interaction.guildId,
        channelId: interaction.channelId,
        messageId: messageId,
      }).save();
    }
  },
};
