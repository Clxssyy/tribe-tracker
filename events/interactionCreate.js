const {
  Events,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');

const accountSchema = require('../schemas/account');

const update = require('../utils/update');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isButton()) {
      interaction.deferReply({ ephemeral: true });
      if (interaction.customId === 'login') {
        const data = await accountSchema.findOne({
          currentUser: interaction.user.tag,
        });
        if (data) {
          return interaction.editReply({
            ephemeral: true,
            content:
              "You're already logged in as **" +
              data.name +
              '**!\nPlease logout first!',
          });
        }

        let buttons = [];

        try {
          const accounts = await accountSchema.find();

          for (let i = 0; i < accounts.length; i++) {
            buttons.push(
              new ButtonBuilder()
                .setCustomId(`account${i}`)
                .setLabel(accounts[i].name)
                .setStyle(
                  accounts[i].available
                    ? ButtonStyle.Success
                    : ButtonStyle.Danger
                )
                .setDisabled(!accounts[i].available)
            );
          }
        } catch (error) {
          console.error('Error retrieving accounts:', error);
        }
        const row = new ActionRowBuilder().addComponents(buttons);

        interaction.editReply({
          ephemeral: true,
          content: 'Which account are you logging in as?',
          components: [row],
        });
      }

      if (interaction.customId === 'logout') {
        const data = await accountSchema.findOne({
          currentUser: interaction.user.tag,
        });

        if (!data) {
          return interaction.editReply({
            ephemeral: true,
            content: 'You are not logged in!',
          });
        } else {
          await accountSchema.findOneAndUpdate(
            { currentUser: interaction.user.tag },
            {
              available: true,
              lastUser: interaction.user.tag,
              currentUser: null,
              lastLogin: Date.now(),
            }
          );

          update(interaction);

          interaction.editReply({
            ephemeral: true,
            content: 'You have clocked out!',
          });
        }
      }

      if (interaction.customId === 'reload') {
        interaction.editReply({
          ephemeral: true,
          content: 'Reloading...',
        });

        update(interaction);
      }

      if (interaction.customId.startsWith('account')) {
        const data = await accountSchema.findOne({
          currentUser: interaction.user.tag,
        });
        if (data) {
          return interaction.editReply({
            ephemeral: true,
            content:
              "You're already logged in as **" +
              data.name +
              '**!\nPlease logout first!',
          });
        } else {
          await accountSchema.findOneAndUpdate(
            { name: interaction.component.label },
            {
              available: false,
              lastLogin: Date.now(),
              currentUser: interaction.user.tag,
              lastUser: interaction.user.tag,
            }
          );

          update(interaction);

          interaction.editReply({
            ephemeral: true,
            content: `You have logged in as **${interaction.component.label}**!\nPlease logout when you're done.`,
          });
        }
      }
    }

    if (interaction.isChatInputCommand()) {
      if (interaction.user.tag !== 'clxssy.') {
        return;
      }

      const command = interaction.client.commands.get(interaction.commandName);

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error('[ERROR] ', error);
      }
    }
  },
};
