/**
 * Handle direct messages to the Bot
 */
class ClientChannel {
  constructor(bot, client) {
    this.bot = bot;
    this.client = client;
    this.dmChannel = bot.users
      .fetch(client.id)
      .catch(() => null)
      .then((user) => {
        return user.createDM();
      });
  }
  handle(action) {
    return this.dmChannel.then(action);
  }
}

module.exports = ClientChannel;
